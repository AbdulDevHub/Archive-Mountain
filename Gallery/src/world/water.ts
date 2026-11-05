/**
 * The sea: a faceted plane with gentle waves, coloured per pixel from a
 * turquoise lagoon around the island to deep blue water further out, plus an
 * animated band of surf where the waves meet the beach. Together they make it
 * obvious the island sits in the sea rather than floating in the sky.
 */
import * as THREE from "three"
import { coastRadius, heightAt, ISLAND_RADIUS } from "./terrain.ts"

const SHALLOW = "#6fe0d6"
const DEEP = "#1e6fa6"

export function createWater(segments: number) {
  const geometry = new THREE.PlaneGeometry(2000, 2000, segments, segments)
  geometry.rotateX(-Math.PI / 2)
  const pos = geometry.attributes.position as THREE.BufferAttribute
  const base = Float32Array.from(pos.array)

  const material = new THREE.MeshStandardMaterial({ color: "#ffffff", flatShading: true, transparent: true, opacity: 0.9, roughness: 0.3, metalness: 0.05 })
  // Colour by distance from the island in the fragment shader, so the lagoon edge is smooth
  // even though the sea's triangles are large
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uShallow = { value: new THREE.Color(SHALLOW) }
    shader.uniforms.uDeep = { value: new THREE.Color(DEEP) }
    shader.uniforms.uRadius = { value: ISLAND_RADIUS }
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vSeaXZ;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSeaXZ = (modelMatrix * vec4(position, 1.0)).xz;")
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uShallow;\nuniform vec3 uDeep;\nuniform float uRadius;\nvarying vec2 vSeaXZ;")
      .replace(
        "#include <color_fragment>",
        "#include <color_fragment>\ndiffuseColor.rgb = mix(uShallow, uDeep, smoothstep(uRadius * 0.95, uRadius * 1.75, length(vSeaXZ)));",
      )
  }

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = "sea"
  mesh.receiveShadow = true
  mesh.position.y = -0.15

  // A deep seabed under the transparent water, so nothing but blue shows through past the island
  const seabed = new THREE.Mesh(new THREE.CircleGeometry(1000, 32), new THREE.MeshStandardMaterial({ color: "#1d5f8f", roughness: 1 }))
  seabed.rotation.x = -Math.PI / 2
  seabed.position.y = -9
  mesh.add(seabed)

  const surf = createSurf()
  const islets = createIslets()

  return {
    mesh,
    extras: [surf.mesh, islets],
    update(time: number) {
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3]
        const z = base[i * 3 + 2]
        pos.setY(i, Math.sin(x * 0.11 + time * 0.9) * 0.12 + Math.cos(z * 0.09 + time * 0.7) * 0.12)
      }
      pos.needsUpdate = true
      surf.update(time)
    },
  }
}

/** Where the beach meets the sea in a given direction (heightAt crosses 0), found by bisection */
export function shorelineRadius(angle: number): number {
  let lo = coastRadius(angle) * 0.7
  let hi = ISLAND_RADIUS * 1.5
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    if (heightAt(Math.cos(angle) * mid, Math.sin(angle) * mid) > 0) lo = mid
    else hi = mid
  }
  return lo
}

/** A white band of foam hugging the shoreline, with waves that pulse in towards the beach */
function createSurf() {
  const steps = 240
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2
    const r = shorelineRadius(a)
    const [cos, sin] = [Math.cos(a), Math.sin(a)]
    // Inner edge just up the beach, outer edge a few units out to sea
    positions.push(cos * (r - 0.5), 0, sin * (r - 0.5), cos * (r + 3.2), 0, sin * (r + 3.2))
    uvs.push(i / steps, 0, i / steps, 1)
    if (i < steps) {
      const k = i * 2
      indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        float along = vUv.x * 6.2832;
        // Solid foam right at the beach...
        float edge = 1.0 - smoothstep(0.08, 0.32, vUv.y);
        // ...plus a wave line that rolls in from the sea and fades as it arrives
        float phase = fract(uTime * 0.18 + sin(along * 7.0) * 0.04);
        float wavePos = 1.0 - phase;
        float wave = (1.0 - smoothstep(0.0, 0.07, abs(vUv.y - wavePos))) * (1.0 - phase) * 0.8;
        float alpha = max(edge * 0.85, wave) * (0.85 + 0.15 * sin(along * 23.0 + uTime));
        gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
        #include <colorspace_fragment>
      }
    `,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.y = 0.12
  mesh.renderOrder = 1
  mesh.name = "surf"
  return { mesh, update: (time: number) => (material.uniforms.uTime.value = time) }
}

/** A few small islands on the horizon, so the sea reads as a sea */
function createIslets(): THREE.Group {
  const group = new THREE.Group()
  const sand = new THREE.MeshStandardMaterial({ color: "#efd9a0", flatShading: true, roughness: 1 })
  const grass = new THREE.MeshStandardMaterial({ color: "#7fb86c", flatShading: true, roughness: 1 })
  const spots: [number, number, number][] = [
    // angle, distance, size
    [0.35, 190, 9],
    [2.4, 230, 13],
    [3.7, 205, 7],
    [5.2, 250, 11],
  ]
  for (const [angle, distance, size] of spots) {
    const islet = new THREE.Group()
    const beach = new THREE.Mesh(new THREE.CylinderGeometry(size * 1.15, size * 1.3, 1.2, 9), sand)
    const hill = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 0), grass)
    hill.scale.set(1, 0.45, 1)
    hill.position.y = 0.4
    islet.add(beach, hill)
    islet.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance)
    islet.rotation.y = angle * 3
    group.add(islet)
  }
  return group
}
