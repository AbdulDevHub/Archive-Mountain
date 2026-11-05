/** Awesome Effects: a waterfall into a pond, ringed by glowing crystals and flowers */
import * as THREE from "three"
import { mulberry32 } from "../../utils/math.ts"
import { createSite, glow, mat, mesh, placeOnGround, type Landmark } from "./kit.ts"

const CRYSTAL_COLORS = ["#a78bfa", "#f472b6", "#67e8f9", "#c4b5fd"]
const FLOWER_COLORS = ["#f472b6", "#fde047", "#fb7185", "#ffffff", "#a78bfa"]

/** A tiling texture of vertical streaks; scrolling it makes the water fall */
function streakTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 128
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#8fe1ff"
  ctx.fillRect(0, 0, 64, 128)
  const rand = mulberry32(7)
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = rand() > 0.5 ? "rgba(255,255,255,0.85)" : "rgba(190,240,255,0.9)"
    ctx.fillRect(rand() * 64, rand() * 128, 2 + rand() * 3, 18 + rand() * 40)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createWaterfall(angle: number, t: number): Landmark {
  const site = createSite(angle, t)
  const rand = mulberry32(99)

  // Cliff: a stack of rocks on the mountain side of the pond
  const cliff = new THREE.Group()
  const rockMat = mat("#9b8f86")
  const rocks: [number, number, number, number][] = [
    [0, 1.6, 0, 2.6],
    [-1.8, 1.2, 0.3, 1.9],
    [1.9, 1.3, 0.2, 2],
    [0, 4.1, -0.4, 2.2],
    [-1.2, 3.6, -0.2, 1.6],
    [1.3, 3.8, -0.3, 1.7],
    [0, 6, -0.8, 1.6],
  ]
  for (const [x, y, z, r] of rocks) {
    const rock = mesh(new THREE.DodecahedronGeometry(r, 0), rockMat)
    rock.position.set(x, y, z)
    rock.rotation.set(rand() * 3, rand() * 3, rand() * 3)
    cliff.add(rock)
  }
  placeOnGround(site, cliff, 0, -5, 0.6)

  // Falling water: a plane with a scrolling streak texture
  const texture = streakTexture()
  texture.repeat.set(1, 2)
  const fall = mesh(
    new THREE.PlaneGeometry(1.6, 6.6),
    new THREE.MeshStandardMaterial({ map: texture, transparent: true, opacity: 0.92, emissive: "#5fd0ff", emissiveIntensity: 0.25, roughness: 0.2 }),
    false,
  )
  placeOnGround(site, fall, 0, -2.1, -3.2)

  // Pond and the mist where the water lands
  const pond = mesh(new THREE.CircleGeometry(2.8, 9), mat("#5ccfe6", { roughness: 0.15, metalness: 0.1 }), false)
  pond.rotation.x = -Math.PI / 2
  placeOnGround(site, pond, 0, 0.3, -0.08)
  const mistMat = mat("#ffffff", { transparent: true, opacity: 0.6, roughness: 1 })
  const mist = Array.from({ length: 6 }, (_, i) => {
    const m = mesh(new THREE.IcosahedronGeometry(0.35, 0), mistMat, false)
    placeOnGround(site, m, Math.cos(i) * 0.8, -1.6 + Math.sin(i) * 0.3, -0.2)
    return { mesh: m, baseY: m.position.y, phase: i * 1.3 }
  })

  // Crystal clusters scattered around the pond: they bob, turn and glow
  const crystals: { mesh: THREE.Mesh; baseY: number; phase: number }[] = []
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 1.6 + 0.5 * Math.PI + rand() * 0.2
    const r = 4.2 + rand() * 2.2
    const cluster = new THREE.Group()
    const color = CRYSTAL_COLORS[i % CRYSTAL_COLORS.length]
    for (let k = 0; k < 3; k++) {
      const c = mesh(new THREE.OctahedronGeometry(0.42 + rand() * 0.25, 0), glow(color, 1.4))
      c.scale.y = 2.1 + rand()
      c.position.set((rand() - 0.5) * 0.9, 0.8, (rand() - 0.5) * 0.9)
      c.rotation.z = (rand() - 0.5) * 0.5
      cluster.add(c)
    }
    placeOnGround(site, cluster, Math.cos(a) * r, Math.sin(a) * r)
    crystals.push({ mesh: cluster.children[0] as THREE.Mesh, baseY: 0.8, phase: rand() * 6 })
  }

  // Flowers: tiny bright blobs on short stems
  const stemMat = mat("#4f8f4a")
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2
    const r = 3 + rand() * 4.5
    const flower = new THREE.Group()
    const stem = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 4), stemMat, false)
    stem.position.y = 0.25
    const bloom = mesh(new THREE.IcosahedronGeometry(0.17, 0), mat(FLOWER_COLORS[i % FLOWER_COLORS.length]), false)
    bloom.position.y = 0.55
    flower.add(stem, bloom)
    placeOnGround(site, flower, Math.cos(a) * r, Math.sin(a) * r + 1, 0.05)
  }

  return {
    group: site.group,
    update(_dt, time) {
      texture.offset.y = time * 0.9
      for (const m of mist) {
        m.mesh.position.y = m.baseY + Math.sin(time * 2 + m.phase) * 0.15
        m.mesh.scale.setScalar(1 + Math.sin(time * 3 + m.phase) * 0.2)
      }
      for (const c of crystals) {
        c.mesh.position.y = c.baseY + Math.sin(time * 1.4 + c.phase) * 0.18
        c.mesh.rotation.y = time * 0.6 + c.phase
      }
    },
  }
}
