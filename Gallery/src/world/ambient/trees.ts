/**
 * Forests: pines on the ridges, round leafy trees on the valley floors.
 * Instanced meshes keep a few hundred trees down to four draw calls.
 */
import * as THREE from "three"
import { SECTIONS } from "../../data/sections.ts"
import { mulberry32 } from "../../utils/math.ts"
import { landmarkT } from "../landmarks/index.ts"
import { coastRadius, heightAt, ISLAND_RADIUS, slopeAt, SNOW_LINE, SUMMIT_RADIUS, valleyAt, valleyPoint } from "../terrain.ts"

/** Keep trees out of the landmarks' footprints */
const CLEARINGS = SECTIONS.map((s) => ({ ...valleyPoint(s.angle, landmarkT(s.landmark)), radius: 8.5 }))

export function treeSpots(count: number, seed = 3) {
  const rand = mulberry32(seed)
  const spots: { x: number; y: number; z: number; scale: number; leafy: boolean }[] = []
  for (let tries = 0; tries < count * 12 && spots.length < count; tries++) {
    const a = rand() * Math.PI * 2
    const r = SUMMIT_RADIUS + 4 + Math.sqrt(rand()) * (ISLAND_RADIUS - SUMMIT_RADIUS)
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    const y = heightAt(x, z)
    if (y < 1.3 || y > SNOW_LINE - 5 || r > coastRadius(a) * 0.97) continue
    if (slopeAt(x, z) > 0.36) continue
    if (CLEARINGS.some((c) => Math.hypot(x - c.x, z - c.z) < c.radius)) continue
    const leafy = valleyAt(x, z).strength > 0.45
    spots.push({ x, y, z, scale: 0.75 + rand() * 0.6, leafy })
  }
  return spots
}

export function createTrees(count: number): THREE.Group {
  const group = new THREE.Group()
  const spots = treeSpots(count)
  const pines = spots.filter((s) => !s.leafy)
  const leafy = spots.filter((s) => s.leafy)

  const trunkMat = new THREE.MeshStandardMaterial({ color: "#7a5a43", flatShading: true, roughness: 0.9 })
  const leafMat = new THREE.MeshStandardMaterial({ color: "#ffffff", flatShading: true, roughness: 0.85 })

  const pineTop = new THREE.ConeGeometry(1.1, 3, 6).translate(0, 2.6, 0)
  const pineTrunk = new THREE.CylinderGeometry(0.18, 0.24, 1.2, 5).translate(0, 0.6, 0)
  const roundTop = new THREE.IcosahedronGeometry(1.15, 0).translate(0, 2.2, 0)
  const roundTrunk = new THREE.CylinderGeometry(0.16, 0.22, 1.6, 5).translate(0, 0.8, 0)

  const pineColors = ["#3f7d4e", "#4a8a55", "#356e45"]
  const leafyColors = ["#6fb35a", "#86c25e", "#9bcf62", "#e6a85a"]

  const build = (spotsOf: typeof spots, top: THREE.BufferGeometry, trunk: THREE.BufferGeometry, palette: string[]) => {
    const tops = new THREE.InstancedMesh(top, leafMat, spotsOf.length)
    const trunks = new THREE.InstancedMesh(trunk, trunkMat, spotsOf.length)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const color = new THREE.Color()
    const rand = mulberry32(spotsOf.length)
    spotsOf.forEach((s, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI * 2)
      m.compose(new THREE.Vector3(s.x, s.y - 0.1, s.z), q, new THREE.Vector3(s.scale, s.scale * (0.9 + rand() * 0.3), s.scale))
      tops.setMatrixAt(i, m)
      trunks.setMatrixAt(i, m)
      tops.setColorAt(i, color.set(palette[Math.floor(rand() * palette.length)]))
    })
    for (const im of [tops, trunks]) {
      im.castShadow = true
      im.receiveShadow = true
      group.add(im)
    }
  }
  build(pines, pineTop, pineTrunk, pineColors)
  build(leafy, roundTop, roundTrunk, leafyColors)
  return group
}
