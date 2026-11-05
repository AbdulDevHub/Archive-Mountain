/**
 * Daylight that follows the visitor's local clock: a low warm sun in the
 * morning, a bright high sun at noon, and golden hour in the late afternoon.
 * Night-time visits get a pleasant late morning, so the island is always sunny.
 */
import * as THREE from "three"
import { clamp, lerp } from "../utils/math.ts"

export interface Daylight {
  /** Degrees above the horizon */
  elevation: number
  /** Radians around the island; ~PI/2 puts the sun behind the default camera */
  azimuth: number
  sunColor: string
  sunIntensity: number
  skyTop: string
  skyHorizon: string
}

const KEYFRAMES: { hour: number; light: Daylight }[] = [
  { hour: 7, light: { elevation: 16, azimuth: 0.35 * Math.PI, sunColor: "#ffd2a1", sunIntensity: 2.6, skyTop: "#69aee6", skyHorizon: "#ffe3c7" } },
  { hour: 12.5, light: { elevation: 58, azimuth: 0.55 * Math.PI, sunColor: "#fff5e3", sunIntensity: 3.1, skyTop: "#4b9fe6", skyHorizon: "#d6eeff" } },
  { hour: 18.5, light: { elevation: 14, azimuth: 0.78 * Math.PI, sunColor: "#ffbd77", sunIntensity: 2.6, skyTop: "#6f9fdb", skyHorizon: "#ffd09c" } },
]

const mixColor = (a: string, b: string, t: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString()

/** Pure lookup from an hour (0–24, fractional) to the island's lighting */
export function daylightAt(hour: number): Daylight {
  const h = hour < KEYFRAMES[0].hour || hour > KEYFRAMES[2].hour ? 10.5 : hour
  const [a, b] = h <= KEYFRAMES[1].hour ? [KEYFRAMES[0], KEYFRAMES[1]] : [KEYFRAMES[1], KEYFRAMES[2]]
  const t = clamp((h - a.hour) / (b.hour - a.hour))
  return {
    elevation: lerp(a.light.elevation, b.light.elevation, t),
    azimuth: lerp(a.light.azimuth, b.light.azimuth, t),
    sunColor: mixColor(a.light.sunColor, b.light.sunColor, t),
    sunIntensity: lerp(a.light.sunIntensity, b.light.sunIntensity, t),
    skyTop: mixColor(a.light.skyTop, b.light.skyTop, t),
    skyHorizon: mixColor(a.light.skyHorizon, b.light.skyHorizon, t),
  }
}

export function sunDirection(light: Daylight): THREE.Vector3 {
  const el = THREE.MathUtils.degToRad(light.elevation)
  return new THREE.Vector3(Math.cos(light.azimuth) * Math.cos(el), Math.sin(el), Math.sin(light.azimuth) * Math.cos(el))
}

export function createLights(light: Daylight, shadowMapSize: number) {
  const group = new THREE.Group()

  const hemi = new THREE.HemisphereLight(light.skyTop, "#6d8f5a", 1.1)
  group.add(hemi)

  const sun = new THREE.DirectionalLight(light.sunColor, light.sunIntensity)
  sun.position.copy(sunDirection(light).multiplyScalar(120))
  if (shadowMapSize > 0) {
    sun.castShadow = true
    sun.shadow.mapSize.set(shadowMapSize, shadowMapSize)
    const cam = sun.shadow.camera
    cam.left = cam.bottom = -85
    cam.right = cam.top = 85
    cam.near = 10
    cam.far = 300
    sun.shadow.bias = -0.0006
    sun.shadow.normalBias = 0.6
  }
  group.add(sun)

  return { group, sun }
}
