/** Puffy low-poly clouds that drift slowly around the island */
import * as THREE from "three"
import { mulberry32 } from "../../utils/math.ts"

export function createClouds(count: number) {
  const group = new THREE.Group()
  const rand = mulberry32(21)
  const material = new THREE.MeshStandardMaterial({ color: "#ffffff", flatShading: true, roughness: 1, emissive: "#ffffff", emissiveIntensity: 0.18 })
  const puff = new THREE.IcosahedronGeometry(1, 0)
  const clouds: { object: THREE.Group; radius: number; angle: number; speed: number }[] = []

  for (let i = 0; i < count; i++) {
    const cloud = new THREE.Group()
    const puffs = 3 + Math.floor(rand() * 4)
    for (let k = 0; k < puffs; k++) {
      const p = new THREE.Mesh(puff, material)
      const s = 1.5 + rand() * 1.7
      p.scale.set(s * 1.3, s * 0.8, s)
      p.position.set((k - puffs / 2) * 1.9 + rand(), rand() * 1.2, (rand() - 0.5) * 2.5)
      cloud.add(p)
    }
    const radius = 25 + rand() * 75
    const angle = rand() * Math.PI * 2
    cloud.position.y = 44 + rand() * 12
    group.add(cloud)
    clouds.push({ object: cloud, radius, angle, speed: (0.008 + rand() * 0.012) * (rand() > 0.5 ? 1 : -1) })
  }

  return {
    group,
    update(dt: number) {
      for (const c of clouds) {
        c.angle += c.speed * dt
        c.object.position.x = Math.cos(c.angle) * c.radius
        c.object.position.z = Math.sin(c.angle) * c.radius
        c.object.rotation.y = -c.angle
      }
    },
  }
}
