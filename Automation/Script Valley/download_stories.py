#!/usr/bin/env python3
"""
download_stories.py
-------------------
Download multi-page web stories as plain .txt files, ready for
`Project Valley/Audio Generation`.

Two input modes:
  --author URL   scrape every story link (/s/...) on an author's works page
  --list FILE    read story URLs from a text file (one per line, # comments ok)

Each output file starts with a `Title / Description / URL` header followed by
a `=====` separator, which `scripts/story-parser.js` reads.

Usage:
  uv run download_stories.py --author https://www.example.com/authors/Name
  uv run download_stories.py --list stories.txt --out Downloaded_Stories
"""

from __future__ import annotations

import argparse
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}
PAGE_DELAY = 1.0  # seconds between pages of one story
STORY_DELAY = 1.5  # seconds between stories


def sanitize_filename(name: str) -> str:
    """Remove characters that are illegal in Windows/macOS/Linux filenames."""
    return re.sub(r'[\\/*?:"<>|]', "", name).strip()


def clean_text(text: str) -> str:
    """Normalise newlines and unescape JS/JSON string escapes."""
    if not text:
        return ""
    text = text.replace("\\r\\n", "\n").replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("\\n", "\n").replace("\\t", "\t")
    text = text.replace('\\"', '"').replace("\\'", "'")
    return text.strip()


def extract_json_payload(soup: BeautifulSoup) -> str | None:
    """Return the inline <script> that holds the page's story data, if any."""
    for script in soup.find_all("script"):
        if script.string and ("pageText" in script.string or "pages_count" in script.string):
            return script.string
    return None


def _match(pattern: str, text: str, flags: int = 0) -> str:
    m = re.search(pattern, text, flags)
    return m.group(1) if m else ""


def parse_page(html: str) -> tuple[str, str, str, int]:
    """Return (title, description, page_text, pages_count) for one story page."""
    soup = BeautifulSoup(html, "html.parser")
    payload = extract_json_payload(soup)
    title = description = page_text = ""
    pages_count = 1

    if payload:
        # A JS string literal: anything except an unescaped quote (so \" inside text is kept)
        js_str = r'"((?:[^"\\]|\\.)*)"'
        page_text = clean_text(_match(r"pageText:\s*" + js_str, payload, re.DOTALL))
        title = clean_text(_match(r"title:\s*" + js_str, payload))
        description = clean_text(_match(r"description:\s*" + js_str, payload))
        pages_count = int(_match(r"pages_count:\s*(\d+)", payload) or 1)

    # DOM fallback when the embedded payload is missing or empty
    if not page_text:
        if not title:
            h1 = soup.find("h1")
            title = h1.get_text(strip=True) if h1 else ""
        body = soup.find("div", class_="aa_ht") or soup.find("div", class_="b-story-body-span")
        if body:
            page_text = body.get_text(separator="\n\n", strip=True)

    return title, description, page_text, pages_count


def fetch(session: requests.Session, url: str) -> str:
    res = session.get(url, headers=HEADERS, timeout=30)
    res.raise_for_status()
    return res.text


def get_author_story_links(session: requests.Session, works_url: str) -> list[str]:
    """Collect every unique /s/<slug> story link on an author's works page."""
    print(f"Fetching story list from {works_url} ...")
    soup = BeautifulSoup(fetch(session, works_url), "html.parser")
    links = {
        urljoin(works_url, a["href"]).split("?")[0]
        for a in soup.find_all("a", href=True)
        if "/s/" in a["href"]
    }
    print(f"Found {len(links)} unique stories.")
    return sorted(links)


def load_urls(path: Path) -> list[str]:
    """Read URLs from a file, skipping blank lines and # comments."""
    lines = path.read_text(encoding="utf-8").splitlines()
    return [ln.strip() for ln in lines if ln.strip() and not ln.strip().startswith("#")]


def download_story(
    session: requests.Session, story_url: str, skip_names: set[str] = frozenset()
) -> tuple[str, str, str] | None:
    """Fetch every page of a story and return (title, description, body).

    Returns None (after only one request) when the story's filename is in skip_names.
    """
    base_url = story_url.split("?")[0]
    title, description, first_text, total = parse_page(fetch(session, base_url))
    if (sanitize_filename(title) or base_url.rstrip("/").split("/")[-1]) in skip_names:
        return None
    pages = [first_text]
    print(f" -> '{title or base_url}' ({total} page(s))")

    for n in range(2, total + 1):
        time.sleep(PAGE_DELAY)
        print(f"    page {n}/{total}")
        try:
            _, _, text, _ = parse_page(fetch(session, f"{base_url}?page={n}"))
        except requests.RequestException as e:
            print(f"    ! page {n} failed: {e}")
            continue
        if text:
            pages.append(text)
        else:
            print(f"    ! no text found on page {n}")

    return title, description, "\n\n".join(pages)


def save_story(out_dir: Path, url: str, title: str, description: str, body: str) -> Path:
    name = sanitize_filename(title) or url.rstrip("/").split("/")[-1]
    header = f"Title: {title}\n"
    if description:
        header += f"Description: {description}\n"
    header += f"URL: {url}\n" + "=" * 50 + "\n\n"
    path = out_dir / f"{name}.txt"
    path.write_text(header + body, encoding="utf-8")
    return path


def main() -> int:
    parser = argparse.ArgumentParser(description="Download multi-page web stories as .txt files.")
    src = parser.add_mutually_exclusive_group(required=True)
    src.add_argument("--author", metavar="URL", help="author works page to scrape for story links")
    src.add_argument("--list", metavar="FILE", type=Path, help="text file of story URLs, one per line")
    parser.add_argument("--out", type=Path, default=Path("Stories"), help="output folder (default: Stories)")
    parser.add_argument("--skip-existing", action="store_true", help="skip stories whose .txt already exists")
    args = parser.parse_args()

    session = requests.Session()
    if args.list:
        if not args.list.exists():
            print(f"Error: '{args.list}' not found.", file=sys.stderr)
            return 1
        urls = load_urls(args.list)
    else:
        urls = get_author_story_links(session, args.author)

    if not urls:
        print("No story URLs to process.")
        return 1

    args.out.mkdir(parents=True, exist_ok=True)
    existing = {p.stem for p in args.out.glob("*.txt")} if args.skip_existing else set()
    ok = failed = 0

    for i, url in enumerate(urls, start=1):
        print(f"\n[{i}/{len(urls)}] {url}")
        try:
            story = download_story(session, url, existing)
            if story is None:
                print(" -> skipped (exists)")
                continue
            title, description, body = story
            path = save_story(args.out, url, title, description, body)
            print(f"Saved: {path.name}")
            ok += 1
        except requests.RequestException as e:
            print(f"Error: {e}")
            failed += 1
        time.sleep(STORY_DELAY)

    print(f"\nDone. {ok} saved, {failed} failed -> '{args.out}'")
    return 0 if failed == 0 else 2


if __name__ == "__main__":
    sys.exit(main())
