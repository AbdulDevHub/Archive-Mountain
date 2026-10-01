# Automation Mountain

A collection of small personal automation tools, grouped by project.

| Folder | What it is |
| --- | --- |
| `Project Valley/Audio Generation` | Batch text-to-speech narration for stories (Kokoro TTS) |
| `Script Valley` | Python scrapers for story text, plus a video loop-point finder |
| `Tapermonkey Valley` | Tampermonkey userscripts for scrolling, video, and site tweaks |

---

## 📖 Project Valley — Audio Generation

**Fiery Passages**: a batch generator that turns plain `.txt` story files into narrated `.wav` audio using the [Kokoro-82M](https://huggingface.co/onnx-community/Kokoro-82M-ONNX) model (via `kokoro-js`, running locally through ONNX).

### Files

| File | Purpose |
| --- | --- |
| `generate.mjs` | Main batch generator — reads a stories folder, writes WAVs |
| `voice-comparision.mjs` | Renders every `af_*` voice from the same text for comparison |
| `scripts/story-parser.js` | Extracts the title and body from a story file's header |
| `scripts/chunker.js` | Splits long text into synthesis-friendly chunks |
| `scripts/wav.js` | Silence trimming, chunk stitching, and 16-bit PCM WAV encoding |
| `story.txt` | Sample input used for voice comparison |

### Setup

```bash
cd "Project Valley/Audio Generation"
bun install          # or: npm install
```

`kokoro-js` pulls the model weights on first run, so the first invocation needs a network connection.

### Usage

```bash
# Generate audio for every .txt in ./stories -> ./audio
node generate.mjs

# Explicit paths and options
node generate.mjs "C:\path\to\stories" --out "C:\path\to\audio" --voice af_nicole --limit 5 --force
```

| Flag | Default | Description |
| --- | --- | --- |
| *(positional)* | `./stories` | Folder containing story `.txt` files |
| `--out` | `./audio` | Output folder for `.wav` files (created if missing) |
| `--voice` | `af_bella` | Kokoro voice id |
| `--limit` | all | Only process the first N stories |
| `--force` | off | Regenerate even if a `.wav`/`.mp3` already exists |

**Behaviour notes**

- Existing audio is skipped by default, so re-runs only fill in what's missing.
- Each story is chunked, synthesized chunk by chunk, then stitched together with short pauses.
- Failed chunks are reported and skipped rather than aborting the whole story.

**Recommended voices** (from `voice-comparision.mjs`): `af_nicole`, `af_heart`, `af_bella`.

To audition voices yourself:

```bash
node voice-comparision.mjs     # writes ./voice_samples/<voice>.wav
```

---

## 🐍 Script Valley

Standalone Python scripts. Install the needed packages before running.

```bash
pip install requests beautifulsoup4
```

### `download_stories.py`

Scrapes every story linked from an author's works page and saves each one as a `.txt` file in `Stories/`.

- Edit `AUTHOR_WORKS_URL` at the top to point at the author page you want.
- Reads the embedded JSON payload in the page (`pageText`, `pages_count`, `title`, `description`), with a DOM fallback.
- Walks every page of a multi-page story and joins the text.
- Each file gets a `Title / Description / URL` header, which `story-parser.js` later reads.
- Requests are throttled to one per 1.5s.

### `download_from_list.py`

Same downloader, but driven by a `stories.txt` file of URLs (one per line, `#` comments allowed) instead of an author page. Output goes to `Downloaded_Stories/`.

### `find_loop.py`

Finds the best loop point in a video and exports a seamless `.webm` clip with audio intact.

- Reads a hardcoded `video_files` list at the bottom of the script — edit it first.
- Skips the first 45 seconds, then scans for the frame most visually similar to the anchor (grayscale, resized to 256×256, lowest MSE).
- Slices from the anchor to that frame and hands off to `ffmpeg.exe`, expected one level above the script (repo root).
- Uses the PEP 723 inline dependency header, so it can be run with `uv run find_loop.py`.

---

## 🛠 Tapermonkey Valley

Personal **Tampermonkey userscripts** for scrolling behavior, video display, site appearance, and navigation.

| Script | What it does |
| --- | --- |
| `Disable Bing Scroll.user.js` | Disables scrolling on Bing results, preventing accidental scroll into the Chat/Copilot panel |
| `Fullscreen Toggle.user.js` | Toggles fullscreen on any site — shortcut `Shift + Alt + F` |
| `Hide Scrollbar.user.js` | Hides the scrollbar for distraction-free viewing (incl. `file:///` pages) |
| `Horizontal to Vertical Scroll Remapper.user.js` | Turns horizontal wheel input into vertical scroll, for mice like the Logitech MX Master |
| `Sketchfab.user.js` | Enables model downloads, packaging assets with JSZip + FileSaver |
| `Video Aspect Ratio Stretcher.user.js` | Stretches videos to better fill a 16:10 display |
| `Webtoon Dark Mode.user.js` | Dark background for Webtoon for easier long-form reading |
| `YouTube Shorts to Watch Redirect.user.js` | Redirects Shorts to the standard `/watch` URL, SPA-aware |

### Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) for Chrome/Edge/Brave or Firefox.
2. Open the `.user.js` file — Tampermonkey will offer to install it.
3. Make sure the script is enabled in the Tampermonkey dashboard.

Most scripts need no configuration. To tweak one, edit it from the Tampermonkey dashboard (constants, keybindings, or CSS values) and refresh the page.

---

## ⚠️ Disclaimer

Everything here is provided **as-is**, with no warranty.

- Use at your own risk.
- Sites change — scrapers and userscripts may break without notice.
- Respect each site's terms of service and content licenses.
