# Progress Tracker

This is the running record of where the project stands, so a new session can pick up without rediscovering it.
Update it after any meaningful change: current state, what's in progress, next steps, and a dated log entry.
Most recent log entries go first. When old entries stop being useful, fold them into "Earlier history".

## Current state
- Script Valley has 4 uv-managed CLIs: `merge_pdf_pages.py`, `find_loop.py`, `wav_to_mp3.py`, and `download_stories.py` (which combines the old author-page and URL-list downloaders behind `--author` and `--list`).
- Audio Generation works locally (`bun run generate`). The Colab notebook port outputs MP3 to Google Drive.
- GitHub Valley: `init-labels.sh`, `update-all-labels.sh` (`--since`, `--only-outdated`, `--dry-run`, `--owner`), `new-repo.sh`, and the shared `lib/labels.sh`. All 39 repos matched the scheme on 2026-11-03, after the 5 outdated ones were updated.
- The daily `Sync Labels` workflow is written but needs the `LABELS_TOKEN` secret before it can run.
- The repo description, homepage and 16 topics are set on GitHub. The social preview image is at `.github/assets/social-preview.png`.

## In progress
- Nothing active.

## Next steps
- User: add the `LABELS_TOKEN` secret, then run the workflow once from the Actions tab.
- User: upload `.github/assets/social-preview.png` under Settings → General → Social preview (there's no API for this).
- Possible: give `generate.mjs` an `--mp3` flag so it can call ffmpeg directly.

## Session log
- **2026-11-03**: Reorganized the repo. Renamed `Tapermonkey Valley` → `Tampermonkey Valley` and `voice-comparision.mjs` → `voice-comparison.mjs`. Merged the two story downloaders into one. Turned `find_loop.py` into a CLI and fixed its uint8 MSE overflow by switching to float32. Added `merge_pdf_pages.py` from the website and implemented its `--padding` option. Added `wav_to_mp3.py`. Added the GitHub label scripts from the website, refactored them onto a shared lib, and fixed the substring and case-only rename bugs. Added `new-repo.sh` and the daily Sync Labels Action. Wrote new READMEs, an OG image, repo topics, and AGENTS.md. Also committed the `chunk.pause` fix in `generate.mjs`: the chunker emits `pause`, not `pauseSecs`.

## Earlier history
- The project started as a Tampermonkey userscript collection. The Kokoro TTS batch generator and Python story scrapers were added later, and the generator moved from npm to bun.
