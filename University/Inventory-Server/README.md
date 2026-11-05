# Inventory Server

A microservices-based inventory system built with Python (FastAPI), PostgreSQL, Redis, and nginx.

## Architecture

```
Client / workload parser
        │
        ▼
   nginx :8000                ← public entry point, load balances across workers
   /  |  |  \
  ▼   ▼  ▼   ▼
 :8010 :8011 :8012 :8013      ← OrderService workers (4 processes)
        │
        ▼
      ISCS :8080              ← routes requests + Redis cache layer
      /         \
     ▼           ▼
UserService    ProductService ← domain services
  :8001           :8002
     \               /
      ▼             ▼
      PostgreSQL :5432         ← persistent storage  (Docker)
      Redis      :6379         ← read cache          (Docker)
```

**Why each piece exists:**

- **nginx** — distributes incoming traffic across 4 OrderService processes. One Python process = one CPU core. 4 workers = 4 cores working in parallel.
- **ISCS** — the internal router. OrderService never talks to UserService/ProductService directly; it goes through ISCS, which checks Redis before hitting the database.
- **Redis** — caches GET responses. A repeated `GET /user/42` is answered in <1ms from memory instead of hitting PostgreSQL every time.
- **PostgreSQL** — the source of truth. Data survives restarts because PostgreSQL writes to disk via a Docker volume.

---

## Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (recommended) or pip
- Docker + Docker Compose

---

## Quick start

### 1. Start the data layer (PostgreSQL + Redis + nginx)

```bash
docker compose up -d
docker compose ps   # wait until postgres and redis show "healthy"
```

### 2. Set up the Python environment

```bash
# Linux / Mac / Git Bash
./runme.sh -c

# Windows PowerShell
.\windows_runme.bat -c
```

### 3. Start services (one terminal each)

Start ISCS first, then UserService and ProductService, then OrderService workers last.

```bash
# Linux / Mac / Git Bash        # Windows PowerShell
./runme.sh -i                   .\windows_runme.bat -i
./runme.sh -u                   .\windows_runme.bat -u
./runme.sh -p                   .\windows_runme.bat -p
./runme.sh -o                   .\windows_runme.bat -o
```

`-o` starts 4 OrderService workers on ports 8010–8013. nginx (already running in Docker on port 8000) automatically distributes requests across them.

On Windows, `-o` opens 4 separate terminal windows — one per worker.

### 4. Run a workload

```bash
./runme.sh -w test/sample_workload.txt
# or
uv run python workloadparser.py config.json test/sample_workload.txt
```

### 5. Wipe all data between runs

```bash
curl -X POST http://localhost:8000/wipe
```

This clears all users, products, and orders from PostgreSQL and flushes the Redis cache.

---

## Workload file format

Each non-empty line is one JSON command. Lines starting with `#` are comments.

The parser figures out which service to target based on which fields are present:

```jsonc
// Create a user — routed to UserService
{"command": "create", "id": 1, "username": "alice", "email": "alice@example.com", "password": "pass"}

// Create a product — routed to ProductService
{"command": "create", "id": 1, "productname": "Widget", "price": 9.99, "quantity": 500}

// Place an order — handled by OrderService
{"command": "place order", "user_id": 1, "product_id": 1, "quantity": 10}

// GET requests use a "type" field
{"type": "user", "id": 1}
{"type": "product", "id": 1}
{"type": "order", "id": 1}

// Partial update — only sends fields that change
{"command": "update", "id": 1, "email": "new@example.com"}
```

**Routing rules (checked in order):**

- `"command": "place order"` → `/order`
- command + any of `username`, `email`, `password` → `/user`
- command + any of `productname`, `price`, `quantity` → `/product`
- `"type": "user/product/order"` + `"id"` → GET to that service

### Sequential vs concurrent mode

```bash
# Sequential (default): commands sent one at a time, in order.
# Use this for workloads with dependencies (create before order).
uv run python workloadparser.py config.json test/workload.txt

# Concurrent: all commands fire simultaneously.
# Use this for pure throughput testing with independent commands.
uv run python workloadparser.py config.json test/workload.txt --concurrent

# Add --verbose to see every request and response
uv run python workloadparser.py config.json test/workload.txt --verbose
```

