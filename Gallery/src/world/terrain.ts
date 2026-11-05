/**
 * The island's shape as pure functions of (x, z). No three.js here, so the
 * terrain can be unit-tested and reused for placing landmarks, trees and the
 * camera.
 *
 * Shape recipe:
 *   1. a cone-like mountain that falls to a beach shelf and then under the sea
 *   2. ridges pushed up everywhere except along the five valley axes
 *   3. each valley carved down to a gently sloping floor
 *   4. a little fractal noise for low-poly character (less on valley floors)
 */
import { createNoise2D } from "simplex-noise"
import { SECTIONS } from "../data/sections.ts"
import { angleDiff, clamp, lerp, mulberry32, smoothstep } from "../utils/math.ts"

export const ISLAND_RADIUS = 64
export const PEAK_HEIGHT = 31
/** Inside this radius a click means "the summit" (All projects) */
export const SUMMIT_RADIUS = 9
export const SNOW_LINE = 26
/** Angular half-width of a valley, in radians */
const VALLEY_WIDTH = 0.42
/** Where along a valley (0 = summit, 1 = coast) its landmark sits */
export const LANDMARK_T = 0.6

const noise = createNoise2D(mulberry32(1337))

function fbm(x: number, z: number, octaves = 4): number {
  let sum = 0
  let amp = 0.5
  let freq = 1
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, z * freq)
    freq *= 2.03
    amp *= 0.5
  }
  return sum
}

/** Coast distance from the centre in a given direction; wobbles so the island is not a perfect circle */
export function coastRadius(theta: number): number {
  return ISLAND_RADIUS * (1 + 0.09 * noise(Math.cos(theta) * 1.4, Math.sin(theta) * 1.4))
}

/** How strongly a point belongs to a valley floor: 0 on ridges, 1 on the valley axis */
export function valleyAt(x: number, z: number): { index: number; strength: number } {
  const r = Math.hypot(x, z)
  const t = r / coastRadius(Math.atan2(z, x))
  const theta = Math.atan2(z, x)
  let best = { index: -1, strength: 0 }
  SECTIONS.forEach((section, index) => {
    const d = angleDiff(theta, section.angle) / VALLEY_WIDTH
    const across = Math.exp(-d * d)
    const along = smoothstep(0.16, 0.42, t) * (1 - smoothstep(1.02, 1.15, t))
    const strength = across * along
    if (strength > best.strength) best = { index, strength }
  })
  return best
}

/** Terrain height at a world position (sea level is y = 0) */
export function heightAt(x: number, z: number): number {
  const theta = Math.atan2(z, x)
  const t = Math.hypot(x, z) / coastRadius(theta)
  const inland = Math.max(0, 1 - t)

  const mountain = PEAK_HEIGHT * Math.pow(inland, 1.25) + 6 * Math.pow(inland, 7)
  const shelf = 5 * (1 - smoothstep(0.7, 1.08, t)) - 2.6 * smoothstep(0.95, 1.22, t) - 7 * smoothstep(1.15, 1.5, t)
  const ridges = 9 * Math.sin(Math.PI * clamp((t - 0.12) / 0.82))

  const valley = valleyAt(x, z).strength
  const ridged = mountain + shelf + ridges * (1 - valley)

  // Valley floors climb gently towards the mountain
  const floor = 2.4 + 7 * (1 - smoothstep(0.28, 0.78, t)) + shelf * 0.2
  const carved = lerp(ridged, Math.min(ridged, floor), valley)

  const roughness = lerp(3.2, 0.6, valley) * smoothstep(1.05, 0.85, t) + 0.4
  return carved + roughness * fbm(x * 0.045, z * 0.045)
}

/** Surface steepness (0 flat … 1 vertical) from finite differences */
export function slopeAt(x: number, z: number, eps = 0.6): number {
  const dx = heightAt(x + eps, z) - heightAt(x - eps, z)
  const dz = heightAt(x, z + eps) - heightAt(x, z - eps)
  const ny = (2 * eps) / Math.hypot(dx, 2 * eps, dz)
  return 1 - ny
}

/** A point on a valley's axis: t = 0 is the summit, t = 1 the coast */
export function valleyPoint(angle: number, t: number): { x: number; y: number; z: number } {
  const r = coastRadius(angle) * t
  const x = Math.cos(angle) * r
  const z = Math.sin(angle) * r
  return { x, y: heightAt(x, z), z }
}

/** A point beside a valley axis, `side` radians off-centre (useful for scattering props) */
export function valleyOffsetPoint(angle: number, t: number, side: number) {
  return valleyPoint(angle + side, t)
}
