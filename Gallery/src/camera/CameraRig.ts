/**
 * Every camera move on the island: the intro descent, free orbiting, flying
 * into a valley, and nudging the view aside so the side panel or bottom sheet
 * never covers what you're looking at. Wraps the `camera-controls` library.
 */
import CameraControls from "camera-controls"
import * as THREE from "three"
import type { Section } from "../data/sections.ts"
import { landmarkT } from "../world/landmarks/index.ts"
import { valleyPoint } from "../world/terrain.ts"

CameraControls.install({ THREE })

/** How much of the screen the panel covers, as fractions (0–1) of the width from the right and the height from the bottom */
export interface PanelLayout {
  right: number
  bottom: number
}

export const NO_PANEL: PanelLayout = { right: 0, bottom: 0 }

const OVERVIEW = { distance: 150, polar: THREE.MathUtils.degToRad(58), target: new THREE.Vector3(0, 7, 0) }
/** How far behind (towards the sea) and above a valley's landmark the camera sits */
const VALLEY_VIEW = { back: 46, up: 26 }
const IDLE_DELAY = 8 // seconds without input before the island starts turning
const IDLE_SPEED = 0.05 // radians per second

export class CameraRig {
  readonly controls: CameraControls
  private idleFor = 0
  private mode: "intro" | "overview" | "focus" = "intro"

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    dom: HTMLElement,
    private readonly reducedMotion: boolean,
  ) {
    const c = new CameraControls(camera, dom)
    c.minDistance = 16
    c.maxDistance = 420
    c.minPolarAngle = 0.12
    c.maxPolarAngle = Math.PI * 0.46 // never dip under the horizon
    c.smoothTime = 0.7
    c.draggingSmoothTime = 0.12
    c.dollyToCursor = true
    c.setBoundary(new THREE.Box3(new THREE.Vector3(-90, -2, -90), new THREE.Vector3(90, 40, 90)))
    c.mouseButtons.right = CameraControls.ACTION.TRUCK
    c.touches.two = CameraControls.ACTION.TOUCH_DOLLY_TRUCK
    c.addEventListener("controlstart", () => (this.idleFor = 0))
    this.controls = c
  }

  private get animate() {
    return !this.reducedMotion
  }

  /** Start high above the clouds and sink down to the overview */
  async playIntro(): Promise<void> {
    const c = this.controls
    if (this.reducedMotion) {
      await this.overview(NO_PANEL)
      return
    }
    c.setLookAt(0, 120, 40, 0, 0, 0, false)
    c.smoothTime = 1.4
    // Azimuth 0 faces the first section (Awesome Effects), which sits towards +z
    await c.setLookAt(...this.overviewPosition(0), ...OVERVIEW.target.toArray(), true)
    c.smoothTime = 0.7
    // The visitor may already have flown into a valley while the intro played
    if (this.mode === "intro") this.mode = "overview"
  }

  /** Camera position for the overview at a given azimuth (three.js spherical convention: 0 = looking from +z) */
  private overviewPosition(azimuth: number, distance = this.overviewDistance()): [number, number, number] {
    const { polar, target } = OVERVIEW
    const ring = distance * Math.sin(polar)
    return [target.x + ring * Math.sin(azimuth), target.y + distance * Math.cos(polar), target.z + ring * Math.cos(azimuth)]
  }

  /** Step back further on tall, narrow (portrait) screens so the island still fits across */
  private overviewDistance(): number {
    return OVERVIEW.distance * this.portraitZoom()
  }

  /** 1 on landscape screens, up to ~1.4 on tall phones */
  private portraitZoom(): number {
    const narrowness = Math.min(1.8, Math.max(1, 1 / this.camera.aspect))
    return Math.pow(narrowness, 0.6)
  }

  /** Pull back to see the whole island, keeping the current viewing direction */
  async overview(layout: PanelLayout): Promise<void> {
    this.mode = "overview"
    this.idleFor = 0
    const c = this.controls
    // With a panel open the island has less room, so step back until it fits in what's left
    const room = Math.max(0.42, 1 - layout.right - layout.bottom * 0.5)
    const distance = this.overviewDistance() / Math.pow(room, 0.8)
    const [x, y, z] = this.overviewPosition(c.azimuthAngle, distance)
    await Promise.all([c.setLookAt(x, y, z, ...OVERVIEW.target.toArray(), this.animate), this.applyLayout(layout, distance)])
  }

  /** Fly into a valley: look up it at its landmark from the sea side, with the summit behind */
  async focusValley(section: Section, layout: PanelLayout): Promise<void> {
    this.mode = "focus"
    const target = valleyPoint(section.angle, landmarkT(section.landmark))
    // Same framing for every valley: back out towards the sea and up, further on portrait screens
    const zoom = this.portraitZoom()
    const out = { x: Math.cos(section.angle), z: Math.sin(section.angle) }
    const from = { x: target.x + out.x * VALLEY_VIEW.back * zoom, y: target.y + VALLEY_VIEW.up * zoom, z: target.z + out.z * VALLEY_VIEW.back * zoom }
    const distance = Math.hypot(from.x - target.x, from.y - target.y, from.z - target.z)
    await Promise.all([
      this.controls.setLookAt(from.x, from.y, from.z, target.x, target.y + 3, target.z, this.animate),
      this.applyLayout(layout, distance),
    ])
  }

  /**
   * Shift the rendered view sideways (desktop panel) or upwards (phone sheet)
   * by moving the camera along its own axes, so the focus point stays centred
   * in the part of the screen that is still visible.
   */
  private applyLayout(layout: PanelLayout, distance: number): Promise<void> {
    const visibleHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    const visibleWidth = visibleHeight * this.camera.aspect
    // Moving the camera right (or down) by half the covered size centres the focus in what's left.
    // camera-controls treats focal-offset y like screen space (positive = down).
    return this.controls.setFocalOffset((visibleWidth * layout.right) / 2, (visibleHeight * layout.bottom) / 2, 0, this.animate)
  }

  update(dt: number): boolean {
    if (this.mode === "overview" && !this.reducedMotion) {
      this.idleFor += dt
      if (this.idleFor > IDLE_DELAY) this.controls.rotate(IDLE_SPEED * dt, 0, false)
    }
    return this.controls.update(dt)
  }

  dispose() {
    this.controls.dispose()
  }
}
