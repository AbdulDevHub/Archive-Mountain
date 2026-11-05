import { describe, expect, it } from "vitest"
import { PROJECTS } from "../src/data/projects.ts"
import { parseHash, routeToHash } from "../src/router.ts"
import { searchProjects } from "../src/ui/searchIndex.ts"
import { daylightAt } from "../src/world/lighting.ts"

describe("router", () => {
  it("parses valleys, the summit and deep links to a card", () => {
    expect(parseHash("")).toEqual({ view: "overview" })
    expect(parseHash("#ai")).toEqual({ view: "section", id: "ai", project: undefined })
    expect(parseHash("#effects/ink-fluid")).toEqual({ view: "section", id: "effects", project: "ink-fluid" })
    expect(parseHash("#all")).toEqual({ view: "all", project: undefined })
    expect(parseHash("#not-a-valley")).toEqual({ view: "overview" })
    expect(parseHash("#ai/%")).toEqual({ view: "overview" }) // malformed links must not crash
  })

  it("round-trips routes through the hash", () => {
    for (const hash of ["#ai", "#all", "#websites/uno"]) expect(routeToHash(parseHash(hash))).toBe(hash)
    expect(routeToHash({ view: "overview" })).toBe("")
  })
})

describe("search", () => {
  it("ranks name matches above tag and description matches", () => {
    const names = searchProjects("ink", PROJECTS).map((p) => p.name)
    expect(names[0]).toBe("Ink Fluid")
  })

  it("requires every word to match", () => {
    const results = searchProjects("webgl fluid", PROJECTS)
    expect(results.length).toBeGreaterThan(0)
    for (const p of results) expect(p.tags.join(" ") + p.name + p.description).toMatch(/fluid/i)
  })

  it("finds projects by tech tag and returns nothing for nonsense", () => {
    expect(searchProjects("react", PROJECTS).some((p) => p.name === "Bulk File Renamer")).toBe(true)
    expect(searchProjects("zzzqqq", PROJECTS)).toEqual([])
    expect(searchProjects("   ", PROJECTS)).toEqual([])
  })
})

describe("daylight", () => {
  it("keeps the island sunny at night", () => {
    expect(daylightAt(2)).toEqual(daylightAt(10.5))
  })

  it("is highest around midday and low at golden hour", () => {
    expect(daylightAt(12.5).elevation).toBeGreaterThan(daylightAt(18).elevation)
    expect(daylightAt(18).elevation).toBeLessThan(25)
  })
})
