import fs from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { KokoroTTS } from "kokoro-js"
import { parseStoryFile } from "./scripts/story-parser.js"
import { chunkText } from "./scripts/chunker.js"
import { encodeWav, trimSilence } from "./scripts/wav.js"

// Stories always live in ./stories, generated audio goes to ./audio
const DEFAULT_TARGET_DIR = "./stories"
const DEFAULT_OUTPUT_DIR = "./audio"

function cleanTextForTTS(text) {
  return String(text || "")
    .replace(/([a-zA-Z])\1{2,}/g, "$1$1")
    .replace(/(\w+)\.\.\.(\w+)/g, "$1, $2")
    .replace(/\.\.\./g, "—")
}

function parseCliArgs() {
  const args = process.argv.slice(2)
  let targetDir = null
  let outputDir = null
  let voice = "af_bella"
  let force = false
  let limit = Infinity

  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === "--voice" && args[i + 1]) {
      voice = args[++i]
    } else if (a === "--out" && args[i + 1]) {
      outputDir = args[++i]
    } else if (a === "--force") {
      force = true
    } else if (a === "--limit" && args[i + 1]) {
      limit = parseInt(args[++i], 10) || Infinity
    } else if (!a.startsWith("-") && !targetDir) {
      targetDir = a
    }
  }

  return {
    targetDir: targetDir || DEFAULT_TARGET_DIR,
    outputDir: outputDir || DEFAULT_OUTPUT_DIR,
    voice,
    force,
    limit,
  }
}

async function main() {
  const { targetDir, outputDir, voice, force, limit } = parseCliArgs()

  console.log("==================================================")
  console.log(" Fiery Passages - Batch Audio Generator")
  console.log("==================================================")

  if (!targetDir || !existsSync(targetDir)) {
    console.error(`\nError: Stories directory not found: "${targetDir}"`)
    console.log("Usage:")
    console.log('  node generate.mjs ["C:\\path\\to\\stories"] [--out "C:\\path\\to\\audio"] [--voice af_bella] [--force] [--limit 5]\n')
    process.exit(1)
  }

  await fs.mkdir(outputDir, { recursive: true })

  console.log(`Stories:   ${path.resolve(targetDir)}`)
  console.log(`Output:    ${path.resolve(outputDir)}`)
  console.log(`Voice:     ${voice} (Bella default)`)
  console.log(`Force:     ${force}`)
  console.log("--------------------------------------------------")

  // Discover all .txt files
  const entries = await fs.readdir(targetDir, { withFileTypes: true })
  const txtFiles = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".txt"))
    .map((e) => e.name)

  if (!txtFiles.length) {
    console.log("No .txt story files found in target directory.")
    return
  }

  console.log(`Found ${txtFiles.length} .txt file(s). Checking for missing audio...`)

  const tasks = []
  for (const fileName of txtFiles) {
    const baseName = path.parse(fileName).name
    const wavPath = path.join(outputDir, `${baseName}.wav`)
    const mp3Path = path.join(outputDir, `${baseName}.mp3`)

    const hasAudio = existsSync(wavPath) || existsSync(mp3Path)
    if (hasAudio && !force) {
      // Audio already exists
      continue
    }

    tasks.push({
      fileName,
      filePath: path.join(targetDir, fileName),
      outputPath: wavPath,
    })
  }

  const skippedCount = txtFiles.length - tasks.length
  console.log(`Existing audio skipped: ${skippedCount}`)
  console.log(`To generate:            ${tasks.length}`)

  if (tasks.length === 0) {
    console.log("\nAll story files already have audio! Nothing to generate. Exiting.")
    return
  }

  const toProcess = tasks.slice(0, limit)
  if (toProcess.length < tasks.length) {
    console.log(`Limited to first ${toProcess.length} stories by --limit flag.`)
  }

  // Load Kokoro TTS model
  console.log("\nLoading Kokoro TTS model (q8)...")
  const loadStart = performance.now()
  const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
    dtype: "q8",
  })
  console.log(`Model ready in ${((performance.now() - loadStart) / 1000).toFixed(2)}s\n`)

  let successCount = 0
  let failureCount = 0
  const globalStart = performance.now()

  for (let idx = 0; idx < toProcess.length; idx++) {
    const item = toProcess[idx]
    const storyNum = idx + 1
    console.log(`\n[${storyNum}/${toProcess.length}] Processing: "${item.fileName}"`)

    try {
      const rawContent = await fs.readFile(item.filePath, "utf-8")
      const parsed = parseStoryFile(rawContent, item.fileName)
      const storyText = parsed.text.trim()

      if (!storyText) {
        console.warn(`  Warning: "${item.fileName}" has no story body text. Skipping.`)
        continue
      }

      // Chunk text cleanly
      const chunks = chunkText(storyText)
      console.log(`  Title: "${parsed.title}"`)
      console.log(`  Chunks: ${chunks.length} | Words: ${storyText.split(/\s+/).length}`)

      const audioChunks = []
      let sampleRate = 24000
      const storyStart = performance.now()

      for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
        const chunk = chunks[cIdx]
        const cleanChunk = cleanTextForTTS(chunk.text)
        const t0 = performance.now()

        try {
          const out = await tts.generate(cleanChunk, { voice })
          sampleRate = out.sampling_rate || 24000
          let samples = new Float32Array(out.audio)
          samples = trimSilence(samples, sampleRate)
          audioChunks.push({ samples, pauseSecs: chunk.pauseSecs || 0.08 })

          const chunkDur = ((performance.now() - t0) / 1000).toFixed(2)
          process.stdout.write(`\r  Synthesizing chunk ${cIdx + 1}/${chunks.length} (${chunkDur}s)...`)
        } catch (chunkErr) {
          console.warn(`\n  Warning: chunk ${cIdx + 1} failed: ${chunkErr.message || chunkErr}`)
        }
      }
      process.stdout.write("\n")

      if (!audioChunks.length) {
        console.error(`  Failed to generate any audio for "${item.fileName}"`)
        failureCount++
        continue
      }

      // Stitch all chunks together with pause silence
      let totalSamplesCount = 0
      for (const ac of audioChunks) {
        const pauseSamples = Math.round(ac.pauseSecs * sampleRate)
        totalSamplesCount += ac.samples.length + pauseSamples
      }

      const mergedSamples = new Float32Array(totalSamplesCount)
      let offset = 0
      for (const ac of audioChunks) {
        mergedSamples.set(ac.samples, offset)
        offset += ac.samples.length
        // Remaining pause samples are 0.0 (silence)
        const pauseSamples = Math.round(ac.pauseSecs * sampleRate)
        offset += pauseSamples
      }

      // Encode to 16-bit PCM WAV
      const { blob, duration } = encodeWav(mergedSamples, sampleRate)
      const arrayBuffer = await blob.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      await fs.writeFile(item.outputPath, buffer)
      const storyElapsed = ((performance.now() - storyStart) / 1000).toFixed(1)
      const durFormatted = `${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s`
      console.log(`  ✓ Saved: ${path.basename(item.outputPath)} (${durFormatted} audio in ${storyElapsed}s)`)
      successCount++
    } catch (err) {
      console.error(`  ✗ Error generating "${item.fileName}":`, err.message || err)
      failureCount++
    }
  }

  const totalTime = ((performance.now() - globalStart) / 1000).toFixed(1)
  console.log("\n==================================================")
  console.log(`Generation complete in ${totalTime}s`)
  console.log(`Generated: ${successCount} | Skipped: ${skippedCount} | Failed: ${failureCount}`)
  console.log("==================================================")
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
