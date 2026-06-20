# product_service.py
#
# Structurally identical to user_service.py — same patterns, different domain.
# Read user_service.py first if you haven't; comments here are lighter.

import sys
import json
import asyncpg
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

db_pool = None


# ── Startup / shutdown ────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool
    config = _load_config()
    pg = config["PostgreSQL"]

    db_pool = await asyncpg.create_pool(
        host=pg["host"],
        port=pg["port"],
        user=pg["user"],
        password=pg["password"],
        database=pg["database"],
        min_size=5,
        max_size=20,
    )

    async with db_pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id          INTEGER PRIMARY KEY,
                productname TEXT    NOT NULL,
                price       NUMERIC(10, 2) NOT NULL,
                quantity    INTEGER NOT NULL
            )
        """)
        # NUMERIC(10, 2) stores prices with exactly 2 decimal places.
        # Never use FLOAT for money — floating point math introduces tiny
        # rounding errors (e.g. 3.99 becomes 3.9899999999999999).

    print("ProductService: database ready")

    yield

    await db_pool.close()
    print("ProductService: connection pool closed")


app = FastAPI(lifespan=lifespan)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _load_config() -> dict:
    if len(sys.argv) < 2:
        print("Usage: python product_service.py <config_path>")
        sys.exit(1)
    with open(sys.argv[1]) as f:
        return json.load(f)


# ── POST /product ─────────────────────────────────────────────────────────────

@app.post("/product")
async def product_post(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({}, status_code=400)

    command = body.get("command")

    if command == "create":
        return await _create_product(body)
    elif command == "update":
        return await _update_product(body)
    elif command == "delete":
        return await _delete_product(body)
    else:
        return JSONResponse({}, status_code=400)


# ── GET /product/{id} ─────────────────────────────────────────────────────────

@app.get("/product/{product_id}")
async def product_get(product_id: int):
    if product_id < 1:
        return JSONResponse({}, status_code=400)

    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, productname, price, quantity FROM products WHERE id = $1",
            product_id
        )

    if row is None:
        return JSONResponse({}, status_code=404)

    return JSONResponse({
        "id":          row["id"],
        "productname": row["productname"],
        "price":       float(row["price"]),  # cast Decimal → float for JSON
        "quantity":    row["quantity"],
    })


# ── Command implementations ───────────────────────────────────────────────────

async def _create_product(body: dict):
    product_id  = body.get("id")
    productname = body.get("productname")
    price       = body.get("price")
    quantity    = body.get("quantity")

    if not all([product_id, productname, price is not None, quantity is not None]):
        return JSONResponse({}, status_code=400)
    if product_id < 1 or price < 0 or quantity < 0:
        return JSONResponse({}, status_code=400)

    async with db_pool.acquire() as conn:
        try:
            row = await conn.fetchrow(
                """
                INSERT INTO products (id, productname, price, quantity)
                VALUES ($1, $2, $3, $4)
                RETURNING id, productname, price, quantity
                """,
                product_id, productname, price, quantity
            )
        except asyncpg.UniqueViolationError:
            return JSONResponse({}, status_code=409)

    return JSONResponse({
        "id":          row["id"],
        "productname": row["productname"],
        "price":       float(row["price"]),
        "quantity":    row["quantity"],
    })


async def _update_product(body: dict):
    product_id  = body.get("id")
    productname = body.get("productname")
    price       = body.get("price")
    quantity    = body.get("quantity")

    if not product_id or product_id < 1:
        return JSONResponse({}, status_code=400)

    # Build SET clause from only the fields that were sent
    updates = []
    values  = []
    counter = 1

    if productname is not None:
        updates.append(f"productname = ${counter}")
        values.append(productname)
        counter += 1
    if price is not None:
        if price < 0:
            return JSONResponse({}, status_code=400)
        updates.append(f"price = ${counter}")
        values.append(price)
        counter += 1
    if quantity is not None:
        if quantity < 0:
            return JSONResponse({}, status_code=400)
        updates.append(f"quantity = ${counter}")
        values.append(quantity)
        counter += 1

    if not updates:
        return JSONResponse({}, status_code=400)

    values.append(product_id)

    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            f"""
            UPDATE products
            SET {', '.join(updates)}
            WHERE id = ${counter}
            RETURNING id, productname, price, quantity
            """,
            *values
        )

    if row is None:
        return JSONResponse({}, status_code=404)

    return JSONResponse({
        "id":          row["id"],
        "productname": row["productname"],
        "price":       float(row["price"]),
        "quantity":    row["quantity"],
    })


async def _delete_product(body: dict):
    product_id  = body.get("id")
    productname = body.get("productname")
    price       = body.get("price")
    quantity    = body.get("quantity")

    # All fields required for delete
    if not all([product_id, productname, price is not None, quantity is not None]):
        return JSONResponse({}, status_code=400)
    if product_id < 1:
        return JSONResponse({}, status_code=400)

    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT productname, price, quantity FROM products WHERE id = $1",
            product_id
        )

    if row is None:
        return JSONResponse({}, status_code=404)

    # Spec says delete only if all fields match exactly
    if (row["productname"] != productname
            or float(row["price"]) != float(price)
            or row["quantity"] != quantity):
        return JSONResponse({}, status_code=401)

    async with db_pool.acquire() as conn:
        await conn.execute("DELETE FROM products WHERE id = $1", product_id)

    return JSONResponse({}, status_code=200)


# ── Persistence endpoints ─────────────────────────────────────────────────────

@app.post("/shutdown")
async def shutdown_service():
    import os
    print("ProductService: shutting down")
    os._exit(0)


@app.post("/wipe")
async def wipe_service():
    async with db_pool.acquire() as conn:
        await conn.execute("DELETE FROM products")
    print("ProductService: all records wiped")
    return JSONResponse({"status": "wiped"})


@app.post("/restart")
async def restart_service():
    return JSONResponse({"command": "restart"})


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    config = _load_config()

    uvicorn.run(
        "product_service:app",
        host=config["ProductService"]["ip"],
        port=config["ProductService"]["port"],
        workers=1,
        log_level="warning",
    )