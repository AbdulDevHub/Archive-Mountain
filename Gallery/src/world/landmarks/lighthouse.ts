/** Game Valley: a lighthouse on the point, a pier reaching into the sea and a rope bridge */
import * as THREE from "three"
import { createSite, glow, mat, mesh, placeOnGround, type Landmark } from "./kit.ts"

function ropeBridge(span: number, planks: number): THREE.Group {
  const bridge = new THREE.Group()
  const plankGeometry = new THREE.BoxGeometry(1.3, 0.08, 0.32)
  const wood = mat("#a47148")
  for (let i = 0; i <= planks; i++) {
    const u = i / planks
    const plank = mesh(plankGeometry, wood)
    // A shallow catenary-like sag in the middle
    plank.position.set(0, -Math.sin(u * Math.PI) * 0.7, (u - 0.5) * span)
    bridge.add(plank)
  }
  for (const side of [-0.7, 0.7]) {
    const points = Array.from({ length: 12 }, (_, i) => {
      const u = i / 11
      return new THREE.Vector3(side, 0.7 - Math.sin(u * Math.PI) * 0.6, (u - 0.5) * span)
    })
    const rope = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, 0.04, 4), mat("#6b4a3a"), false)
    bridge.add(rope)
  }
  return bridge
}

export function createLighthouse(angle: number, t: number): Landmark {
  // The lighthouse stands near the coast rather than mid-valley
  const site = createSite(angle, t)

  const tower = new THREE.Group()
  const stripes = 5
  for (let i = 0; i < stripes; i++) {
    const r0 = 1.25 - i * 0.12
    const r1 = 1.25 - (i + 1) * 0.12
    const segment = mesh(new THREE.CylinderGeometry(r1, r0, 1.4, 10), mat(i % 2 ? "#ffffff" : "#e5484d"))
    segment.position.y = 0.7 + i * 1.4
    tower.add(segment)
  }
  const top = stripes * 1.4
  const gallery = mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.2, 10), mat("#2f3b48"))
  gallery.position.y = top + 0.1
  const lamp = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.8, 8), glow("#ffe9a3", 3))
  lamp.position.y = top + 0.6
  const roof = mesh(new THREE.ConeGeometry(0.7, 0.8, 10), mat("#e5484d"))
  roof.position.y = top + 1.4

  // The rotating beam: two long transparent cones pointing opposite ways
  const beam = new THREE.Group()
  beam.position.y = top + 0.6
  const beamMaterial = new THREE.MeshBasicMaterial({ color: "#fff3c4", transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
  for (const dir of [1, -1]) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.4, 16, 12, 1, true), beamMaterial)
    cone.rotation.z = (dir * Math.PI) / 2
    cone.position.x = -dir * 8
    beam.add(cone)
  }
  tower.add(gallery, lamp, roof, beam)
  placeOnGround(site, tower, 0, 0)

  // Keeper's cottage
  const cottage = new THREE.Group()
  const body = mesh(new THREE.BoxGeometry(2, 1.4, 1.6), mat("#fff7ea"))
  body.position.y = 0.7
  const cottageRoof = mesh(new THREE.ConeGeometry(1.5, 1, 4), mat("#3b4f63"))
  cottageRoof.rotation.y = Math.PI / 4
  cottageRoof.position.y = 1.9
  cottage.add(body, cottageRoof)
  cottage.rotation.y = 0.4
  placeOnGround(site, cottage, -3.2, -1.6)

  // Pier: posts and planks heading straight out to sea
  const pier = new THREE.Group()
  const deck = mesh(new THREE.BoxGeometry(1.4, 0.15, 9), mat("#b07d52"))
  deck.position.set(0, 0.55, 4.5)
  pier.add(deck)
  for (let i = 0; i < 5; i++) {
    for (const side of [-0.6, 0.6]) {
      const post = mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.4, 5), mat("#7a5a43"))
      post.position.set(side, -0.5, 1 + i * 2)
      pier.add(post)
    }
  }
  pier.position.set(2.6, -site.group.position.y, 3)
  site.group.add(pier)

  // Rope bridge between two rock pillars further up the valley
  const pillarMat = mat("#9b8f86")
  for (const side of [-4.5, 4.5]) {
    const pillar = mesh(new THREE.CylinderGeometry(1, 1.3, 3.4, 6), pillarMat)
    pillar.position.y = 1.2
    const g = new THREE.Group()
    g.add(pillar)
    placeOnGround(site, g, side, -9)
  }
  const bridge = ropeBridge(7.4, 16)
  bridge.rotation.y = Math.PI / 2
  bridge.position.set(0, Math.max(site.groundY(-4.5, -9), site.groundY(4.5, -9)) + 2.9, -9)
  site.group.add(bridge)

  return {
    group: site.group,
    update(dt) {
      beam.rotation.y += dt * 0.8
    },
  }
}