---

## API reference

All external requests go to **port 8000** (nginx). Services can also be called directly on their own ports for testing.

### Users

| Method | Path | Body |
|--------|------|------|
| POST | `/user` | `{"command":"create","id":1,"username":"...","email":"...","password":"..."}` |
| POST | `/user` | `{"command":"update","id":1,"email":"..."}` — only include fields to change |
| POST | `/user` | `{"command":"delete","id":1,"username":"...","email":"...","password":"..."}` — all fields must match |
| GET  | `/user/{id}` | — |

### Products

| Method | Path | Body |
|--------|------|------|
| POST | `/product` | `{"command":"create","id":1,"productname":"...","price":9.99,"quantity":100}` |
| POST | `/product` | `{"command":"update","id":1,"quantity":50}` — partial update |
| POST | `/product` | `{"command":"delete","id":1,"productname":"...","price":9.99,"quantity":50}` — all fields must match |
| GET  | `/product/{id}` | — |

### Orders

| Method | Path | Body |
|--------|------|------|
| POST | `/order` | `{"command":"place order","user_id":1,"product_id":1,"quantity":5}` |
| GET  | `/order/{id}` | — |

Returns 409 if the product has insufficient stock.

### System

| Method | Path | Effect |
|--------|------|--------|
| POST | `/wipe` | Delete all records and flush Redis cache |
| POST | `/shutdown` | Gracefully stop a service |
| POST | `/restart` | No-op (data already persisted in PostgreSQL) |

---

## Shutdown and restart

```bash
# Shutdown all services (order matters — OrderService first)
curl -X POST http://localhost:8000/wipe       # optional: clean slate
curl -X POST http://localhost:8000/shutdown   # OrderService workers
curl -X POST http://localhost:8080/shutdown   # ISCS
curl -X POST http://localhost:8001/shutdown   # UserService
curl -X POST http://localhost:8002/shutdown   # ProductService
docker compose stop                           # PostgreSQL + Redis + nginx

# Restart — data is preserved in the Docker volume
docker compose start
# Then re-run ./runme.sh -i / -u / -p / -o in separate terminals
```

---

## Multi-machine deployment (LAN)

This is how university lab testing works: one machine per service, all on the same network.

### Step 1 — find each machine's LAN IP

```bash
# Linux / Mac
ip addr show | grep "inet "

# Windows
ipconfig
```

Look for the `192.168.x.x` or `10.x.x.x` address.

### Step 2 — run Docker on one machine

Pick one machine (e.g. the OrderService machine) to host PostgreSQL, Redis, and nginx. Run `docker compose up -d` there.

### Step 3 — update config.json on every machine

Replace `127.0.0.1` with each service's actual LAN IP. Every machine needs the same `config.json`.

```json
{
  "UserService":    { "ip": "192.168.1.10", "port": 8001 },
  "ProductService": { "ip": "192.168.1.12", "port": 8002 },
  "OrderService":   { "ip": "192.168.1.11", "port": 8010 },
  "nginx":          { "ip": "192.168.1.11", "port": 8000 },
  "InterServiceCommunication": { "ip": "192.168.1.11", "port": 8080 },
  "PostgreSQL": { "host": "192.168.1.11", "port": 5432, "user": "inventory", "password": "inventory_pass", "database": "inventory" },
  "Redis": { "host": "192.168.1.11", "port": 6379 }
}
```

Start each service on its assigned machine with `./runme.sh -u`, `-p`, `-i`, `-o`. The TA connects to nginx on port 8000:

```bash
curl http://192.168.1.11:8000/user/1
```

### Multiple instances of one service

To run UserService on two machines, update the config to use a list — ISCS round-robins automatically:

```json
"UserService": [
  { "ip": "192.168.1.10", "port": 8001 },
  { "ip": "192.168.1.13", "port": 8001 }
]
```

---

