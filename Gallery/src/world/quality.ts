/** Rendering budgets: phones get a lighter island, desktops get shadows and post-processing */
export interface Quality {
  tier: "high" | "low"
  maxPixelRatio: number
  terrainSegments: number
  waterSegments: number
  shadowMapSize: number
  postprocessing: boolean
  trees: number
  clouds: number
  birds: number
}

const HIGH: Quality = { tier: "high", maxPixelRatio: 2, terrainSegments: 170, waterSegments: 90, shadowMapSize: 2048, postprocessing: true, trees: 380, clouds: 14, birds: 12 }
const LOW: Quality = { tier: "low", maxPixelRatio: 1.5, terrainSegments: 110, waterSegments: 60, shadowMapSize: 1024, postprocessing: false, trees: 220, clouds: 9, birds: 8 }

export function detectQuality(): Quality {
  const params = new URLSearchParams(location.search)
  if (params.get("quality") === "low") return LOW
  if (params.get("quality") === "high") return HIGH
  const coarse = matchMedia("(pointer: coarse)").matches
  const small = Math.min(screen.width, screen.height) < 700
  const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4
  return coarse || small || fewCores ? LOW : HIGH
}

/** True when this browser can create a WebGL2 context */
export function supportsWebGL(): boolean {
  if (new URLSearchParams(location.search).has("no3d")) return false
  try {
    const canvas = document.createElement("canvas")
    return !!canvas.getContext("webgl2")
  } catch {
    return false
  }
}
