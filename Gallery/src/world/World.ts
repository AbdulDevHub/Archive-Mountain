/**
 * Owns the three.js renderer, scene and render loop, and turns pointer input
 * into island events (hover / select). Knows nothing about the DOM panel or
 * routing: main.ts wires those together.
 */
import { BloomEffect, EffectComposer, EffectPass, RenderPass, TiltShiftEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing"
import * as THREE from "three"
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js"
import { CameraRig, type PanelLayout } from "../camera/CameraRig.ts"
import { SECTIONS, type Section } from "../data/sections.ts"
import { createBirds } from "./ambient/birds.ts"
import { createClouds } from "./ambient/clouds.ts"
import { createTrees } from "./ambient/trees.ts"
import { createBalloon, createSailboat, createSummitFlag } from "./ambient/visitors.ts"
import { createIsland } from "./island.ts"
import { createLabels } from "./labels.ts"
import { createLandmark } from "./landmarks/index.ts"
import { createLights, daylightAt } from "./lighting.ts"
import { intersectTerrain, partAt, type IslandPart } from "./picking.ts"
import { createSky } from "./sky.ts"
import { createWater } from "./water.ts"
import type { Quality } from "./quality.ts"

export interface WorldOptions {
  container: HTMLElement
  quality: Quality
  reducedMotion: boolean
  counts: Map<string, number>
  total: number
  onSelect(part: IslandPart): void
  /** `point` is the pointer position in client pixels, or null when hovering nothing */
  onHover(part: IslandPart | null, point: { x: number; y: number } | null): void
}

export const partKey = (part: IslandPart | null) => (part === null || part.kind === "sea" ? null : part.kind === "summit" ? "summit" : part.id)

export class World {
  readonly rig: CameraRig
  private readonly renderer: THREE.WebGLRenderer
  private readonly labelRenderer = new CSS2DRenderer()
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.PerspectiveCamera
  private composer: EffectComposer | null = null
  private readonly timer = new THREE.Timer()
  private readonly updaters: ((dt: number, time: number) => void)[] = []
  private readonly island
  private readonly labels
  private readonly pointer = { x: 0, y: 0, pending: false, downX: 0, downY: 0, downAt: 0 }
  private hovered: string | null = null
  /** Index of the open valley, which keeps glowing while nothing else is hovered */
  private focused = -1
  private running = false
  private slowFrames = 0

  constructor(private readonly options: WorldOptions) {
    const { container, quality } = options

    this.renderer = new THREE.WebGLRenderer({ antialias: !quality.postprocessing, powerPreference: "high-performance" })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxPixelRatio))
    this.renderer.shadowMap.enabled = quality.shadowMapSize > 0
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.renderer.toneMapping = quality.postprocessing ? THREE.NoToneMapping : THREE.NeutralToneMapping
    container.appendChild(this.renderer.domElement)
    this.labelRenderer.domElement.className = "label-layer"
    container.appendChild(this.labelRenderer.domElement)

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.5, 1400)
    this.rig = new CameraRig(this.camera, this.renderer.domElement, options.reducedMotion)

    // Environment
    const light = daylightAt(new Date().getHours() + new Date().getMinutes() / 60)
    this.scene.fog = new THREE.Fog(light.skyHorizon, 200, 720)
    this.scene.add(createSky(light), createLights(light, quality.shadowMapSize).group)

    const water = createWater(quality.waterSegments)
    this.scene.add(water.mesh, ...water.extras)
    this.updaters.push((_dt, t) => water.update(t))

    // The island and everything on it
    this.island = createIsland(quality.terrainSegments)
    this.scene.add(this.island.mesh, createTrees(quality.trees))
    this.updaters.push((dt) => this.island.update(dt))

    for (const section of SECTIONS) {
      const landmark = createLandmark(section)
      this.scene.add(landmark.group)
      this.updaters.push(landmark.update)
    }

    const clouds = createClouds(quality.clouds)
    const birds = createBirds(quality.birds)
    const balloon = createBalloon()
    const boat = createSailboat()
    const flag = createSummitFlag("#38bdf8")
    this.scene.add(clouds.group, birds.group, balloon.object, boat.object, flag.object)
    this.updaters.push(clouds.update, birds.update, balloon.update, boat.update, (_dt, t) => flag.update(t))

    this.labels = createLabels(SECTIONS, options.counts, options.total, {
      select: (part) => options.onSelect(part),
      hover: (part) => this.setHover(part, null),
    })
    this.scene.add(...this.labels.objects)

    if (quality.postprocessing) this.composer = this.createComposer()

    this.bindPointer()
    this.resize()
    new ResizeObserver(() => this.resize()).observe(container)
    document.addEventListener("visibilitychange", () => (document.hidden ? this.stop() : this.start()))
  }

  private createComposer(): EffectComposer {
    const composer = new EffectComposer(this.renderer, { multisampling: Math.min(4, this.renderer.capabilities.maxSamples) })
    composer.addPass(new RenderPass(this.scene, this.camera))
    composer.addPass(
      new EffectPass(
        this.camera,
        new BloomEffect({ luminanceThreshold: 0.9, luminanceSmoothing: 0.2, intensity: 0.7, mipmapBlur: true }),
        // A gentle tilt-shift blur at the top and bottom gives the "miniature diorama" look
        new TiltShiftEffect({ offset: 0.05, focusArea: 0.82, feather: 0.3 }),
        new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
      ),
    )
    return composer
  }

  // ---------- Loop ----------

  start() {
    if (this.running) return
    this.running = true
    this.timer.update()
    this.renderer.setAnimationLoop(() => this.frame())
  }

  stop() {
    this.running = false
    this.renderer.setAnimationLoop(null)
  }

  private frame() {
    this.timer.update()
    const dt = Math.min(this.timer.getDelta(), 0.1)
    const time = this.timer.getElapsed()
    this.rig.update(dt)
    if (!this.options.reducedMotion) for (const update of this.updaters) update(dt, time)
    else this.island.update(dt)
    if (this.pointer.pending) this.pickHover()

    if (this.composer) this.composer.render(dt)
    else this.renderer.render(this.scene, this.camera)
    this.labelRenderer.render(this.scene, this.camera)
    this.watchFrameRate(dt)
  }

  /** If the post-processing makes this device struggle, quietly switch it off */
  private watchFrameRate(dt: number) {
    if (!this.composer) return
    this.slowFrames = dt > 1 / 35 ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 1)
    if (this.slowFrames > 90) {
      this.composer.dispose()
      this.composer = null
      this.renderer.toneMapping = THREE.NeutralToneMapping
    }
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.options.container
    if (!w || !h) return
    this.camera.aspect = w / h
    // A wider lens in portrait keeps the island from feeling cramped on phones
    this.camera.fov = w < h ? 52 : 40
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
    this.composer?.setSize(w, h)
    this.labelRenderer.setSize(w, h)
  }

  // ---------- Pointer ----------

  private bindPointer() {
    const el = this.renderer.domElement
    el.addEventListener("pointermove", (e) => {
      this.pointer.x = e.clientX
      this.pointer.y = e.clientY
      this.pointer.pending = e.pointerType === "mouse" && e.buttons === 0
    })
    el.addEventListener("pointerleave", () => this.setHover(null, null))
    el.addEventListener("pointerdown", (e) => {
      Object.assign(this.pointer, { downX: e.clientX, downY: e.clientY, downAt: performance.now() })
      this.setHover(null, null)
    })
    el.addEventListener("pointerup", (e) => {
      // Only a short, still press counts as a click; anything else was a drag
      const moved = Math.hypot(e.clientX - this.pointer.downX, e.clientY - this.pointer.downY)
      if (moved > 6 || performance.now() - this.pointer.downAt > 450) return
      const part = this.partAtScreen(e.clientX, e.clientY)
      if (part && part.kind !== "sea") this.options.onSelect(part)
    })
  }

  private readonly raycaster = new THREE.Raycaster()

  private partAtScreen(clientX: number, clientY: number): IslandPart | null {
    const rect = this.renderer.domElement.getBoundingClientRect()
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
    this.raycaster.setFromCamera(ndc, this.camera)
    const hit = intersectTerrain(this.raycaster.ray.origin, this.raycaster.ray.direction)
    return hit ? partAt(hit.x, hit.z) : null
  }

  private pickHover() {
    this.pointer.pending = false
    const part = this.partAtScreen(this.pointer.x, this.pointer.y)
    this.setHover(part, { x: this.pointer.x, y: this.pointer.y })
  }

  private setHover(part: IslandPart | null, point: { x: number; y: number } | null) {
    const key = partKey(part)
    if (key !== this.hovered) {
      this.hovered = key
      this.refreshHighlight()
      this.labels.setHovered(key)
      this.renderer.domElement.style.cursor = key ? "pointer" : ""
    }
    this.options.onHover(key ? part : null, point)
  }

  private refreshHighlight() {
    const hoveredIndex = SECTIONS.findIndex((s) => s.id === this.hovered)
    this.island.setHighlight(hoveredIndex >= 0 ? hoveredIndex : this.focused)
  }

  // ---------- Public API used by main.ts ----------

  focusSection(section: Section, layout: PanelLayout) {
    this.labels.setActive(section.id)
    this.focused = SECTIONS.indexOf(section)
    this.refreshHighlight()
    return this.rig.focusValley(section, layout)
  }

  focusOverview(layout: PanelLayout, active: "summit" | null) {
    this.labels.setActive(active)
    this.focused = -1
    this.refreshHighlight()
    return this.rig.overview(layout)
  }

  /** Highlight a valley from outside the scene, e.g. when hovering a dock button */
  previewSection(id: string | null) {
    this.hovered = id
    this.refreshHighlight()
    this.labels.setHovered(id)
  }
}
