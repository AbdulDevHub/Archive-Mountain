#!/usr/bin/env python3
"""
find_loop.py
------------
Find the best seamless loop point in a video and export the loop with audio.

How it works:
  1. Grab an anchor frame `--skip` seconds in (skips intros/fade-ins).
  2. Scan every frame at least `--min-length` seconds later and pick the one
     most visually similar to the anchor (grayscale 256x256, lowest MSE).
  3. Cut anchor -> best match with ffmpeg stream copy (no re-encode, audio kept).

Usage:
  uv run find_loop.py "assets/Brown Noise.webm" "assets/Cozy Cottage.webm"
  uv run find_loop.py video.webm --skip 30 --min-length 10 --ffmpeg C:/tools/ffmpeg.exe

Output: loop_<name>.<ext> next to each input (or in --out).
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

SIZE = (256, 256)


def resolve_ffmpeg(explicit: str | None) -> str | None:
    """--ffmpeg flag, then PATH, then ffmpeg(.exe) at the repo root."""
    if explicit:
        return explicit if Path(explicit).exists() else None
    on_path = shutil.which("ffmpeg")
    if on_path:
        return on_path
    repo_root = Path(__file__).resolve().parent.parent
    for name in ("ffmpeg.exe", "ffmpeg"):
        if (repo_root / name).exists():
            return str(repo_root / name)
    return None


def _gray(frame: np.ndarray) -> np.ndarray:
    return cv2.resize(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY), SIZE).astype(np.float32)


def find_loop_end(video: Path, skip: float, min_length: float) -> tuple[float, float] | None:
    """Return (loop_end_seconds, mse) for the frame most similar to the anchor."""
    cap = cv2.VideoCapture(str(video))
    fps = cap.get(cv2.CAP_PROP_FPS) or 0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if fps <= 0:
        print("  ! could not read FPS")
        return None

    anchor_idx = int(fps * skip)
    search_start = anchor_idx + int(fps * min_length)
    if search_start >= total:
        print(f"  ! video too short for --skip {skip}s + --min-length {min_length}s")
        cap.release()
        return None

    cap.set(cv2.CAP_PROP_POS_FRAMES, anchor_idx)
    ok, anchor = cap.read()
    if not ok:
        print("  ! could not read anchor frame")
        cap.release()
        return None
    target = _gray(anchor)

    cap.set(cv2.CAP_PROP_POS_FRAMES, search_start)
    best_idx, best_mse = None, float("inf")
    for idx in range(search_start, total):
        ok, frame = cap.read()
        if not ok:
            break
        mse = float(np.mean((target - _gray(frame)) ** 2))
        if mse < best_mse:
            best_idx, best_mse = idx, mse
    cap.release()

    return (best_idx / fps, best_mse) if best_idx is not None else None


def export_loop(ffmpeg: str, video: Path, out: Path, start: float, end: float) -> bool:
    cmd = [
        ffmpeg, "-y", "-loglevel", "error",
        "-ss", f"{start:.3f}", "-t", f"{end - start:.3f}",
        "-i", str(video), "-c", "copy", str(out),
    ]
    result = subprocess.run(cmd, check=False, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ! ffmpeg failed:\n{result.stderr}")
    return result.returncode == 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Find a seamless loop point and export it with audio.")
    parser.add_argument("videos", nargs="+", type=Path, help="video files to process")
    parser.add_argument("--skip", type=float, default=45.0, help="anchor time in seconds (default: 45)")
    parser.add_argument("--min-length", type=float, default=5.0, help="shortest loop in seconds (default: 5)")
    parser.add_argument("--out", type=Path, help="output folder (default: next to each input)")
    parser.add_argument("--ffmpeg", help="path to ffmpeg (default: PATH, then repo root)")
    args = parser.parse_args()

    ffmpeg = resolve_ffmpeg(args.ffmpeg)
    if not ffmpeg:
        print("Error: ffmpeg not found. Install it, put ffmpeg.exe at the repo root, or pass --ffmpeg.")
        return 1

    failures = 0
    for video in args.videos:
        print(f"Processing {video} ...")
        if not video.exists():
            print("  ! file not found")
            failures += 1
            continue
        found = find_loop_end(video, args.skip, args.min_length)
        if not found:
            failures += 1
            continue
        end, mse = found
        print(f"  loop {args.skip:.2f}s -> {end:.2f}s (MSE {mse:.1f})")
        out_dir = args.out or video.parent
        out_dir.mkdir(parents=True, exist_ok=True)
        out = out_dir / f"loop_{video.stem}{video.suffix}"
        if export_loop(ffmpeg, video, out, args.skip, end):
            print(f"  saved {out}")
        else:
            failures += 1

    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
