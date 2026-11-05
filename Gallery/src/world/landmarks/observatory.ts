/** AI Valley: an observatory with a turning dome, a radio dish and orbiting thought-orbs */
import * as THREE from "three"
import { createSite, glow, mat, mesh, placeOnGround, type Landmark } from "./kit.ts"

export function createObservatory(angle: number, t: number): Landmark {
  const site = createSite(angle, t)

  // Building: drum + rotating dome with a slit and telescope
  const building = new THREE.Group()
  const drum = mesh(new THREE.CylinderGeometry(2.3, 2.5, 2.4, 10), mat("#f3f1ec"))
  drum.position.y = 1.2
  const trim = mesh(new THREE.CylinderGeometry(2.45, 2.45, 0.25, 10), mat("#0e9f9f"))
  trim.position.y = 2.45
  const door = mesh(new THREE.BoxGeometry(0.8, 1.3, 0.1), mat("#3d5a6c"), false)
  door.position.set(0, 0.65, 2.45)

  const dome = new THREE.Group()
  dome.position.y = 2.55
  const shell = mesh(new THREE.SphereGeometry(2.3, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat("#cfd8e3", { metalness: 0.35, roughness: 0.4 }))
  const slit = mesh(new THREE.BoxGeometry(0.7, 2.4, 0.2), mat("#24384a"), false)
  slit.position.set(0, 1.2, 1.95)
  slit.rotation.x = -0.6
  const telescope = mesh(new THREE.CylinderGeometry(0.28, 0.36, 3, 8), mat("#55606e", { metalness: 0.6, roughness: 0.35 }))
  telescope.position.set(0, 1.6, 1.2)
  telescope.rotation.x = 0.9
  dome.add(shell, slit, telescope)
  building.add(drum, trim, door, dome)
  placeOnGround(site, building, 0, 0)

  // Radio dish on a mast, slowly scanning the sky
  const dishMount = new THREE.Group()
  const mast = mesh(new THREE.CylinderGeometry(0.12, 0.18, 2.6, 6), mat("#9aa5b1"))
  mast.position.y = 1.3
  const dish = new THREE.Group()
  dish.position.y = 2.7
  const bowl = mesh(new THREE.SphereGeometry(1.2, 10, 4, 0, Math.PI * 2, 0, Math.PI / 3.2), mat("#f7f7f2", { side: THREE.DoubleSide }))
  bowl.rotation.x = Math.PI * 0.6
  const feed = mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 4), mat("#9aa5b1"), false)
  feed.rotation.x = Math.PI * 0.6
  feed.position.set(0, 0.25, 0.35)
  dish.add(bowl, feed)
  dishMount.add(mast, dish)
  placeOnGround(site, dishMount, 4.6, 1.4)

  // Antenna with a blinking beacon
  const antenna = new THREE.Group()
  const pole = mesh(new THREE.CylinderGeometry(0.06, 0.1, 4.2, 5), mat("#8b96a3"))
  pole.position.y = 2.1
  const beaconMaterial = glow("#ff4d6d", 3)
  const beacon = mesh(new THREE.IcosahedronGeometry(0.18, 0), beaconMaterial, false)
  beacon.position.y = 4.3
  antenna.add(pole, beacon)
  placeOnGround(site, antenna, -3.8, -1.5)

  // Glowing orbs circling the dome, a nod to the models running in AI Valley
  const orbs = Array.from({ length: 5 }, (_, i) => {
    const orb = mesh(new THREE.IcosahedronGeometry(0.26, 1), glow(i % 2 ? "#5eead4" : "#7dd3fc", 2.4), false)
    site.group.add(orb)
    return { orb, phase: (i / 5) * Math.PI * 2 }
  })
  const orbHeight = site.groundY(0, 0) + 5.6

  return {
    group: site.group,
    update(_dt, time) {
      dome.rotation.y = Math.sin(time * 0.15) * 1.2
      dish.rotation.y = time * 0.35
      beacon.visible = Math.sin(time * 4) > -0.2
      for (const { orb, phase } of orbs) {
        const a = time * 0.6 + phase
        orb.position.set(Math.cos(a) * 3.6, orbHeight + Math.sin(a * 2) * 0.5, Math.sin(a) * 3.6)
      }
    },
  }
}
