# Inventory Server

A microservices-based inventory system built with Python (FastAPI), PostgreSQL, and Redis.

## Architecture

```
Client / workload parser
        │
        ▼
  OrderService :8000          ← public-facing endpoint
        │
        ▼
      ISCS :8080              ← routes + Redis cache
      /    \
     ▼      ▼
UserService  ProductService   ← domain services
  :8001       :8002
     \          /
      ▼        ▼
      PostgreSQL :5432        ← persistent storage (Docker)
      Redis      :6379        ← cache layer      (Docker)
```

## Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (recommended) or pip
- Docker + Docker Compose

## Quick start (single machine)

### 1. Start the data layer

```bash
docker compose up -d
docker compose ps   # wait until both show "healthy"
```

### 2. Set up the Python environment

```bash
./runme.sh -c
```

### 3. Start services (one terminal each)

```bash
./runme.sh -i   # ISCS           (start first)
./runme.sh -u   # UserService
./runme.sh -p   # ProductService
./runme.sh -o   # OrderService   (start last)
```

### 4. Run a workload

```bash
./runme.sh -w sample_workload.txt
```

### 5. Wipe all data between test runs

```bash
curl -X POST http://localhost:8000/wipe
```

---

## Multi-machine deployment (LAN)

This is how the TAs tested it: one laptop per service, all on the same WiFi network.

### Step 1 — find each machine's LAN IP

On each machine run:

```bash
# Linux / Mac
ip addr show | grep "inet "

# Windows
ipconfig
```

Look for the `192.168.x.x` or `10.x.x.x` address — that's the LAN IP.

### Step 2 — run Docker on one machine

Pick one machine to host PostgreSQL and Redis (the machine running OrderService is a good choice). Run `docker compose up -d` there.

### Step 3 — update config.json on every machine

Replace `127.0.0.1` with the actual LAN IP of each service's host machine.

Example — if UserService runs on `192.168.1.10`, OrderService on `192.168.1.11`, etc:

```json
{
  "UserService":    { "ip": "192.168.1.10", "port": 8001 },
  "ProductService": { "ip": "192.168.1.12", "port": 8002 },
  "OrderService":   { "ip": "192.168.1.11", "port": 8000 },
  "InterServiceCommunication": { "ip": "192.168.1.11", "port": 8080 },
  "PostgreSQL": {
    "host": "192.168.1.11",
    "port": 5432,
    "user": "inventory",
    "password": "inventory_pass",
    "database": "inventory"
  },
  "Redis": { "host": "192.168.1.11", "port": 6379 }
}
```

Make sure every machine has the same `config.json`. Then start each service on its assigned machine with `./runme.sh -u`, `-p`, `-i`, `-o` as normal.

The TA connects to OrderService's machine IP on port 8000:

```bash
curl http://192.168.1.11:8000/user/1
```

### Multiple instances of one service (A2 scaling)

To run two UserService instances on different machines, update the config to use a list:

```json
"UserService": [
  { "ip": "192.168.1.10", "port": 8001 },
  { "ip": "192.168.1.13", "port": 8001 }
]
```

ISCS automatically round-robins between them. No other code changes needed.

---

## Shutdown and restart

To shut down all services gracefully:

```bash
curl -X POST http://localhost:8000/shutdown   # OrderService
curl -X POST http://localhost:8080/shutdown   # ISCS
curl -X POST http://localhost:8001/shutdown   # UserService
curl -X POST http://localhost:8002/shutdown   # ProductService
docker compose stop                           # Postgres + Redis
```

To restart (data is preserved in the Docker volume):

```bash
docker compose start
./runme.sh -i && ./runme.sh -u && ./runme.sh -p && ./runme.sh -o
```

---

## API reference

All requests go to **OrderService** on port 8000.

### Users

| Method | Path | Body |
|--------|------|------|
| POST | `/user` | `{"command":"create","id":1,"username":"...","email":"...","password":"..."}` |
| POST | `/user` | `{"command":"update","id":1,"email":"..."}` (partial update — only send changed fields) |
| POST | `/user` | `{"command":"delete","id":1,"username":"...","email":"...","password":"..."}` |
| GET  | `/user/{id}` | — |

### Products

| Method | Path | Body |
|--------|------|------|
| POST | `/product` | `{"command":"create","id":1,"productname":"...","price":9.99,"quantity":100}` |
| POST | `/product` | `{"command":"update","id":1,"quantity":50}` |
| POST | `/product` | `{"command":"delete","id":1,"productname":"...","price":9.99,"quantity":50}` |
| GET  | `/product/{id}` | — |

### Orders

| Method | Path | Body |
|--------|------|------|
| POST | `/order` | `{"command":"place order","user_id":1,"product_id":1,"quantity":5}` |
| GET  | `/order/{id}` | — |

### System

| Method | Path | Effect |
|--------|------|--------|
| POST | `/wipe` | Delete all records (users, products, orders) and flush Redis cache |
| POST | `/shutdown` | Gracefully stop the service |

---

## Workload file format

Each line is one JSON command. Lines starting with `#` are comments.

```
# Create users
{"command": "create", "id": 1, "username": "alice", "email": "alice@example.com", "password": "pass"}

# Create products  
{"command": "create", "id": 1, "productname": "Widget", "price": 9.99, "quantity": 500}

# Place orders
{"command": "place order", "user_id": 1, "product_id": 1, "quantity": 10}

# GET requests use a "type" field
{"type": "user", "id": 1}
{"type": "product", "id": 1}
```

---

## Project structure

```
Inventory Server/
├── config.json              Service IPs, ports, and DB credentials
├── docker-compose.yml       PostgreSQL + Redis containers
├── runme.sh                 Start/compile script
├── workloadparser.py        Concurrent workload replay tool
├── sample_workload.txt      Example workload for testing
└── src/
    ├── UserService/
    │   └── user_service.py
    ├── ProductService/
    │   └── product_service.py
    ├── ISCS/
    │   └── iscs.py
    └── OrderService/
        └── order_service.py
```
