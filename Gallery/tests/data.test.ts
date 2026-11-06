import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { parseProjects, PROJECTS, slugify, toSiteUrl } from "../src/data/projects.ts"
import { SECTIONS } from "../src/data/sections.ts"
import { renderCardHtml, renderDirectoryHtml } from "../src/ui/directory.ts"

const repoRoot = resolve(import.meta.dirname, "../..")

describe("projects.json", () => {
  it("puts every project in a known section, and every section has projects", () => {
    for (const s of SECTIONS) expect(PROJECTS.some((p) => p.section === s.id)).toBe(true)
  })

  it("gives every project a blurb and 1-4 tags", () => {
    for (const p of PROJECTS) {
      expect(p.description.length, p.name).toBeGreaterThan(15)
      expect(p.tags.length, p.name).toBeGreaterThanOrEqual(1)
      expect(p.tags.length, p.name).toBeLessThanOrEqual(4)
    }
  })

  it("points at screenshots that exist in the repo", () => {
    const missing = PROJECTS.filter((p) => !existsSync(resolve(repoRoot, "." + decodeURIComponent(p.image))))
    expect(missing.map((p) => p.name)).toEqual([])
  })

  it("rejects bad entries with a helpful message", () => {
    const base = { name: "X", category: "tools", description: "A thing that does stuff", tags: ["CSS"], href: "x.html", image: "x.png" }
    expect(() => parseProjects([{ ...base, category: "nope" }])).toThrow(/unknown category "nope"/)
    expect(() => parseProjects([{ ...base, tags: [] }])).toThrow(/at least one tag/)
    expect(() => parseProjects([base, base])).toThrow(/duplicates the slug/)
  })
})

describe("url helpers", () => {
  it("encodes repo paths once and leaves full URLs alone", () => {
    expect(toSiteUrl("Bulk File Renamer/x y.html")).toBe("/Bulk%20File%20Renamer/x%20y.html")
    expect(toSiteUrl("Chrome Extensions/X/Screenshot%201.png")).toBe("/Chrome%20Extensions/X/Screenshot%201.png")
    expect(toSiteUrl("https://github.com/AbdulDevHub/Linkest")).toBe("https://github.com/AbdulDevHub/Linkest")
  })

  it("slugifies names for deep links", () => {
    expect(slugify("Anime.js Sphere")).toBe("anime-js-sphere")
    expect(slugify("3D Cube Loader")).toBe("3d-cube-loader")
  })
})

describe("card html", () => {
  it("escapes text and opens projects in a new tab", () => {
    const section = SECTIONS[0]
    const html = renderCardHtml(
      { name: "<b>Hi</b>", slug: "hi", section: section.id, description: "x & y", tags: ["A"], href: "https://example.com", image: "/a.png" },
      section,
    )
    expect(html).toContain("&lt;b&gt;Hi&lt;/b&gt;")
    expect(html).toContain("x &amp; y")
    expect(html).toContain('target="_blank"')
  })

  it("renders every project in the pre-rendered directory", () => {
    const html = renderDirectoryHtml(PROJECTS)
    expect(html.match(/class="card"/g)).toHaveLength(PROJECTS.length)
  })
})
