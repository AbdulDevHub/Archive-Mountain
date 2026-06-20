# workloadparser.py
#
# Reads a workload file and replays commands against OrderService.
#
# EXECUTION MODES:
#   Sequential (default): commands sent one at a time, in order.
#     Use this when commands have dependencies (create before order).
#
#   Concurrent (--concurrent): all commands sent simultaneously.
#     Use this for pure load testing where commands are independent.
#
# Usage:
#   python workloadparser.py <config> <workload>               # sequential
#   python workloadparser.py <config> <workload> --concurrent  # concurrent

import sys
import json
import asyncio
import aiohttp
import time

CONCURRENCY = 200  # max parallel requests (concurrent mode only)


def load_config(path: str) -> dict:
    with open(path) as f:
        return json.load(f)


def parse_workload(path: str) -> list[dict]:
    commands = []
    with open(path) as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            try:
                commands.append(json.loads(line))
            except json.JSONDecodeError as e:
                print(f"  Warning: skipping line {line_num} (invalid JSON): {e}")
    return commands


USER_FIELDS    = {"username", "email", "password"}
PRODUCT_FIELDS = {"productname", "price", "quantity"}


def command_to_request(cmd: dict, base_url: str) -> tuple[str, str, dict | None]:
    """Convert a workload command to (method, url, body)."""

    # GET requests use a "type" field
    if "type" in cmd:
        t  = cmd["type"]
        id = cmd.get("id")
        if t == "user"    and id: return ("GET", f"{base_url}/user/{id}",    None)
        if t == "product" and id: return ("GET", f"{base_url}/product/{id}", None)
        if t == "order"   and id: return ("GET", f"{base_url}/order/{id}",   None)

    command = cmd.get("command")
    if not command:
        print(f"  Warning: no 'command' or 'type' — skipping: {cmd}")
        return (None, None, None)

    if command == "place order":
        return ("POST", f"{base_url}/order", cmd)

    cmd_keys       = set(cmd.keys())
    has_user_field = bool(cmd_keys & USER_FIELDS)
    has_prod_field = bool(cmd_keys & PRODUCT_FIELDS)

    if has_user_field and not has_prod_field:
        return ("POST", f"{base_url}/user", cmd)
    if has_prod_field and not has_user_field:
        return ("POST", f"{base_url}/product", cmd)

    print(f"  Warning: ambiguous command, skipping: {cmd}")
    return (None, None, None)


async def send_one(session: aiohttp.ClientSession, method: str, url: str,
                   body: dict | None, verbose: bool) -> int:
    """Send a single request, return HTTP status code."""
    try:
        if method == "GET":
            async with session.get(url) as resp:
                status = resp.status
                if verbose:
                    text = await resp.text()
                    print(f"    GET  {url} → {status}  {text[:100]}")
                return status
        else:
            async with session.post(url, json=body) as resp:
                status = resp.status
                if verbose:
                    text = await resp.text()
                    print(f"    POST {url} {json.dumps(body)[:60]} → {status}  {text[:100]}")
                return status
    except aiohttp.ClientConnectorError:
        if verbose:
            print(f"    {method} {url} → 503 (connection refused)")
        return 503
    except Exception as e:
        print(f"  Request error: {e}")
        return -1


async def run_sequential(base_url: str, commands: list[dict], verbose: bool):
    """
    Send commands one at a time, in order.

    This is correct for workloads where commands depend on each other
    (e.g. you must create a user before placing an order for that user).
    Speed is limited by round-trip latency, but correctness is guaranteed.
    """
    counts    = {"2xx": 0, "4xx": 0, "5xx": 0, "err": 0}
    connector = aiohttp.TCPConnector(limit=10)
    timeout   = aiohttp.ClientTimeout(total=30)

    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        start = time.perf_counter()
        for i, cmd in enumerate(commands):
            method, url, body = command_to_request(cmd, base_url)
            if method is None:
                counts["err"] += 1
                continue
            status = await send_one(session, method, url, body, verbose)
            if   status == -1:       counts["err"] += 1
            elif 200 <= status < 300: counts["2xx"] += 1
            elif 400 <= status < 500: counts["4xx"] += 1
            elif 500 <= status < 600: counts["5xx"] += 1
        elapsed = time.perf_counter() - start

    return elapsed, counts


async def run_concurrent(base_url: str, commands: list[dict], verbose: bool):
    """
    Send all commands simultaneously (bounded by CONCURRENCY semaphore).

    Use this for pure throughput testing where commands are independent.
    Order of execution is NOT guaranteed.
    """
    total     = len(commands)
    results   = [None] * total
    semaphore = asyncio.Semaphore(CONCURRENCY)
    connector = aiohttp.TCPConnector(limit=CONCURRENCY)
    timeout   = aiohttp.ClientTimeout(total=30)

    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:

        async def bounded_send(index: int, cmd: dict):
            method, url, body = command_to_request(cmd, base_url)
            if method is None:
                results[index] = -1
                return
            async with semaphore:
                results[index] = await send_one(session, method, url, body, verbose)

        start = time.perf_counter()
        await asyncio.gather(*[bounded_send(i, cmd) for i, cmd in enumerate(commands)])
        elapsed = time.perf_counter() - start

    counts = {"2xx": 0, "4xx": 0, "5xx": 0, "err": 0}
    for s in results:
        if   s is None or s == -1: counts["err"] += 1
        elif 200 <= s < 300:       counts["2xx"] += 1
        elif 400 <= s < 500:       counts["4xx"] += 1
        elif 500 <= s < 600:       counts["5xx"] += 1

    return elapsed, counts


def main():
    if len(sys.argv) < 3:
        print("Usage: python workloadparser.py <config> <workload> [--concurrent] [--verbose]")
        sys.exit(1)

    config        = load_config(sys.argv[1])
    workload_path = sys.argv[2]
    flags         = set(sys.argv[3:])
    concurrent    = "--concurrent" in flags
    verbose       = "--verbose" in flags

    order    = config["OrderService"]
    base_url = f"http://{order['ip']}:{order['port']}"

    print(f"Workload parser")
    print(f"  Target:   {base_url}")
    print(f"  Workload: {workload_path}")
    print(f"  Mode:     {'concurrent' if concurrent else 'sequential'}")

    commands = parse_workload(workload_path)
    if not commands:
        print("  No commands found.")
        sys.exit(0)
    print(f"  Loaded {len(commands)} commands")

    if concurrent:
        elapsed, counts = asyncio.run(run_concurrent(base_url, commands, verbose))
    else:
        elapsed, counts = asyncio.run(run_sequential(base_url, commands, verbose))

    rps = len(commands) / elapsed if elapsed > 0 else 0

    print(f"\nResults:")
    print(f"  Time         : {elapsed:.2f}s")
    print(f"  Req/sec      : {rps:.0f}")
    print(f"  2xx success  : {counts['2xx']}")
    print(f"  4xx client   : {counts['4xx']}")
    print(f"  5xx server   : {counts['5xx']}")
    print(f"  errors       : {counts['err']}")


if __name__ == "__main__":
    main()