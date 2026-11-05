/**
 * Turning a pointer ray into "which part of the island is this?".
 * Pure maths against `heightAt`, so it is cheap (no triangle raycasting
 * over ~100k faces) and unit-testable.
 */
import { SECTIONS, type SectionId } from "../data/sections.ts"
import { angleDiff } from "../utils/math.ts"
import { coastRadius, heightAt, SUMMIT_RADIUS } from "./terrain.ts"

export type IslandPart = { kind: "summit" } | { kind: "valley"; id: SectionId } | { kind: "sea" }

type Vec3 = { x: number; y: number; z: number }

/** Which section's wedge a ground position falls in */
export function partAt(x: number, z: number): IslandPart {
  const r = Math.hypot(x, z)
  if (r < SUMMIT_RADIUS) return { kind: "summit" }
  const theta = Math.atan2(z, x)
  if (r > coastRadius(theta) * 1.12) return { kind: "sea" }
  let nearest = SECTIONS[0]
  for (const s of SECTIONS) {
    if (Math.abs(angleDiff(theta, s.angle)) < Math.abs(angleDiff(theta, nearest.angle))) nearest = s
  }
  return { kind: "valley", id: nearest.id }
}

/**
 * March along a ray until it dips below the terrain, then refine with a few
 * bisection steps. Returns the hit point, or null if the ray misses the island.
 */
export function intersectTerrain(origin: Vec3, dir: Vec3, maxDistance = 400): Vec3 | null {
  const at = (d: number) => ({ x: origin.x + dir.x * d, y: origin.y + dir.y * d, z: origin.z + dir.z * d })
  const below = (p: Vec3) => p.y <= Math.max(heightAt(p.x, p.z), 0)
  const step = 0.75
  // Nothing on the island is taller than this, so skip the empty sky above it
  const ceiling = 45
  let prev = origin.y > ceiling && dir.y < 0 ? (origin.y - ceiling) / -dir.y : 0
  for (let d = prev + step; d <= maxDistance; d += step) {
    const p = at(d)
    if (below(p)) {
      let lo = prev
      let hi = d
      for (let i = 0; i < 8; i++) {
        const mid = (lo + hi) / 2
        if (below(at(mid))) hi = mid
        else lo = mid
      }
      return at(hi)
    }
    prev = d
    if (p.y < -5) return null
  }
  return null
}
