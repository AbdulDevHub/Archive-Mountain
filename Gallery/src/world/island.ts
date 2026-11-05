/**
 * Builds the island mesh from the pure terrain functions: a displaced grid,
 * split into separate triangles so every face gets one flat colour (the
 * low-poly look), plus a small shader patch that makes a valley glow on hover.
 */
import * as THREE from "three"
import { SECTIONS } from "../data/sections.ts"
import { angleDiff, smoothstep } from "../utils/math.ts"
import { coastRadius, heightAt, ISLAND_RADIUS, SNOW_LINE, valleyAt } from "./terrain.ts"

const PALETTE = {
  seabed: new THREE.Color("#3f9fb8"),
  wetSand: new THREE.Color("#d9bf86"),
  sand: new THREE.Color("#f2dca4"),
  alpine: new THREE.Color("#93b47c"),
  rock: new THREE.Color("#a59789"),
  darkRock: new THREE.Color("#857a70"),
  snow: new THREE.Color("#f6faff"),
}
const GRASS = SECTIONS.map((s) => new THREE.Color(s.grass))

/** Per-face pseudo-random brightness jitter, so neighbouring faces read as facets */
function jitter(x: number, z: number): number {
  const h = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453
  return (h - Math.floor(h) - 0.5) * 0.07
}

/** Soft blend of the five valley grasses by direction, fading to alpine grass near the peak */
function grassAt(x: number, z: number, target: THREE.Color): THREE.Color {
  const theta = Math.atan2(z, x)
  target.setRGB(0, 0, 0)
  let total = 0
  SECTIONS.forEach((s, i) => {
    const d = angleDiff(theta, s.angle) / 0.55
    const w = Math.exp(-d * d)
    target.r += GRASS[i].r * w
    target.g += GRASS[i].g * w
    target.b += GRASS[i].b * w
    total += w
  })
  target.multiplyScalar(1 / total)
  const t = Math.hypot(x, z) / coastRadius(theta)
  return target.lerp(PALETTE.alpine, 1 - smoothstep(0.2, 0.45, t))
}

const scratch = new THREE.Color()

export function faceColor(x: number, y: number, z: number, slope: number, out: THREE.Color): THREE.Color {
  if (y < -2.5) out.copy(PALETTE.seabed)
  else if (y < -0.4) out.copy(PALETTE.wetSand).lerp(PALETTE.seabed, smoothstep(-0.4, -2.5, y))
  else if (y < 0.9) out.copy(PALETTE.sand)
  else {
    grassAt(x, z, out)
    const rockiness = Math.max(smoothstep(0.32, 0.55, slope), smoothstep(SNOW_LINE - 8, SNOW_LINE - 1, y))
    out.lerp(slope > 0.6 ? PALETTE.darkRock : PALETTE.rock, rockiness)
    if (y > SNOW_LINE + jitter(x, z) * 40 && slope < 0.62) out.copy(PALETTE.snow)
  }
  const j = jitter(x, z)
  return out.setRGB(out.r + j, out.g + j, out.b + j)
}

/** The grid is square; keep only the round part around the island so no corners show through the sea */
function dropFarTriangles(geometry: THREE.BufferGeometry, radius: number): THREE.BufferGeometry {
  const src = geometry.attributes.position.array
  const kept: number[] = []
  for (let i = 0; i < src.length; i += 9) {
    const cx = (src[i] + src[i + 3] + src[i + 6]) / 3
    const cz = (src[i + 2] + src[i + 5] + src[i + 8]) / 3
    if (Math.hypot(cx, cz) < radius) for (let k = 0; k < 9; k++) kept.push(src[i + k])
  }
  geometry.dispose()
  const result = new THREE.BufferGeometry()
  result.setAttribute("position", new THREE.Float32BufferAttribute(kept, 3))
  return result
}

export interface IslandMesh {
  mesh: THREE.Mesh
  /** Index into SECTIONS to glow, or -1 for none */
  setHighlight(index: number): void
  update(dt: number): void
}

export function createIsland(segments: number): IslandMesh {
  const size = ISLAND_RADIUS * 2.6
  const grid = new THREE.PlaneGeometry(size, size, segments, segments)
  grid.rotateX(-Math.PI / 2)
  const positions = grid.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < positions.count; i++) {
    positions.setY(i, heightAt(positions.getX(i), positions.getZ(i)))
  }

  const geometry = dropFarTriangles(grid.toNonIndexed(), ISLAND_RADIUS * 1.5)
  grid.dispose()
  geometry.computeVertexNormals()

  const pos = geometry.attributes.position as THREE.BufferAttribute
  const normal = geometry.attributes.normal as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)
  const sectionIndex = new Float32Array(pos.count)
  const sectionWeight = new Float32Array(pos.count)

  for (let i = 0; i < pos.count; i += 3) {
    const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3
    const cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3
    const cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3
    faceColor(cx, cy, cz, 1 - normal.getY(i), scratch)
    const valley = valleyAt(cx, cz)
    const weight = cy > -0.5 ? smoothstep(0.15, 0.7, valley.strength) : 0
    for (let k = 0; k < 3; k++) {
      colors.set([scratch.r, scratch.g, scratch.b], (i + k) * 3)
      sectionIndex[i + k] = valley.index
      sectionWeight[i + k] = weight
    }
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute("aSection", new THREE.BufferAttribute(sectionIndex, 1))
  geometry.setAttribute("aSectionWeight", new THREE.BufferAttribute(sectionWeight, 1))

  const material = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.92, metalness: 0 })
  const uniforms = {
    uHighlight: { value: -1 },
    uGlowColor: { value: new THREE.Color() },
    uGlowStrength: { value: 0 },
  }
  // Inject the hover glow into three's standard shader instead of writing a whole new one
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute float aSection;\nattribute float aSectionWeight;\nuniform float uHighlight;\nvarying float vGlow;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvGlow = abs(aSection - uHighlight) < 0.5 ? aSectionWeight : 0.0;",
      )
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uGlowColor;\nuniform float uGlowStrength;\nvarying float vGlow;")
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uGlowColor * vGlow * uGlowStrength;",
      )
  }

  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  mesh.castShadow = true
  mesh.name = "island"

  let target = -1
  return {
    mesh,
    setHighlight(index) {
      target = index
      if (index >= 0) {
        uniforms.uHighlight.value = index
        uniforms.uGlowColor.value.set(SECTIONS[index].accent)
      }
    },
    update(dt) {
      // Fade the glow in and out rather than snapping
      const goal = target >= 0 ? 0.2 : 0
      const u = uniforms.uGlowStrength
      u.value += (goal - u.value) * Math.min(1, dt * 8)
      if (target < 0 && u.value < 0.005) uniforms.uHighlight.value = -1
    },
  }
}
