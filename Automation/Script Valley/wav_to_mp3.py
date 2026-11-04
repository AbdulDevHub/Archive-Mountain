#!/usr/bin/env python3
"""
wav_to_mp3.py
-------------
Batch-convert .wav files (e.g. narration from Project Valley/Audio Generation)
to compact speech-quality MP3s with ffmpeg. A 30-minute 24 kHz WAV (~85 MB)
becomes ~14 MB at 64k.

Usage:
  uv run wav_to_mp3.py "../Project Valley/Audio Generation/audio"
  uv run wav_to_mp3.py audio --bitrate 96k --delete-wav
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Batch convert .wav files to .mp3 with ffmpeg.")
    parser.add_argument("folder", type=Path, help="folder containing .wav files")
    parser.add_argument("--bitrate", default="64k", help="MP3 bitrate (default: 64k, good for speech)")
    parser.add_argument("--out", type=Path, help="output folder (default: same as input)")
    parser.add_argument("--force", action="store_true", help="overwrite existing .mp3 files")
    parser.add_argument("--delete-wav", action="store_true", help="delete each .wav after a successful convert")
    parser.add_argument("--ffmpeg", default=shutil.which("ffmpeg"), help="path to ffmpeg (default: PATH)")
    args = parser.parse_args()

    if not args.ffmpeg:
        print("Error: ffmpeg not found on PATH. Install it or pass --ffmpeg.", file=sys.stderr)
        return 1
    wavs = sorted(args.folder.glob("*.wav"))
    if not wavs:
        print(f"No .wav files in '{args.folder}'.")
        return 0

    out_dir = args.out or args.folder
    out_dir.mkdir(parents=True, exist_ok=True)
    done = skipped = failed = 0

    for i, wav in enumerate(wavs, start=1):
        mp3 = out_dir / f"{wav.stem}.mp3"
        if mp3.exists() and not args.force:
            skipped += 1
            continue
        print(f"[{i}/{len(wavs)}] {wav.name}")
        result = subprocess.run(
            [args.ffmpeg, "-y", "-loglevel", "error", "-i", str(wav),
             "-codec:a", "libmp3lame", "-b:a", args.bitrate, str(mp3)],
            check=False, capture_output=True, text=True,
        )
        if result.returncode != 0:
            print(f"  ! failed: {result.stderr.strip()}")
            failed += 1
            continue
        done += 1
        if args.delete_wav:
            wav.unlink()

    print(f"\nConverted {done}, skipped {skipped} existing, {failed} failed.")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
