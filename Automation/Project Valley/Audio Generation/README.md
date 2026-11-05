# Fiery Passages: Batch Text-to-Speech With Kokoro-82M

Turns a folder of plain `.txt` files into narrated `.wav` audio using [Kokoro-82M](https://huggingface.co/onnx-community/Kokoro-82M-ONNX) through `kokoro-js`. It runs locally on ONNX (q8) and needs no API key. The model downloads on first run.

## Files

| File | Purpose |
| --- | --- |
| `generate.mjs` | Batch generator: reads a folder of `.txt` files and writes WAVs |
| `voice-comparison.mjs` | Renders every `af_*` voice from `story.txt` into `./voice_samples` |
| `scripts/story-parser.js` | Reads the optional `Title / Description / URL` header and returns the body |
| `scripts/chunker.js` | Splits text into synthesis-sized chunks with sentence, line, paragraph and scene-break pauses |
| `scripts/wav.js` | Silence trimming, chunk stitching, 16-bit PCM WAV encoding |
| `story_audio_colab.ipynb` | Python port for Google Colab's GPU that reads and writes Google Drive and outputs MP3 |
| `story.txt` | Sample input for voice comparison |

## Usage

```bash
bun install
bun run generate                     # ./stories → ./audio
bun run voices                       # audition voices
node generate.mjs "C:\path\to\texts" --out "C:\path\to\audio" --voice af_nicole --limit 5 --force
```

| Flag | Default | Description |
| --- | --- | --- |
| *(positional)* | `./stories` | Folder of `.txt` files |
| `--out` | `./audio` | Output folder (created if missing) |
| `--voice` | `af_bella` | Kokoro voice id |
| `--limit` | all | Only process the first N files |
| `--force` | off | Regenerate even if a `.wav`/`.mp3` already exists |

- Files that already have audio are skipped, so re-runs only fill gaps.
- If a chunk fails, it's reported and skipped. The rest of the file still renders.
- Recommended voices: `af_nicole`, `af_heart`, `af_bella`.
- To shrink output, run `uv run wav_to_mp3.py "../Project Valley/Audio Generation/audio"` from `Script Valley`.

`stories/`, `audio/` and `voice_samples/` are git-ignored.