## How to increase throughput

The system currently handles ~12 req/sec sequential and ~36 req/sec concurrent on a single laptop. Here's what each bottleneck is and how to fix it:

### Bottleneck 1: single machine (biggest win)

Add more machines. UserService and ProductService are completely stateless — you can run 10 instances of each and ISCS will load balance across them. Update `config.json` to list multiple IPs. No code changes needed.

### Bottleneck 2: OrderService workers

Currently 4 workers (one per CPU core). If your machine has 8 cores, change the loop in `runme.sh` and `windows_runme.bat` to start 8 workers on ports 8010–8017, and add those ports to `nginx.conf`'s upstream block.

### Bottleneck 3: database connection pool

Each service has `max_size=20` connections. Under very heavy load you'll see requests queuing for a free connection. Increase `max_size` in each service's `lifespan()` function — but watch your PostgreSQL `max_connections` setting (default 100). With 4 OrderService workers × 20 connections = 80, you're close to the limit. Either raise `max_connections` in `docker-compose.yml` or use a connection pooler like PgBouncer.

### Bottleneck 4: Redis cache TTL

Currently 300 seconds (5 minutes). Under a read-heavy workload, lowering TTL means more cache misses. Under a write-heavy workload, the cache helps less because entries get invalidated constantly. Tune based on your workload ratio.

### Bottleneck 5: sequential workload parsing

The workload parser is sequential by default. If your workload has independent commands (e.g. all creates followed by all reads), split it into phases and use `--concurrent` for each phase independently.

---

## Cloud deployment

The system is already containerised (PostgreSQL and Redis run in Docker), which makes cloud deployment straightforward. Here are the main options:

### AWS (most control, most work)

**EC2 + RDS + ElastiCache** is the direct equivalent of what you have locally:

- Replace Docker PostgreSQL with **RDS PostgreSQL** — fully managed, automatic backups, Multi-AZ failover
- Replace Docker Redis with **ElastiCache Redis** — fully managed, clustered
- Run each Python service on a separate **EC2 instance** (t3.small is enough for UserService/ProductService)
- Put an **Application Load Balancer** in front of OrderService instead of nginx

**ECS Fargate** is easier — you write a `docker-compose`-style task definition, AWS manages the underlying machines entirely. Good middle ground between control and simplicity.

### Simpler options

**Railway** or **Render** let you deploy a Python service by pointing at a GitHub repo. They provide managed PostgreSQL and Redis as add-ons. Free tiers exist. Good for quick demos — not for high throughput.

**Fly.io** is similar but gives you more control over regions and machine sizes. Supports multi-region deployment, which is relevant for the A2 "machines going down" scenario.

### What doesn't fit here

**AWS Lambda / Cloudflare Workers / Vercel** are "serverless" — they run your code in response to individual requests, with no persistent process. That model conflicts with our connection pool design: asyncpg keeps connections warm between requests, but a Lambda function starts cold for every invocation. You'd need to replace asyncpg with a serverless-compatible driver and accept higher latency per request. Not recommended for this use case.

---

## Project structure

```
Inventory-Server/
├── config.json                  Service IPs, ports, DB credentials
├── docker-compose.yml           PostgreSQL + Redis + nginx containers
├── nginx.conf                   nginx load balancer config
├── runme.sh                     Start/compile script (Linux/Mac/Git Bash)
├── windows_runme.bat            Start/compile script (Windows PowerShell)
├── write_worker_config.py       Helper: patches config port for each worker
├── workloadparser.py            Concurrent/sequential workload replay tool
├── tests/
│   ├── sample_workload.txt      Small example workload (12 commands)
│   └── load_test_workload.txt   Large load test (1000 commands)
└── src/
    ├── UserService/
    │   └── user_service.py      FastAPI + asyncpg, users table
    ├── ProductService/
    │   └── product_service.py   FastAPI + asyncpg, products table
    ├── ISCS/
    │   └── iscs.py              FastAPI proxy + Redis cache
    └── OrderService/
        └── order_service.py     FastAPI orchestrator, orders table
```
