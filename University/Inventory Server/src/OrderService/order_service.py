# order_service.py
#
# Public-facing entry point for the entire system.
# Handles /user and /product by proxying to ISCS.
# Handles /order by orchestrating: verify user, verify+lock stock, record order.

import sys
import json
import asyncpg
import httpx
import uvicorn
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, Response

# ── Config ────────────────────────────────────────────────────────────────────

def _load_config() -> dict:
    if len(sys.argv) < 2:
        print("Usage: python order_service.py <config_path>")
        sys.exit(1)
    with open(sys.argv[1]) as f:
        return json.load(f)

CONFIG   = _load_config()
ISCS_URL = f"http://{CONFIG['InterServiceCommunication']['ip']}:{CONFIG['InterServiceCommunication']['port']}"


def _service_urls(key: str) -> list[str]:
    """Return base URLs for a service — supports single dict or list in config."""
    entry = CONFIG[key]
    if isinstance(entry, list):
        return [f"http://{e['ip']}:{e['port']}" for e in entry]
    return [f"http://{entry['ip']}:{entry['port']}"]


# ── Database pool (orders table only) ────────────────────────────────────────

db_pool     = None
http_client = httpx.AsyncClient(timeout=10.0)


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool
    pg = CONFIG["PostgreSQL"]

    db_pool = await asyncpg.create_pool(
        host=pg["host"], port=pg["port"],
        user=pg["user"], password=pg["password"],
        database=pg["database"],
        min_size=5, max_size=20,
    )

    async with db_pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id         SERIAL PRIMARY KEY,
                user_id    INTEGER     NOT NULL,
                product_id INTEGER     NOT NULL,
                quantity   INTEGER     NOT NULL,
                order_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)

    print("OrderService: database ready")
    yield

    await db_pool.close()
    await http_client.aclose()
    print("OrderService: shut down cleanly")


app = FastAPI(lifespan=lifespan)


# ── Internal proxy helper ─────────────────────────────────────────────────────

async def _proxy(request: Request) -> Response:
    """Forward a request to ISCS unchanged."""
    url  = ISCS_URL + str(request.url.path)
    body = await request.body()
    try:
        if request.method == "GET":
            r = await http_client.get(url)
        else:
            r = await http_client.post(url, content=body,
                                        headers={"Content-Type": "application/json"})
    except httpx.ConnectError:
        return JSONResponse({"error": "ISCS unavailable"}, status_code=503)
    return Response(content=r.content, status_code=r.status_code,
                    media_type="application/json")


# ── System endpoints (must be declared BEFORE the catch-all proxy routes) ─────
#
# FastAPI matches routes in declaration order. If /user/{rest:path} is declared
# first, then POST /user/wipe would be caught by the proxy and forwarded to ISCS
# instead of being handled here. Declaring /wipe, /shutdown, /restart first
# ensures they take priority.

@app.post("/wipe")
async def wipe_service():
    """
    Wipe all records across the entire system.
    Calls each backend service's /wipe endpoint directly (not via ISCS proxy)
    to avoid the /user/{path} catch-all route intercepting the call.
    """
    # Wipe our own orders
    async with db_pool.acquire() as conn:
        await conn.execute("DELETE FROM orders")

    # Call backend services directly at their own ports
    for url in _service_urls("UserService"):
        try:
            await http_client.post(f"{url}/wipe")
        except Exception as e:
            print(f"OrderService: could not wipe UserService at {url}: {e}")

    for url in _service_urls("ProductService"):
        try:
            await http_client.post(f"{url}/wipe")
        except Exception as e:
            print(f"OrderService: could not wipe ProductService at {url}: {e}")

    # Flush Redis cache
    try:
        await http_client.post(f"{ISCS_URL}/cache/flush")
    except Exception:
        pass

    print("OrderService: all records wiped")
    return JSONResponse({"status": "wiped"})


@app.post("/shutdown")
async def shutdown_service():
    import os
    print("OrderService: shutting down")
    os._exit(0)


