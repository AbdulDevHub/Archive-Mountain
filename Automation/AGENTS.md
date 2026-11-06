# AGENTS.md

AI coding agents read this file for project rules, commands and pointers. Keep it short and specific to this repo.
After any meaningful change to this project, update this file, `context/PROGRESS_TRACKER.md`, and the "Project Overview" section of `README.md` to reflect the current state. Do this proactively, without being asked.

## Overview
A monorepo of unrelated personal automation tools, one folder ("valley") per kind of tool. It lives in Archive Mountain; its label sync workflow is the root `.github/workflows/sync-labels.yml`.

## Stack
- `Script Valley/`: Python 3.12 uv project (requests, bs4, opencv-python, numpy, pdf2image, pillow; ruff for dev). Poppler and ffmpeg are external binaries.
- `Project Valley/Audio Generation/`: Node ESM run with bun or node, `kokoro-js` (Kokoro-82M ONNX q8). There's also a Colab notebook port in Python.
- `Tampermonkey Valley/`: standalone `.user.js` userscripts.
- `GitHub Valley/`: Bash + `gh` CLI. The root `.github/workflows/sync-labels.yml` runs it daily using the `LABELS_TOKEN` secret.

## Commands
- Python: `cd "Script Valley" && uv sync && uv run <script>.py --help`; lint with `uv run ruff check .`
- TTS: `cd "Project Valley/Audio Generation" && bun install && bun run generate` (or `bun run voices`)
- Labels: `bash "GitHub Valley/update-all-labels.sh" --dry-run` is read-only and safe; without `--dry-run` it writes to GitHub.
- Verify: cd "Script Valley" && uv run ruff check . && cd .. && bash -n "GitHub Valley/lib/labels.sh" "GitHub Valley/init-labels.sh" "GitHub Valley/update-all-labels.sh" "GitHub Valley/new-repo.sh"

## Conventions
- Python scripts are standalone `argparse` CLIs with a module docstring showing usage. Add new deps with `uv add`, never pip.
- The label scheme lives only in `GitHub Valley/lib/labels.sh`. Keep it in sync with the website page `Dev Mountain/resources/tools-workflow/github-label-setup.md`.
- Bash must work in Git Bash on Windows and on Ubuntu. Use pure-bash string matching, not `echo | grep`. `*.sh` is forced to LF in `.gitattributes`.
- Label renames like `good first issue` → `Good First Issue` differ only in case, so compare names case-sensitively when deciding whether to rename.
- Don't change a userscript's `@name` or `@namespace`, because Tampermonkey would treat it as a new script.
- Story `.txt` files use a `Title:/Description:/URL:` header plus a `=====` line. `download_stories.py` writes it and `scripts/story-parser.js` reads it.

## Boundaries
- Never commit `stories/`, `audio/`, `assets/`, media, PDFs or `ffmpeg.exe` (all git-ignored). The story text is private local data.
- Running the label scripts without `--dry-run` edits labels on every repo, so ask first.
- `Sketchfab.user.js` and `Disable Bing Scroll.user.js` are third-party. Keep their author credits.

## More
- `README.md`: plain-language overview and usage for each valley. Each valley folder has its own README with full options.
- `context/PROGRESS_TRACKER.md`: current state, next steps, session log.
