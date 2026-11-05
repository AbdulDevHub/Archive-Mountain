/** A loose flock of gulls circling the mountain, flapping now and then */
import * as THREE from "three"
import { mulberry32 } from "../../utils/math.ts"

function wingGeometry(side: 1 | -1): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry()
  // One triangle per wing, hinged at the body (x = 0)
  g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0.35, 0, 0, -0.3, side * 1.3, 0, -0.1], 3))
  g.computeVertexNormals()
  return g
}

export function createBirds(count: number) {
  const group = new THREE.Group()
  const rand = mulberry32(8)
  const material = new THREE.MeshStandardMaterial({ color: "#fdfdfd", flatShading: true, side: THREE.DoubleSide, roughness: 0.8 })
  const body = new THREE.ConeGeometry(0.16, 0.8, 4).rotateX(Math.PI / 2)
  const left = wingGeometry(-1)
  const right = wingGeometry(1)

  const birds = Array.from({ length: count }, () => {
    const bird = new THREE.Group()
    const l = new THREE.Mesh(left, material)
    const r = new THREE.Mesh(right, material)
    bird.add(new THREE.Mesh(body, material), l, r)
    group.add(bird)
    return {
      bird,
      wings: [l, r] as const,
      radius: 22 + rand() * 26,
      height: 26 + rand() * 10,
      angle: rand() * Math.PI * 2,
      speed: 0.12 + rand() * 0.08,
      phase: rand() * 10,
    }
  })

  return {
    group,
    update(dt: number, time: number) {
      for (const b of birds) {
        b.angle += b.speed * dt
        const y = b.height + Math.sin(time * 0.5 + b.phase) * 1.5
        b.bird.position.set(Math.cos(b.angle) * b.radius, y, Math.sin(b.angle) * b.radius)
        // Face along the circle (tangent direction)
        b.bird.rotation.y = -b.angle
        b.bird.rotation.z = -0.25
        // Flap in bursts, glide in between
        const flapping = Math.sin(time * 0.7 + b.phase) > 0
        const flap = flapping ? Math.sin(time * 14 + b.phase) * 0.6 : 0.12
        b.wings[0].rotation.z = flap
        b.wings[1].rotation.z = -flap
      }
    },
  }
}
