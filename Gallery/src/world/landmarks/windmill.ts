/** UI Experiments: a windmill above striped tulip fields, like a colour palette laid on the ground */
import * as THREE from "three"
import { mulberry32 } from "../../utils/math.ts"
import { createSite, mat, mesh, placeOnGround, type Landmark } from "./kit.ts"

const TULIP_ROWS = ["#ef4444", "#facc15", "#f472b6", "#a855f7", "#fb923c", "#ffffff"]

export function createWindmill(angle: number, t: number): Landmark {
  const site = createSite(angle, t)
  const rand = mulberry32(5)

  const mill = new THREE.Group()
  const tower = mesh(new THREE.CylinderGeometry(0.95, 1.5, 5.2, 8), mat("#fbf3e4"))
  tower.position.y = 2.6
  const band = mesh(new THREE.CylinderGeometry(1.32, 1.36, 0.3, 8), mat("#c0563f"))
  band.position.y = 1.3
  const cap = mesh(new THREE.ConeGeometry(1.25, 1.6, 8), mat("#a3593e"))
  cap.position.y = 5.95
  const door = mesh(new THREE.BoxGeometry(0.6, 1, 0.1), mat("#6b4a3a"), false)
  door.position.set(0, 0.5, 1.42)

  // Blades turn around the hub, which faces out to sea (+z)
  const rotor = new THREE.Group()
  rotor.position.set(0, 4.9, 1.15)
  const hub = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 6), mat("#6b4a3a"))
  hub.rotation.x = Math.PI / 2
  rotor.add(hub)
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group()
    arm.rotation.z = (i / 4) * Math.PI * 2
    const spar = mesh(new THREE.BoxGeometry(0.12, 3.4, 0.08), mat("#7a5a43"))
    spar.position.y = 1.8
    const sail = mesh(new THREE.BoxGeometry(0.75, 2.6, 0.04), mat("#fffaf0"))
    sail.position.set(0.45, 2.1, 0)
    arm.add(spar, sail)
    rotor.add(arm)
  }
  mill.add(tower, band, cap, door, rotor)
  placeOnGround(site, mill, 0, -3)

  // Tulip fields: rows of little coloured blooms in front of the mill
  const bloomGeometry = new THREE.IcosahedronGeometry(0.16, 0)
  TULIP_ROWS.forEach((color, row) => {
    const field = new THREE.InstancedMesh(bloomGeometry, mat(color), 16)
    const m = new THREE.Matrix4()
    for (let i = 0; i < 16; i++) {
      const lx = -4 + i * 0.55 + (rand() - 0.5) * 0.15
      const lz = 1 + row * 0.8 + (rand() - 0.5) * 0.15
      m.makeTranslation(lx, site.groundY(lx, lz) + 0.25, lz)
      field.setMatrixAt(i, m)
    }
    field.castShadow = true
    site.group.add(field)
  })

  // A short fence around the fields
  const postGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.1)
  const fenceMat = mat("#8a6a50")
  for (let i = 0; i <= 10; i++) {
    const lx = -4.4 + i * 0.95
    placeOnGround(site, mesh(postGeometry, fenceMat), lx, 0.4, -0.25)
    placeOnGround(site, mesh(postGeometry, fenceMat), lx, 6, -0.25)
  }

  return {
    group: site.group,
    update(dt) {
      rotor.rotation.z -= dt * 0.9
    },
  }
}
