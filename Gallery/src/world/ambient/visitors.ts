/** The island's visitors: a hot-air balloon, a sailboat and the summit flag */
import * as THREE from "three"
import { heightAt } from "../terrain.ts"

const flat = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.8, ...extra })

function shadowed<T extends THREE.Object3D>(object: T): T {
  object.traverse((o) => {
    o.castShadow = true
    o.receiveShadow = true
  })
  return object
}

export function createBalloon() {
  const balloon = new THREE.Group()
  // Envelope built from eight sphere slices in alternating colours, for stripes
  const envelope = new THREE.Group()
  const stripes = [flat("#ff7a59"), flat("#ffd166")]
  for (let i = 0; i < 8; i++) {
    const slice = new THREE.SphereGeometry(2.4, 1, 6, (i * Math.PI) / 4, Math.PI / 4)
    envelope.add(new THREE.Mesh(slice, stripes[i % 2]))
  }
  envelope.scale.y = 1.2
  envelope.position.y = 3.6
  const basket = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.9), flat("#a47148"))
  for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) {
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 3), flat("#5b4636"))
    rope.position.set(x, 1.1, z)
    balloon.add(rope)
  }
  balloon.add(envelope, basket)
  shadowed(balloon)

  let angle = 2.2
  return {
    object: balloon,
    update(dt: number, time: number) {
      angle += dt * 0.025
      balloon.position.set(Math.cos(angle) * 52, 34 + Math.sin(time * 0.4) * 2, Math.sin(angle) * 52)
      balloon.rotation.y = time * 0.05
    },
  }
}

export function createSailboat() {
  const boat = new THREE.Group()
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.5, 3.6, 6, 1, false, 0, Math.PI), flat("#ffffff"))
  hull.rotation.set(Math.PI / 2, 0, Math.PI)
  hull.position.y = 0.4
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 3.4), flat("#2d6cdf"))
  stripe.position.set(0, 0.6, 0)
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4, 4), flat("#7a5a43"))
  mast.position.y = 2.4
  const sailShape = new THREE.BufferGeometry()
  sailShape.setAttribute("position", new THREE.Float32BufferAttribute([0, 0.7, 0.1, 0, 4.2, 0.1, 0, 0.7, -1.7], 3))
  sailShape.computeVertexNormals()
  const sail = new THREE.Mesh(sailShape, flat("#fff6e8", { side: THREE.DoubleSide }))
  sail.position.y = 0.2
  boat.add(hull, stripe, mast, sail)
  shadowed(boat)

  let angle = 0.4
  return {
    object: boat,
    update(dt: number, time: number) {
      angle -= dt * 0.03
      boat.position.set(Math.cos(angle) * 86, Math.sin(time * 1.3) * 0.15, Math.sin(angle) * 86)
      // Sail along the circle and rock with the waves
      boat.rotation.set(Math.sin(time * 1.1) * 0.06, -angle + Math.PI, Math.sin(time * 0.9) * 0.08)
    },
  }
}

/** A flag on the summit that waves by bending its vertices each frame */
export function createSummitFlag(color: string) {
  const group = new THREE.Group()
  const top = heightAt(0, 0)
  group.position.set(0, top - 0.3, 0)

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 5), flat("#8d7b70"))
  pole.position.y = 2.1
  const cloth = new THREE.PlaneGeometry(2.2, 1.3, 10, 4)
  cloth.translate(1.1, 0, 0)
  const base = Float32Array.from(cloth.attributes.position.array)
  const flag = new THREE.Mesh(cloth, flat(color, { side: THREE.DoubleSide, emissive: color, emissiveIntensity: 0.15 }))
  flag.position.y = 3.5
  const cairn = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), flat("#9b8f86"))
  cairn.position.y = 0.2
  group.add(pole, flag, cairn)
  shadowed(group)

  const pos = cloth.attributes.position as THREE.BufferAttribute
  return {
    object: group,
    update(time: number) {
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3]
        // Waves grow towards the free edge of the flag
        pos.setZ(i, Math.sin(x * 2.6 - time * 5) * 0.16 * x)
      }
      pos.needsUpdate = true
      flag.geometry.computeVertexNormals()
    },
  }
}
