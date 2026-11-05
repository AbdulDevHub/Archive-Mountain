import { describe, expect, it } from "vitest"
import { SECTIONS } from "../src/data/sections.ts"
import { intersectTerrain, partAt } from "../src/world/picking.ts"
import { heightAt, ISLAND_RADIUS, PEAK_HEIGHT, SUMMIT_RADIUS, valleyAt, valleyPoint } from "../src/world/terrain.ts"

describe("terrain", () => {
  it("peaks near the centre and sinks below the sea past the coast", () => {
    expect(heightAt(0, 0)).toBeGreaterThan(PEAK_HEIGHT * 0.9)
    expect(heightAt(ISLAND_RADIUS * 1.5, 0)).toBeLessThan(-2)
  })

  it("carves every valley below the ridges beside it", () => {
    for (const s of SECTIONS) {
      const floor = valleyPoint(s.angle, 0.55).y
      const ridge = valleyPoint(s.angle + Math.PI / 5, 0.55).y // halfway to the next valley
      expect(floor).toBeLessThan(ridge - 3)
      expect(floor).toBeGreaterThan(0) // valley floors stay above water
    }
  })

  it("knows which valley a point on a valley axis belongs to", () => {
    SECTIONS.forEach((s, index) => {
      const p = valleyPoint(s.angle, 0.6)
      expect(valleyAt(p.x, p.z)).toMatchObject({ index })
      expect(valleyAt(p.x, p.z).strength).toBeGreaterThan(0.8)
    })
  })
})

describe("picking", () => {
  it("maps ground positions to the summit, a valley or the sea", () => {
    expect(partAt(0, SUMMIT_RADIUS / 2)).toEqual({ kind: "summit" })
    expect(partAt(500, 0)).toEqual({ kind: "sea" })
    for (const s of SECTIONS) {
      const p = valleyPoint(s.angle, 0.5)
      expect(partAt(p.x, p.z)).toEqual({ kind: "valley", id: s.id })
    }
  })

  it("finds where a downward ray hits the island", () => {
    const hit = intersectTerrain({ x: 10, y: 120, z: 5 }, { x: 0, y: -1, z: 0 })
    expect(hit).not.toBeNull()
    expect(hit!.y).toBeCloseTo(heightAt(10, 5), 0)
  })

  it("misses when the ray points at the sky", () => {
    expect(intersectTerrain({ x: 0, y: 80, z: 150 }, { x: 0, y: 1, z: 0 })).toBeNull()
  })
})
