# iscs.py  (Inter-Service Communication Service)
#
# This service sits between OrderService and the backend services.
# Its two jobs:
#   1. ROUTING  — inspect the path, forward to the right service
#   2. CACHING  — answer GET requests from Redis when possible,
#                 and invalidate cache entries on writes
#
# Why a separate service for this?
# It gives us one place to add load balancing, retries, circuit breaking,
# and caching — without touching UserService or ProductService at all.

import sys
import json
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
import httpx
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, Response

# ── Config ────────────────────────────────────────────────────────────────────

def _load_config() -> dict:
    if len(sys.argv) < 2:
        print("Usage: python iscs.py <config_path>")
        sys.exit(1)
    with open(sys.argv[1]) as f:
        return json.load(f)

CONFIG = _load_config()

# Build service URL lists from config.
# The config supports EITHER the old single-entry format:
#   "UserService": {"ip": "...", "port": ...}
# OR a new list format for multiple instances:
#   "UserService": [{"ip": "...", "port": ...}, {"ip": "...", "port": ...}]
#
# This is how we satisfy the A2 requirement: "the config file will then
# not just have a single IP and port, but lists of IP addresses and ports".

def _build_urls(key: str) -> list[str]:
    """Return a list of base URLs for a service, supporting single or list config."""
    entry = CONFIG[key]
    if isinstance(entry, list):
        return [f"http://{e['ip']}:{e['port']}" for e in entry]
    return [f"http://{entry['ip']}:{entry['port']}"]

USER_URLS    = _build_urls("UserService")
PRODUCT_URLS = _build_urls("ProductService")


# ── Round-robin load balancer ─────────────────────────────────────────────────
#
# When we have multiple instances of a service, we spread requests across them.
# Round-robin is the simplest strategy: instance 1, 2, 3, 1, 2, 3, ...
#
# This is what nginx does for OrderService at the front of the system.
# Here we do the same thing for UserService and ProductService internally.

class RoundRobin:
    def __init__(self, urls: list[str]):
        self.urls  = urls
        self.index = 0

    def next(self) -> str:
        url = self.urls[self.index]
        self.index = (self.index + 1) % len(self.urls)
        return url

user_balancer    = RoundRobin(USER_URLS)
product_balancer = RoundRobin(PRODUCT_URLS)


# ── Redis cache helpers ───────────────────────────────────────────────────────
#
# We store cached responses as strings in Redis under keys like:
#   "user:42"      → the JSON body of GET /user/42
#   "product:7"    → the JSON body of GET /product/7
#
# TTL (Time To Live) = 300 seconds = 5 minutes.
# After 5 minutes Redis auto-expires the key, forcing a fresh DB read.
# This bounds how stale cached data can get even if we miss an invalidation.

CACHE_TTL = 300  # seconds

redis_client = None  # initialised in lifespan


async def cache_get(key: str) -> str | None:
    """Return cached value or None if not found."""
    return await redis_client.get(key)


async def cache_set(key: str, value: str):
    """Store a value with TTL."""
    await redis_client.setex(key, CACHE_TTL, value)


async def cache_delete(key: str):
    """Remove a key — called after any write (create/update/delete)."""
    await redis_client.delete(key)


# ── Lifespan (replaces deprecated @app.on_event) ─────────────────────────────
#
# This is the modern FastAPI pattern. Everything before `yield` runs at startup,
# everything after `yield` runs at shutdown.
# The `@asynccontextmanager` decorator is what makes this work as a context manager.

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client

    r = CONFIG["Redis"]
    redis_client = aioredis.Redis(
        host=r["host"],
        port=r["port"],
        decode_responses=True,  # return strings, not bytes
    )
    await redis_client.ping()   # fail fast if Redis isn't reachable
    print("ISCS: Redis connected")

    yield  # ← server runs here

    await redis_client.aclose()
    print("ISCS: Redis connection closed")


app = FastAPI(lifespan=lifespan)


# ── Request forwarding ────────────────────────────────────────────────────────
#
# httpx.AsyncClient is the async equivalent of the `requests` library.
# We create ONE client and reuse it for all requests — this keeps a
# connection pool to the backend services alive, avoiding TCP handshake
# overhead on every forward.
#
# timeout=10.0 means: give up if a backend takes more than 10 seconds.

http_client = httpx.AsyncClient(timeout=10.0)


async def forward(method: str, url: str, body: bytes = b"", headers: dict = {}) -> httpx.Response:
    """Forward a request to a backend service and return its response."""
    if method == "GET":
        return await http_client.get(url)
    elif method == "POST":
        return await http_client.post(url, content=body,
                                       headers={"Content-Type": "application/json"})
    raise ValueError(f"Unsupported method: {method}")