@app.post("/restart")
async def restart_service():
    return JSONResponse({"command": "restart"})


# ── /user and /product proxy routes (declared AFTER system endpoints) ─────────

@app.api_route("/user", methods=["GET", "POST"])
@app.api_route("/user/{rest:path}", methods=["GET", "POST"])
async def user_proxy(request: Request, rest: str = ""):
    return await _proxy(request)


@app.api_route("/product", methods=["GET", "POST"])
@app.api_route("/product/{rest:path}", methods=["GET", "POST"])
async def product_proxy(request: Request, rest: str = ""):
    return await _proxy(request)


# ── /order ────────────────────────────────────────────────────────────────────

@app.post("/order")
async def order_post(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({}, status_code=400)

    if body.get("command") == "place order":
        return await _place_order(body)
    return JSONResponse({}, status_code=400)


@app.get("/order/{order_id}")
async def order_get(order_id: int):
    if order_id < 1:
        return JSONResponse({}, status_code=400)

    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, user_id, product_id, quantity, order_date FROM orders WHERE id = $1",
            order_id
        )

    if row is None:
        return JSONResponse({}, status_code=404)

    return JSONResponse({
        "id":         row["id"],
        "user_id":    row["user_id"],
        "product_id": row["product_id"],
        "quantity":   row["quantity"],
        "order_date": row["order_date"].isoformat(),
    })


# ── Place order ───────────────────────────────────────────────────────────────

async def _place_order(body: dict):
    user_id    = body.get("user_id")
    product_id = body.get("product_id")
    quantity   = body.get("quantity")

    if not all([user_id, product_id, quantity]):
        return JSONResponse({}, status_code=400)
    if quantity < 1:
        return JSONResponse({}, status_code=400)

    # Step 1: verify user exists (ISCS may serve from Redis cache)
    try:
        user_resp = await http_client.get(f"{ISCS_URL}/user/{user_id}")
    except httpx.ConnectError:
        return JSONResponse({"error": "ISCS unavailable"}, status_code=503)

    if user_resp.status_code != 200:
        return JSONResponse({}, status_code=404)

    # Steps 2-4: check stock, reduce quantity, record order — all in one transaction.
    # SELECT FOR UPDATE locks the product row so concurrent orders can't both
    # see "enough stock" and both succeed when only one should.
    try:
        async with db_pool.acquire() as conn:
            async with conn.transaction():
                product_row = await conn.fetchrow(
                    "SELECT id, productname, price, quantity FROM products WHERE id = $1 FOR UPDATE",
                    product_id
                )

                if product_row is None:
                    return JSONResponse({}, status_code=404)

                if product_row["quantity"] < quantity:
                    return JSONResponse({}, status_code=409)

                new_qty = product_row["quantity"] - quantity

                await conn.execute(
                    "UPDATE products SET quantity = $1 WHERE id = $2",
                    new_qty, product_id
                )

                order_row = await conn.fetchrow(
                    """
                    INSERT INTO orders (user_id, product_id, quantity, order_date)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id, user_id, product_id, quantity, order_date
                    """,
                    user_id, product_id, quantity, datetime.now(timezone.utc)
                )

        # Invalidate the cached product quantity in Redis (non-fatal if it fails)
        try:
            await http_client.post(
                f"{ISCS_URL}/product",
                content=json.dumps({"command": "update", "id": product_id, "quantity": new_qty}),
                headers={"Content-Type": "application/json"}
            )
        except Exception:
            pass

    except Exception as e:
        print(f"OrderService error placing order: {e}")
        return JSONResponse({}, status_code=500)

    return JSONResponse({
        "id":         order_row["id"],
        "user_id":    order_row["user_id"],
        "product_id": order_row["product_id"],
        "quantity":   order_row["quantity"],
        "order_date": order_row["order_date"].isoformat(),
    })


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    svc = CONFIG["OrderService"]
    uvicorn.run(
        "order_service:app",
        host=svc["ip"],
        port=svc["port"],
        workers=1,
        log_level="warning",
    )