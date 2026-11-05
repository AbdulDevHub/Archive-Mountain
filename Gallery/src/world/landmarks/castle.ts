/** App Valley: a small castle with corner towers and waving pennants, the valley's full-scale builds */
import * as THREE from "three"
import { createSite, glow, mat, mesh, placeOnGround, type Landmark } from "./kit.ts"

const STONE = "#d8d2c4"
const STONE_DARK = "#b9b1a1"
const ROOF = "#3b6fd8"
const PENNANTS = ["#f97316", "#facc15", "#22c55e", "#ef4444"]

export function createCastle(angle: number, t: number): Landmark {
  const site = createSite(angle, t)
  const castle = new THREE.Group()

  // Curtain walls around a square courtyard, with a gap at the front for the gate
  const half = 3
  const wallGeometry = new THREE.BoxGeometry(half * 2, 1.8, 0.5)
  for (const [x, z, rot] of [
    [0, -half, 0],
    [-half, 0, Math.PI / 2],
    [half, 0, Math.PI / 2],
  ] as const) {
    const wall = mesh(wallGeometry, mat(STONE))
    wall.position.set(x, 0.9, z)
    wall.rotation.y = rot
    castle.add(wall)
  }
  const frontGeometry = new THREE.BoxGeometry(half - 0.9, 1.8, 0.5)
  for (const side of [-1, 1]) {
    const front = mesh(frontGeometry, mat(STONE))
    front.position.set(side * (half / 2 + 0.45), 0.9, half)
    castle.add(front)
  }

  // Battlements: little merlons along the top of every wall
  const merlon = new THREE.BoxGeometry(0.35, 0.35, 0.55)
  const merlons = new THREE.InstancedMesh(merlon, mat(STONE_DARK), 40)
  const m = new THREE.Matrix4()
  let count = 0
  for (let i = 0; i < 8; i++) {
    const u = -half + 0.4 + i * ((half * 2 - 0.8) / 7)
    for (const [x, z, rot] of [
      [u, -half, 0],
      [u, half, 0],
      [-half, u, Math.PI / 2],
      [half, u, Math.PI / 2],
    ] as const) {
      if (z === half && Math.abs(x) < 0.9) continue // leave the gate open
      m.makeRotationY(rot).setPosition(x, 1.97, z)
      merlons.setMatrixAt(count++, m)
    }
  }
  merlons.count = count
  merlons.castShadow = true
  castle.add(merlons)

  // A taller keep at the back of the courtyard
  const keep = mesh(new THREE.BoxGeometry(2.2, 3.6, 2.2), mat(STONE))
  keep.position.set(0, 1.8, -1)
  const keepRoof = mesh(new THREE.ConeGeometry(1.75, 1.6, 4), mat(ROOF))
  keepRoof.position.set(0, 4.4, -1)
  keepRoof.rotation.y = Math.PI / 4
  const lamp = mesh(new THREE.BoxGeometry(0.4, 0.6, 0.05), glow("#fde68a", 1.4), false)
  lamp.position.set(0, 2.6, 0.13)
  castle.add(keep, keepRoof, lamp)

  // Corner towers with pointed roofs and a pennant on each
  const pennants: THREE.Mesh[] = []
  const towerGeometry = new THREE.CylinderGeometry(0.75, 0.85, 2.8, 8)
  const roofGeometry = new THREE.ConeGeometry(0.95, 1.4, 8)
  const poleGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 4)
  const pennantGeometry = new THREE.ConeGeometry(0.22, 0.75, 3)
  pennantGeometry.rotateZ(-Math.PI / 2)
  pennantGeometry.translate(0.37, 0, 0)
  ;[
    [-half, -half],
    [half, -half],
    [-half, half],
    [half, half],
  ].forEach(([x, z], i) => {
    const tower = mesh(towerGeometry, mat(STONE))
    tower.position.set(x, 1.4, z)
    const roof = mesh(roofGeometry, mat(ROOF))
    roof.position.set(x, 3.5, z)
    const pole = mesh(poleGeometry, mat("#6b4a3a"), false)
    pole.position.set(x, 4.6, z)
    const pennant = mesh(pennantGeometry, mat(PENNANTS[i]), false)
    pennant.position.set(x, 4.85, z)
    pennants.push(pennant)
    castle.add(tower, roof, pole, pennant)
  })

  // Gate and a path leading down towards the sea
  const gate = mesh(new THREE.BoxGeometry(1.2, 1.3, 0.1), mat("#6b4a3a"), false)
  gate.position.set(0, 0.65, half + 0.2)
  castle.add(gate)
  placeOnGround(site, castle, 0, -2.5, 0.3)

  const stoneGeometry = new THREE.BoxGeometry(0.7, 0.12, 0.5)
  for (let i = 0; i < 7; i++) {
    const lz = 1.4 + i * 0.75
    placeOnGround(site, mesh(stoneGeometry, mat(STONE_DARK), false), Math.sin(i * 0.9) * 0.3, lz, 0.02)
  }

  return {
    group: site.group,
    update(_dt, time) {
      pennants.forEach((p, i) => {
        p.rotation.y = Math.sin(time * 2.2 + i * 1.3) * 0.45
      })
    },
  }
}