# ── Cache flush endpoint (declared before catch-all) ─────────────────────────

@app.post("/cache/flush")
async def flush_cache():
    """Delete all keys from Redis. Called by OrderService during /wipe."""
    await redis_client.flushdb()
    print("ISCS: Redis cache flushed")
    return JSONResponse({"status": "flushed"})

# ── Main middleware ───────────────────────────────────────────────────────────

@app.api_route("/{path:path}", methods=["GET", "POST"])
async def route(request: Request, path: str):
    """
    Single catch-all route. Inspects the path and dispatches accordingly.
    
    Why one route instead of many? Because the ISCS is a proxy — its job is
    to forward, not to implement business logic. One handler keeps it simple.
    """

    full_path = "/" + path  # e.g. "/user/42" or "/product"
    method    = request.method
    body      = await request.body()

    # ── /user routes ─────────────────────────────────────────────────────────

    if full_path.startswith("/user"):

        if method == "GET":
            # Extract the ID from the path for the cache key
            # e.g. "/user/42" → cache key "user:42"
            parts = full_path.strip("/").split("/")
            if len(parts) == 2:
                cache_key = f"user:{parts[1]}"
                cached = await cache_get(cache_key)
                if cached:
                    # Cache hit — return immediately without touching UserService
                    return JSONResponse(json.loads(cached))
            else:
                cache_key = None

            # Cache miss — forward to UserService
            url = user_balancer.next() + full_path
            try:
                r = await forward("GET", url)
            except httpx.ConnectError:
                return JSONResponse({"error": "UserService unavailable"}, status_code=503)

            # Store in cache if it was a successful lookup
            if r.status_code == 200 and cache_key:
                await cache_set(cache_key, r.text)

            return Response(content=r.content, status_code=r.status_code,
                            media_type="application/json")

        elif method == "POST":
            # For writes, forward first, then invalidate cache
            url = user_balancer.next() + full_path
            try:
                r = await forward("POST", url, body)
            except httpx.ConnectError:
                return JSONResponse({"error": "UserService unavailable"}, status_code=503)

            # On wipe, flush the entire user cache namespace
            if full_path == "/user/wipe":
                keys = await redis_client.keys("user:*")
                if keys:
                    await redis_client.delete(*keys)
                return Response(content=r.content, status_code=r.status_code,
                                media_type="application/json")

            # Invalidate cache for this user ID if the write succeeded
            if r.status_code == 200:
                try:
                    payload = json.loads(body)
                    user_id = payload.get("id")
                    if user_id:
                        await cache_delete(f"user:{user_id}")
                except Exception:
                    pass  # don't let cache logic break a successful response

            return Response(content=r.content, status_code=r.status_code,
                            media_type="application/json")

    # ── /product routes ───────────────────────────────────────────────────────

    elif full_path.startswith("/product"):

        if method == "GET":
            parts = full_path.strip("/").split("/")
            if len(parts) == 2:
                cache_key = f"product:{parts[1]}"
                cached = await cache_get(cache_key)
                if cached:
                    return JSONResponse(json.loads(cached))
            else:
                cache_key = None

            url = product_balancer.next() + full_path
            try:
                r = await forward("GET", url)
            except httpx.ConnectError:
                return JSONResponse({"error": "ProductService unavailable"}, status_code=503)

            if r.status_code == 200 and cache_key:
                await cache_set(cache_key, r.text)

            return Response(content=r.content, status_code=r.status_code,
                            media_type="application/json")

        elif method == "POST":
            url = product_balancer.next() + full_path
            try:
                r = await forward("POST", url, body)
            except httpx.ConnectError:
                return JSONResponse({"error": "ProductService unavailable"}, status_code=503)

            # On wipe, flush the entire product cache namespace
            if full_path == "/product/wipe":
                keys = await redis_client.keys("product:*")
                if keys:
                    await redis_client.delete(*keys)
                return Response(content=r.content, status_code=r.status_code,
                                media_type="application/json")

            if r.status_code == 200:
                try:
                    payload = json.loads(body)
                    product_id = payload.get("id")
                    if product_id:
                        await cache_delete(f"product:{product_id}")
                except Exception:
                    pass

            return Response(content=r.content, status_code=r.status_code,
                            media_type="application/json")

    # ── /shutdown ─────────────────────────────────────────────────────────────

    elif full_path.startswith("/shutdown"):
        import os
        print("ISCS: shutting down")
        os._exit(0)

    return JSONResponse({"error": "Not found"}, status_code=404)


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    iscs = CONFIG["InterServiceCommunication"]
    uvicorn.run(
        "iscs:app",
        host=iscs["ip"],
        port=iscs["port"],
        workers=1,
        log_level="warning",
    )