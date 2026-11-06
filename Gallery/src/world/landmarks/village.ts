/** Tools Valley: a little village of houses with smoking chimneys around a well */
import * as THREE from "three"
import { mulberry32 } from "../../utils/math.ts"
import { createSite, mat, mesh, placeOnGround, type Landmark } from "./kit.ts"

const WALLS = ["#fff1dc", "#ffe0c2", "#f9d6d0", "#e6f0ff", "#f1f7dd"]
const ROOFS = ["#d0674a", "#b8543c", "#c96f3b", "#9c5a7a"]

function house(rand: () => number) {
  const g = new THREE.Group()
  const w = 1.7 + rand() * 0.8
  const h = 1.3 + rand() * 0.7
  const d = 1.6 + rand() * 0.5
  const body = mesh(new THREE.BoxGeometry(w, h, d), mat(WALLS[Math.floor(rand() * WALLS.length)]))
  body.position.y = h / 2
  g.add(body)

  const roof = mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, 1.1 + rand() * 0.4, 4), mat(ROOFS[Math.floor(rand() * ROOFS.length)]))
  roof.rotation.y = Math.PI / 4
  roof.position.y = h + 0.5
  g.add(roof)

  const door = mesh(new THREE.BoxGeometry(0.45, 0.75, 0.05), mat("#6b4a3a"), false)
  door.position.set(0, 0.375, d / 2 + 0.02)
  g.add(door)

  const pane = mesh(new THREE.BoxGeometry(0.4, 0.4, 0.05), mat("#9fd8ff", { emissive: "#ffd98a", emissiveIntensity: 0.25 }), false)
  pane.position.set(w * 0.28, h * 0.62, d / 2 + 0.02)
  g.add(pane)

  let chimneyTop: THREE.Vector3 | null = null
  if (rand() > 0.35) {
    const chimney = mesh(new THREE.BoxGeometry(0.32, 0.9, 0.32), mat("#8d7b70"))
    chimney.position.set(w * 0.25, h + 0.75, -d * 0.15)
    g.add(chimney)
    chimneyTop = chimney.position.clone().setY(h + 1.25)
  }
  return { group: g, chimneyTop }
}

export function createVillage(angle: number, t: number): Landmark {
  const site = createSite(angle, t)
  const rand = mulberry32(42)
  const smokeMaterial = mat("#f4f4f4", { transparent: true, opacity: 0.75, roughness: 1 })
  const puffs: { mesh: THREE.Mesh; origin: THREE.Vector3; phase: number }[] = []

  // Houses on a loose ring around the well, all turned to face it
  const count = 8
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + rand() * 0.3
    const r = 4.4 + rand() * 1.6
    const lx = Math.cos(a) * r
    const lz = Math.sin(a) * r
    const { group, chimneyTop } = house(rand)
    group.rotation.y = Math.atan2(-lx, -lz)
    placeOnGround(site, group, lx, lz)
    if (chimneyTop) {
      group.updateMatrixWorld()
      const origin = chimneyTop.clone().applyMatrix4(group.matrix)
      for (let k = 0; k < 4; k++) {
        const puff = mesh(new THREE.IcosahedronGeometry(0.28, 0), smokeMaterial, false)
        site.group.add(puff)
        puffs.push({ mesh: puff, origin, phase: k / 4 + rand() * 0.1 })
      }
    }
  }

  // The well in the middle of the plaza
  const well = new THREE.Group()
  const ring = mesh(new THREE.CylinderGeometry(0.75, 0.8, 0.7, 8), mat("#a99c90"))
  ring.position.y = 0.35
  const water = mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 8), mat("#59b8e6", { roughness: 0.2 }), false)
  water.position.y = 0.62
  const roof = mesh(new THREE.ConeGeometry(1.1, 0.7, 4), mat("#b8543c"))
  roof.rotation.y = Math.PI / 4
  roof.position.y = 2.1
  for (const side of [-0.6, 0.6]) {
    const post = mesh(new THREE.BoxGeometry(0.12, 1.5, 0.12), mat("#7a5a43"))
    post.position.set(side, 1.1, 0)
    well.add(post)
  }
  well.add(ring, water, roof)
  placeOnGround(site, well, 0, 0)

  return {
    group: site.group,
    update(_dt, time) {
      // Each puff rises, grows and shrinks away on a 3-second loop
      for (const p of puffs) {
        const life = (time / 3 + p.phase) % 1
        p.mesh.position.set(p.origin.x + Math.sin(life * 5 + p.phase * 9) * 0.25, p.origin.y + life * 2.6, p.origin.z + life * 0.4)
        p.mesh.scale.setScalar(Math.sin(life * Math.PI) * 1.2 + 0.05)
      }
    },
  }
}
