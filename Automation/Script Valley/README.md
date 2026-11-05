# Script Valley: Python Automation Scripts

Standalone Python CLIs managed as a single [uv](https://docs.astral.sh/uv/) project. Every script supports `--help`.

```bash
uv sync                      # install all dependencies into .venv
uv run <script>.py --help
```

## `merge_pdf_pages.py`: Merge PDF Pages Into One Long Page

Renders each page, trims blank top/bottom margins, and stitches the pages with no visible breaks. The first page's top margin is mirrored at the bottom. Needs [Poppler](https://poppler.freedesktop.org/) on PATH (`winget install oschwartz10612.Poppler`).

```bash
uv run merge_pdf_pages.py input.pdf                  # → input_merged.pdf
uv run merge_pdf_pages.py input.pdf out.pdf --dpi 600 --threshold 240
```

| Option | Default | Description |
| --- | --- | --- |
| `--dpi` | `300` | Rendering DPI |
| `--threshold` | `245` | Pixels darker than this count as content (0–255) |
| `--padding` | `6` | Pixels kept around content at each page join |

## `find_loop.py`: Seamless Video Loop Finder

Takes an anchor frame `--skip` seconds in, scans the rest of the video for the most similar frame (grayscale 256×256, lowest MSE), then cuts anchor → match with ffmpeg stream copy. There's no re-encode and the audio is kept.

```bash
uv run find_loop.py "assets/Brown Noise.webm" "assets/Cozy Cottage.webm"
uv run find_loop.py clip.mp4 --skip 30 --min-length 10 --out loops
```

| Option | Default | Description |
| --- | --- | --- |
| `--skip` | `45` | Anchor time in seconds (skips intros and fade-ins) |
| `--min-length` | `5` | Shortest allowed loop in seconds |
| `--out` | next to input | Output folder for `loop_<name>.<ext>` |
| `--ffmpeg` | PATH, then repo root | Path to ffmpeg |

## `wav_to_mp3.py`: Batch WAV → MP3

Converts narration from `Project Valley/Audio Generation` into speech-quality MP3s with ffmpeg.

```bash
uv run wav_to_mp3.py "../Project Valley/Audio Generation/audio"
uv run wav_to_mp3.py audio --bitrate 96k --delete-wav
```

Options: `--bitrate` (default `64k`), `--out`, `--force` (overwrite existing MP3s), `--delete-wav`, `--ffmpeg`.

## `download_stories.py`: Multi-Page Story Downloader

Saves multi-page web stories as `.txt` files with a `Title / Description / URL` header and a `=====` separator, which `Project Valley/Audio Generation/scripts/story-parser.js` reads.

```bash
uv run download_stories.py --list stories.txt --out Downloaded_Stories
uv run download_stories.py --author https://www.example.com/authors/Name --skip-existing
```

- `--list FILE`: one URL per line; `#` comments and blank lines are ignored.
- `--author URL`: collects every `/s/<slug>` link on an author's works page.
- Reads the page's embedded JSON payload (`pageText`, `pages_count`, `title`, `description`) and falls back to the DOM.
- Waits 1 s between pages and 1.5 s between stories.

Inputs and outputs (`stories.txt`, `Stories/`, `assets/`, `*.pdf`, `*.wav`, `*.mp3`) are git-ignored.
