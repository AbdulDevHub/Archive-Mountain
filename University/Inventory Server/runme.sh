#!/usr/bin/env bash
# runme.sh — controls all services.
# Run from the project root directory.
#
# Usage:
#   ./runme.sh -c          set up Python environment
#   ./runme.sh -u          start UserService
#   ./runme.sh -p          start ProductService
#   ./runme.sh -i          start ISCS
#   ./runme.sh -o          start OrderService (4 workers behind nginx)
#   ./runme.sh -w <file>   run workload parser

# ── Locate project root ───────────────────────────────────────────────────────
# This makes the script work regardless of which directory you run it from,
# which the assignment explicitly requires ("do not assume a hard coded directory").

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CONFIG="$SCRIPT_DIR/config.json"

# ── Detect Python / uv ───────────────────────────────────────────────────────
# On lab machines: plain python3 is used (no uv).
# On your laptop: uv run is available and preferred.

if command -v uv &>/dev/null; then
    PYTHON="uv run python"
else
    PYTHON="python3"
fi

# ── Flags ────────────────────────────────────────────────────────────────────

case "$1" in

  # ── -c : compile / setup ───────────────────────────────────────────────────
  -c)
    echo "Setting up Python environment..."

    if command -v uv &>/dev/null; then
        # uv is available — fast path
        uv sync
        echo "Environment ready (uv)."
    else
        # Lab machines: use pip with a venv
        python3 -m venv .venv
        source .venv/bin/activate
        pip install --quiet fastapi uvicorn asyncpg redis aiohttp httpx
        echo "Environment ready (pip venv)."
    fi

    # No Java compilation needed — we're pure Python now.
    echo "No compilation step required (Python source = compiled)."
    ;;

  # ── -u : start UserService ─────────────────────────────────────────────────
  -u)
    echo "Starting UserService on port 8001..."
    $PYTHON src/UserService/user_service.py "$CONFIG"
    ;;

  # ── -p : start ProductService ──────────────────────────────────────────────
  -p)
    echo "Starting ProductService on port 8002..."
    $PYTHON src/ProductService/product_service.py "$CONFIG"
    ;;

  # ── -i : start ISCS ────────────────────────────────────────────────────────
  -i)
    echo "Starting ISCS on port 8080..."
    $PYTHON src/ISCS/iscs.py "$CONFIG"
    ;;

  # ── -o : start 4 OrderService workers ───────────────────────────────────────
  -o)
    # Start 4 OrderService workers on ports 8010-8013.
    # nginx (running in Docker on port 8000) round-robins across them.
    #
    # Why 4? Each Python process uses one CPU core. A modern laptop has 4-8 cores,
    # so 4 workers saturates the CPU without over-subscribing it.
    # Each worker has its own connection pool (5-20 DB connections).
    # 4 workers × 20 connections = up to 80 parallel DB queries.
    echo "Starting 4 OrderService workers on ports 8010-8013..."
    echo "(nginx on port 8000 load balances across them)"
    echo ""

    for PORT in 8010 8011 8012 8013; do
        # Create a temporary config with this worker's port
        WORKER_CONFIG="/tmp/order_worker_${PORT}.json"
        # Use Python to patch the port rather than fragile sed
        $PYTHON - << PYEOF
import json
with open("$CONFIG") as f:
    cfg = json.load(f)
cfg["OrderService"]["port"] = ${PORT}
with open("$WORKER_CONFIG", "w") as f:
    json.dump(cfg, f)
PYEOF
        echo "  Starting worker on port $PORT..."
        $PYTHON src/OrderService/order_service.py "$WORKER_CONFIG" &
    done

    echo ""
    echo "All workers started. nginx distributes requests from port 8000."
    echo "Press Ctrl+C to stop all workers."
    wait  # keep the shell alive until Ctrl+C
    ;;

  -w)
    if [ -z "$2" ]; then
        echo "Usage: ./runme.sh -w <workload_file>"
        exit 1
    fi
    echo "Running workload: $2"
    $PYTHON workloadparser.py "$CONFIG" "$2"
    ;;

  # ── unknown flag ───────────────────────────────────────────────────────────
  *)
    echo "Usage:"
    echo "  ./runme.sh -c          Set up Python environment"
    echo "  ./runme.sh -u          Start UserService"
    echo "  ./runme.sh -p          Start ProductService"
    echo "  ./runme.sh -i          Start ISCS"
    echo "  ./runme.sh -o          Start 4 OrderService workers (nginx on :8000)"
    echo "  ./runme.sh -w <file>   Run workload parser"
    exit 1
    ;;

esac