/** Low-poly sea: a faceted plane with gentle waves, turquoise in the shallows */
import * as THREE from "three"
import { smoothstep } from "../utils/math.ts"
import { ISLAND_RADIUS } from "./terrain.ts"

export function createWater(segments: number) {
  const geometry = new THREE.PlaneGeometry(2000, 2000, segments, segments)
  geometry.rotateX(-Math.PI / 2)
  const pos = geometry.attributes.position as THREE.BufferAttribute
  const base = Float32Array.from(pos.array)

  const shallow = new THREE.Color("#7fe3dc")
  const deep = new THREE.Color("#2d8fc4")
  const colors = new Float32Array(pos.count * 3)
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const r = Math.hypot(pos.getX(i), pos.getZ(i))
    c.copy(shallow).lerp(deep, smoothstep(ISLAND_RADIUS * 0.95, ISLAND_RADIUS * 1.6, r))
    colors.set([c.r, c.g, c.b], i * 3)
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    transparent: true,
    opacity: 0.86,
    roughness: 0.35,
    metalness: 0.05,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = "sea"
  mesh.receiveShadow = true
  mesh.position.y = -0.15

  // A deep seabed under the transparent water, so nothing but blue shows through past the island
  const seabed = new THREE.Mesh(new THREE.CircleGeometry(1000, 32), new THREE.MeshStandardMaterial({ color: "#2f86b8", roughness: 1 }))
  seabed.rotation.x = -Math.PI / 2
  seabed.position.y = -9
  mesh.add(seabed)

  return {
    mesh,
    update(time: number) {
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3]
        const z = base[i * 3 + 2]
        pos.setY(i, Math.sin(x * 0.11 + time * 0.9) * 0.22 + Math.cos(z * 0.09 + time * 0.7) * 0.22)
      }
      pos.needsUpdate = true
    },
  }
}
