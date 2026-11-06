import gsap from "gsap"
import type { Vector3 } from "three"

type Point = { x: number; y: number; z: number }
type Shot = { position: Point; target: Point }

/**
 * Camera shots for the iPhone page, in the model's own units. They come from the
 * original WebGi version (its exported viewer config and scroll animation), so the
 * React Three Fiber port frames the phone the same way.
 */
export const SHOTS: Record<"start" | "sound" | "display" | "preview", { desktop: Shot; mobile: Shot }> = {
  start: {
    desktop: { position: { x: -10.35, y: 3.3, z: 9.73 }, target: { x: 0.64, y: 1.32, z: 0.66 } },
    mobile: { position: { x: -16.7, y: 1.17, z: 11.7 }, target: { x: 0, y: 1.37, z: 0 } },
  },
  sound: {
    desktop: { position: { x: -3.38, y: -10.74, z: -5.93 }, target: { x: 1.52, y: 0.77, z: -1.08 } },
    mobile: { position: { x: -7.0, y: -12.2, z: -6.0 }, target: { x: 0.7, y: 1.9, z: 0.7 } },
  },
  display: {
    desktop: { position: { x: 1.56, y: 5.0, z: 0.01 }, target: { x: -0.55, y: 0.32, z: 0.0 } },
    mobile: { position: { x: 9.36, y: 10.95, z: 0.09 }, target: { x: -1.62, y: 0.02, z: -0.06 } },
  },
  preview: {
    desktop: { position: { x: 13.04, y: -2.01, z: 2.29 }, target: { x: 0.11, y: 0.0, z: 0.0 } },
    mobile: { position: { x: 13.04, y: -2.01, z: 2.29 }, target: { x: 0.11, y: 0.0, z: 0.0 } },
  },
}

export const shot = (name: keyof typeof SHOTS, isMobile: boolean): Shot => SHOTS[name][isMobile ? "mobile" : "desktop"]

/** Scrubs between two camera shots while `trigger` scrolls from the bottom of the screen to the top */
const scrubbed = (trigger: string) => ({
  trigger,
  start: "top bottom",
  end: "top top",
  scrub: 2,
  immediateRender: false,
})

/**
 * Moves the camera as the page scrolls: from the hero shot to the back of the phone
 * at the sound section, then to the screen at the display section, fading the copy in
 * and out on the way. Call it inside a gsap.context() so it can be reverted.
 */
export function scrollAnimation(position: Vector3, target: Vector3, isMobile: boolean): void {
  const sound = shot("sound", isMobile)
  const display = shot("display", isMobile)

  gsap.to(position, { ...sound.position, scrollTrigger: scrubbed(".sound-section") })
  gsap.to(target, { ...sound.target, scrollTrigger: scrubbed(".sound-section") })
  gsap.to(".jumbotron-section", { opacity: 0, scrollTrigger: scrubbed(".sound-section") })
  gsap.to(".sound-section-content", { opacity: 1, scrollTrigger: scrubbed(".sound-section") })

  gsap.to(position, { ...display.position, scrollTrigger: scrubbed(".display-section") })
  gsap.to(target, { ...display.target, scrollTrigger: scrubbed(".display-section") })
  gsap.to(".display-section", { opacity: 1, scrollTrigger: scrubbed(".display-section") })
}
