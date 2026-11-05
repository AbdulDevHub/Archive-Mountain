# write_worker_config.py
#
# Helper used by runme.sh and windows_runme.bat to create per-worker config files.
# Called as: python write_worker_config.py <source_config> <output_path> <port>
#
# Why a separate script instead of a one-liner?
# Windows backslashes in paths break Python inline -c strings because
# \U, \D, etc. are interpreted as unicode escape sequences.
# A script file sidesteps that entirely.

import sys
import json

source_config = sys.argv[1]
output_path   = sys.argv[2]
port          = int(sys.argv[3])

with open(source_config) as f:
    cfg = json.load(f)

cfg["OrderService"]["port"] = port

with open(output_path, "w") as f:
    json.dump(cfg, f)