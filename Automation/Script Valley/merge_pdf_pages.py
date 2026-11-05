#!/usr/bin/env python3
"""
merge_pdf_pages.py
------------------
Converts a multi-page PDF into a single seamless long-page PDF by:
  1. Rendering every page at high DPI
  2. Detecting and trimming the blank top/bottom margins on each page
  3. Stitching all pages together (no gap between them)
  4. Mirroring the first page's top margin below the last content line
  5. Saving the result as a single-page PDF

Requires Poppler on PATH (used by pdf2image).

Usage:
  uv run merge_pdf_pages.py input.pdf [output.pdf] [--dpi 300] [--threshold 245] [--padding 6]
"""

import argparse
import sys
from pathlib import Path

import numpy as np
from pdf2image import convert_from_path
from PIL import Image


def to_gray(img):
    return np.array(img.convert("L"))


def first_content_row(gray, threshold):
    rows = np.where((gray < threshold).any(axis=1))[0]
    return int(rows[0]) if rows.size else 0


def last_content_row(gray, threshold):
    rows = np.where((gray < threshold).any(axis=1))[0]
    return int(rows[-1]) if rows.size else len(gray) - 1


def merge_pdf(input_path, output_path, dpi=300, threshold=245, padding=6):
    pages = convert_from_path(input_path, dpi=dpi)
    if not pages:
        raise ValueError("PDF has no pages")

    top_margin_px = first_content_row(to_gray(pages[0]), threshold)
    trimmed = []

    for i, page in enumerate(pages):
        gray = to_gray(page)
        # Keep the first page's natural top margin; trim the rest (with padding).
        top = 0 if i == 0 else max(0, first_content_row(gray, threshold) - padding)
        last_row = last_content_row(gray, threshold)
        if i == len(pages) - 1:
            bottom = min(page.height, last_row + 1 + top_margin_px)
        else:
            bottom = min(page.height, last_row + 1 + padding)
        trimmed.append(page.crop((0, top, page.width, bottom)))

    width = max(img.width for img in trimmed)
    canvas = Image.new("RGB", (width, sum(img.height for img in trimmed)), color=(255, 255, 255))
    y = 0
    for img in trimmed:
        canvas.paste(img, (0, y))
        y += img.height

    canvas.save(output_path, "PDF", resolution=dpi)
    return len(pages), canvas.size


def main():
    parser = argparse.ArgumentParser(description="Merge all PDF pages into one seamless long page.")
    parser.add_argument("input", help="input PDF")
    parser.add_argument("output", nargs="?", help="output PDF (default: <input>_merged.pdf)")
    parser.add_argument("--dpi", type=int, default=300, help="rendering DPI (default: 300)")
    parser.add_argument("--threshold", type=int, default=245, help="blank pixel threshold 0-255 (default: 245)")
    parser.add_argument("--padding", type=int, default=6, help="content edge padding in px (default: 6)")
    args = parser.parse_args()

    if not Path(args.input).exists():
        print(f"Error: '{args.input}' not found.", file=sys.stderr)
        return 1

    output = args.output or str(Path(args.input).with_suffix("")) + "_merged.pdf"
    count, (w, h) = merge_pdf(args.input, output, args.dpi, args.threshold, args.padding)
    print(f"Merged {count} page(s) -> {output} ({w}x{h}px)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
