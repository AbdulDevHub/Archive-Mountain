# user_service.py
#
# The UserService handles all user CRUD operations.
# It talks directly to PostgreSQL — no other services involved.
#
# Key idea: every function that touches the database is marked `async`.
# This means FastAPI can handle hundreds of requests concurrently on a
# single process, because waiting for Postgres doesn't freeze everything else.

import sys
import json
import hashlib
import asyncpg
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# ── Database connection pool ──────────────────────────────────────────────────
#
# A "pool" is a set of pre-opened database connections kept ready to use.
# Opening a TCP connection to Postgres takes ~5ms. Under load, doing that
# for every request would eat your entire time budget.
#
# With a pool of 10 connections, up to 10 queries run truly in parallel.
# Requests beyond that wait in a queue (microseconds) for a free connection.
# This is far faster than opening a new connection every time.

db_pool = None  # initialised in lifespan, used everywhere else


# ── Startup and shutdown ──────────────────────────────────────────────────────
#
# The modern FastAPI pattern: one function handles both startup (before yield)
# and shutdown (after yield). No more deprecation warnings.

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool

    config = _load_config()
    pg = config["PostgreSQL"]

    # asyncpg.create_pool() opens min_size connections immediately,
    # and will open more (up to max_size) when demand spikes.
    db_pool = await asyncpg.create_pool(
        host=pg["host"],
        port=pg["port"],
        user=pg["user"],
        password=pg["password"],
        database=pg["database"],
        min_size=5,   # always keep 5 connections warm
        max_size=20,  # open up to 20 under load
    )

    # Create the users table if it doesn't already exist.
    # "IF NOT EXISTS" makes this safe to run on every startup —
    # it's a no-op if the table is already there (i.e. after a restart).
    async with db_pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id       INTEGER PRIMARY KEY,
                username TEXT    NOT NULL,
                email    TEXT    NOT NULL,
                password TEXT    NOT NULL
            )
        """)

    print("UserService: database ready")

    yield  # ← server runs here

    await db_pool.close()
    print("UserService: connection pool closed")


app = FastAPI(lifespan=lifespan)


# ── Helper: password hashing ──────────────────────────────────────────────────
#
# We never store plain-text passwords. SHA-256 is a one-way hash —
# you can verify "does this password match?" but you can't reverse it.
# This matches what your original Java code did, so existing test cases still pass.

def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


# ── Helper: config loading ────────────────────────────────────────────────────
#
# Called once at startup. Reads the same config.json the other services use.

def _load_config() -> dict:
    if len(sys.argv) < 2:
        print("Usage: python user_service.py <config_path>")
        sys.exit(1)
    with open(sys.argv[1]) as f:
        return json.load(f)


# ── POST /user ────────────────────────────────────────────────────────────────
#
# Handles create, update, and delete commands.
# All three arrive as POST with a JSON body containing a "command" field.

@app.post("/user")
async def user_post(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({}, status_code=400)

    command = body.get("command")

    if command == "create":
        return await _create_user(body)
    elif command == "update":
        return await _update_user(body)
    elif command == "delete":
        return await _delete_user(body)
    else:
        return JSONResponse({}, status_code=400)


# ── GET /user/{id} ────────────────────────────────────────────────────────────

@app.get("/user/{user_id}")
async def user_get(user_id: int):
    if user_id < 1:
        return JSONResponse({}, status_code=400)

    async with db_pool.acquire() as conn:
        # fetchrow() returns one row or None — perfect for a lookup by primary key.
        row = await conn.fetchrow(
            "SELECT id, username, email FROM users WHERE id = $1",
            user_id
            # Note: we deliberately exclude `password` from the response.
            # $1 is a parameterised placeholder — asyncpg fills it in safely,
            # preventing SQL injection attacks.
        )

    if row is None:
        return JSONResponse({}, status_code=404)

    return JSONResponse({
        "id":       row["id"],
        "username": row["username"],
        "email":    row["email"],
    })


# ── Command implementations ───────────────────────────────────────────────────

async def _create_user(body: dict):
    user_id  = body.get("id")
    username = body.get("username")
    email    = body.get("email")
    password = body.get("password")

    # Validate — all four fields are required for create
    if not all([user_id, username, email, password]):
        return JSONResponse({}, status_code=400)
    if user_id < 1:
        return JSONResponse({}, status_code=400)

    hashed = _hash_password(password)

    async with db_pool.acquire() as conn:
        try:
            # INSERT ... RETURNING gives us back the row without a second query.
            row = await conn.fetchrow(
                """
                INSERT INTO users (id, username, email, password)
                VALUES ($1, $2, $3, $4)
                RETURNING id, username, email
                """,
                user_id, username, email, hashed
            )
        except asyncpg.UniqueViolationError:
            # PostgreSQL raises this when we try to INSERT a duplicate primary key.
            # This is the correct way to detect "user already exists" —
            # no need to SELECT first, which would be two round-trips to the DB.
            return JSONResponse({}, status_code=409)

    return JSONResponse({
        "id":       row["id"],
        "username": row["username"],
        "email":    row["email"],
    })


async def _update_user(body: dict):
    user_id  = body.get("id")
    username = body.get("username")
    email    = body.get("email")
    password = body.get("password")

    if not user_id or user_id < 1:
        return JSONResponse({}, status_code=400)

    # Build the SET clause dynamically based on which fields were provided.
    # This matches the spec: "only update the fields that are present."
    updates = []
    values  = []
    counter = 1  # asyncpg uses $1, $2, $3 ... for placeholders

    if username is not None:
        updates.append(f"username = ${counter}")
        values.append(username)
        counter += 1
    if email is not None:
        updates.append(f"email = ${counter}")
        values.append(email)
        counter += 1
    if password is not None:
        updates.append(f"password = ${counter}")
        values.append(_hash_password(password))
        counter += 1

    if not updates:
        # Nothing to update — treat as bad request
        return JSONResponse({}, status_code=400)

    values.append(user_id)  # for the WHERE clause

    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            f"""
            UPDATE users
            SET {', '.join(updates)}
            WHERE id = ${counter}
            RETURNING id, username, email
            """,
            *values  # unpack the list as positional args
        )

    if row is None:
        return JSONResponse({}, status_code=404)

    return JSONResponse({
        "id":       row["id"],
        "username": row["username"],
        "email":    row["email"],
    })


async def _delete_user(body: dict):
    user_id  = body.get("id")
    username = body.get("username")
    email    = body.get("email")
    password = body.get("password")

    # All fields required for delete (spec: must match exactly)
    if not all([user_id, username, email, password]):
        return JSONResponse({}, status_code=400)
    if user_id < 1:
        return JSONResponse({}, status_code=400)

    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT username, email, password FROM users WHERE id = $1",
            user_id
        )

    if row is None:
        return JSONResponse({}, status_code=404)

    # Verify all fields match before deleting
    if (row["username"] != username
            or row["email"] != email
            or row["password"] != _hash_password(password)):
        return JSONResponse({}, status_code=401)

    async with db_pool.acquire() as conn:
        await conn.execute("DELETE FROM users WHERE id = $1", user_id)

    return JSONResponse({}, status_code=200)


# ── Persistence endpoints ─────────────────────────────────────────────────────
#
# These satisfy the assignment's shutdown/restart requirement.
# Because we're using PostgreSQL, data is ALREADY persisted automatically —
# these endpoints exist for compatibility with the workload parser protocol.
# "shutdown" just stops the server gracefully.
# "restart" is a no-op because Postgres survived the restart for us.

@app.post("/shutdown")
async def shutdown_service():
    """Gracefully stop the service. Data is already in Postgres — nothing to flush."""
    import os
    print("UserService: shutting down")
    os._exit(0)


@app.post("/wipe")
async def wipe_service():
    """
    Delete all user records. Satisfies the assignment's 'clean all records' requirement.
    Called by the workload parser before a fresh test run.
    """
    async with db_pool.acquire() as conn:
        await conn.execute("DELETE FROM users")
    print("UserService: all records wiped")
    return JSONResponse({"status": "wiped"})


@app.post("/restart")
async def restart_service():
    """Data already persisted in Postgres. Just acknowledge."""
    return JSONResponse({"command": "restart"})


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    config = _load_config()
    svc    = config["UserService"]

    # workers=1 here because we'll run multiple processes behind nginx later.
    # Each process gets its own connection pool (5–20 connections).
    # 4 workers × 20 connections = up to 80 parallel DB queries.
    uvicorn.run(
        "user_service:app",
        host=config["UserService"]["ip"],
        port=config["UserService"]["port"],
        workers=1,
        log_level="warning",  # suppress per-request logs under load
    )