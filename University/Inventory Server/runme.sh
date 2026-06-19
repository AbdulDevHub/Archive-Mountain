#!/usr/bin/env bash
# runme.sh
#
# Controls all services. Must be run from the project root directory.
# Usage:
#   ./runme.sh -c          compile (sets up Python environment)
#   ./runme.sh -u          start UserService
#   ./runme.sh -p          start ProductService
#   ./runme.sh -i          start ISCS
#   ./runme.sh -o          start OrderService
#   ./runme.sh -w <file>   run workload parser against <file>

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
    echo "Starting UserService..."
    $PYTHON src/UserService/user_service.py "$CONFIG"
    ;;

  # ── -p : start ProductService ──────────────────────────────────────────────
  -p)
    echo "Starting ProductService..."
    $PYTHON src/ProductService/product_service.py "$CONFIG"
    ;;

  # ── -i : start ISCS ────────────────────────────────────────────────────────
  -i)
    echo "Starting ISCS..."
    $PYTHON src/ISCS/iscs.py "$CONFIG"
    ;;

  # ── -o : start OrderService ────────────────────────────────────────────────
  -o)
    echo "Starting OrderService..."
    $PYTHON src/OrderService/order_service.py "$CONFIG"
    ;;

  # ── -w : run workload parser ───────────────────────────────────────────────
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
    echo "  ./runme.sh -o          Start OrderService"
    echo "  ./runme.sh -w <file>   Run workload parser"
    exit 1
    ;;

esac