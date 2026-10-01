import fs from "node:fs/promises";
import path from "node:path";
import { KokoroTTS } from "kokoro-js";

function cleanTextForTTS(text) {
  return text
    .replace(/([a-zA-Z])\1{2,}/g, "$1$1")
    .replace(/(\w+)\.\.\.(\w+)/g, "$1, $2")
    .replace(/\.\.\./g, "—");
}

async function run() {
  console.log("Loading model...");
  const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
    dtype: "q8",
  });

  console.log("Reading story.txt...");
  const rawText = await fs.readFile("story.txt", "utf-8");
  const cleanedText = cleanTextForTTS(rawText);

  // Access the voices list directly from the instance property
  const voicesObj = tts.voices || KokoroTTS.voices || {};
  const afVoices = Object.keys(voicesObj).filter((voiceKey) =>
    voiceKey.startsWith("af_")
  );

  console.log(`\nFound ${afVoices.length} 'af' voices: ${afVoices.join(", ")}`);

  const outputDir = "./voice_samples";
  await fs.mkdir(outputDir, { recursive: true });

  for (const voice of afVoices) {
    console.log(`\nGenerating audio for [${voice}]...`);
    const start = performance.now();

    try {
      const audio = await tts.generate(cleanedText, { voice });
      const duration = ((performance.now() - start) / 1000).toFixed(2);

      const outputPath = path.join(outputDir, `${voice}.wav`);
      await audio.save(outputPath);
      console.log(`Saved ${voice}.wav (${duration}s)`);
    } catch (err) {
      console.error(`Failed to generate audio for ${voice}:`, err.message);
    }
  }

  console.log(`\nDone! All voice samples saved to ${path.resolve(outputDir)}`);
}

run().catch(console.error);

// af_heart, af_alloy, af_aoede, af_bella, af_jessica, af_kore, af_nicole, af_nova, af_river, af_sarah, af_sky
// BEST: af_nicole, af_heart, af_bella