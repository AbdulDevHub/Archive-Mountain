import "../shared/theme.css"
import "../shared/nav"
import "./style.css"

// face-api.js is a prebuilt UMD bundle served from public/ (it defines a global `faceapi`),
// and its models live in public/face-models. Both sit at the root of the built apps folder.

const ROOT = new URL("../", location.href)
const video = document.getElementById("video") as HTMLVideoElement
const overlay = document.getElementById("overlay") as HTMLCanvasElement
const placeholder = document.getElementById("placeholder") as HTMLElement
const status = document.getElementById("status") as HTMLElement
const start = document.getElementById("start") as HTMLButtonElement
const mood = document.getElementById("mood") as HTMLElement

const EMOJI: Record<string, string> = {
  neutral: "😐",
  happy: "😄",
  sad: "😢",
  angry: "😠",
  fearful: "😨",
  disgusted: "🤢",
  surprised: "😮",
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Could not load ${src}`))
    document.head.append(script)
  })
}

let loaded: Promise<void> | null = null
function loadModels(): Promise<void> {
  loaded ??= (async () => {
    await loadScript(new URL("face-api.min.js", ROOT).href)
    const models = new URL("face-models", ROOT).href
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(models),
      faceapi.nets.faceLandmark68Net.loadFromUri(models),
      faceapi.nets.faceExpressionNet.loadFromUri(models),
    ])
  })()
  return loaded
}

function describe(expressions: Record<string, number>): string {
  const [name, score] = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0]
  return `${EMOJI[name] ?? ""} ${name[0].toUpperCase()}${name.slice(1)} (${Math.round(score * 100)}%)`
}

let stream: MediaStream | null = null
let timer = 0

/** Turns the webcam off and stops detection (on errors, and when the page is left) */
function stopCamera(): void {
  window.clearInterval(timer)
  timer = 0
  stream?.getTracks().forEach((t) => t.stop())
  stream = null
  video.srcObject = null
}

function track(): void {
  const size = { width: video.videoWidth, height: video.videoHeight }
  overlay.width = size.width
  overlay.height = size.height
  const ctx = overlay.getContext("2d")!
  const options = new faceapi.TinyFaceDetectorOptions()
  let busy = false
  window.clearInterval(timer)
  timer = window.setInterval(async () => {
    if (busy || video.paused || document.hidden) return
    busy = true
    try {
      const results = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceExpressions()
      const resized = faceapi.resizeResults(results, size)
      ctx.clearRect(0, 0, overlay.width, overlay.height)
      faceapi.draw.drawDetections(overlay, resized)
      faceapi.draw.drawFaceLandmarks(overlay, resized)
      mood.textContent = results.length
        ? results.map((r) => describe(r.expressions)).join(" · ")
        : "No face in view"
    } finally {
      busy = false
    }
  }, 100)
}

start.addEventListener("click", async () => {
  start.disabled = true
  try {
    status.textContent = "Loading the face models (about 7 MB)…"
    await loadModels()
    status.textContent = "Waiting for camera permission…"
    stopCamera()
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
    video.srcObject = stream
    await video.play()
    placeholder.hidden = true
    track()
  } catch (err) {
    stopCamera()
    const denied = err instanceof DOMException && err.name === "NotAllowedError"
    status.textContent = denied
      ? "Camera access was blocked. Allow it in your browser's site settings, then try again."
      : `Something went wrong: ${err instanceof Error ? err.message : String(err)}`
    start.disabled = false
  }
})

// Release the webcam when the visitor leaves the page
window.addEventListener("pagehide", stopCamera)
