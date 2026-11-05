/**
 * Small toolkit shared by the landmark builders: a "site" (a local frame on a
 * valley floor that faces the sea) and cached flat-shaded materials.
 */
import * as THREE from "three"
import { heightAt, valleyPoint } from "../terrain.ts"

export interface Landmark {
  group: THREE.Group
  /** Called every frame; `time` is seconds since start */
  update(dt: number, time: number): void
}

export interface Site {
  group: THREE.Group
  /** Ground height in the site's local frame (local +z points out to sea, -z up the mountain) */
  groundY(lx: number, lz: number): number
}

export function createSite(angle: number, t: number): Site {
  const anchor = valleyPoint(angle, t)
  const group = new THREE.Group()
  group.position.set(anchor.x, anchor.y, anchor.z)
  group.rotation.y = Math.PI / 2 - angle
  const cos = Math.cos(group.rotation.y)
  const sin = Math.sin(group.rotation.y)
  return {
    group,
    groundY(lx, lz) {
      // Rotate the local offset into world space, then sample the terrain there
      const wx = anchor.x + lx * cos + lz * sin
      const wz = anchor.z - lx * sin + lz * cos
      return heightAt(wx, wz) - anchor.y
    },
  }
}

const cache = new Map<string, THREE.MeshStandardMaterial>()

/** A flat-shaded material, shared between every mesh that asks for the same look */
export function mat(color: string, options: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial {
  const key = color + JSON.stringify(options)
  let m = cache.get(key)
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, ...options })
    cache.set(key, m)
  }
  return m
}

/** A glowing material: bright enough to catch the bloom pass */
export function glow(color: string, intensity = 2.2): THREE.MeshStandardMaterial {
  return mat(color, { emissive: color, emissiveIntensity: intensity, roughness: 0.4 })
}

export function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, shadows = true): THREE.Mesh {
  const m = new THREE.Mesh(geometry, material)
  m.castShadow = shadows
  m.receiveShadow = shadows
  return m
}

/** Places an object on the ground of a site, sunk slightly so it never floats on slopes */
export function placeOnGround(site: Site, object: THREE.Object3D, lx: number, lz: number, sink = 0.15) {
  object.position.set(lx, site.groundY(lx, lz) - sink, lz)
  site.group.add(object)
  return object
}
