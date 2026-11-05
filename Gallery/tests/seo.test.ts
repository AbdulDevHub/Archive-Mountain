import { describe, expect, it } from "vitest"
import { PROJECTS } from "../src/data/projects.ts"
import { SITE_URL, sitemapXml, structuredData, structuredDataHtml } from "../src/data/seo.ts"

describe("seo", () => {
  it("lists every project in the JSON-LD item list with absolute URLs", () => {
    const [, collection] = structuredData(PROJECTS) as [unknown, { mainEntity: { numberOfItems: number; itemListElement: { item: { url: string; image: string } }[] } }]
    expect(collection.mainEntity.numberOfItems).toBe(PROJECTS.length)
    for (const { item } of collection.mainEntity.itemListElement) {
      expect(item.url).toMatch(/^https:\/\//)
      expect(item.image).toMatch(/^https:\/\//)
    }
  })

  it("can't break out of its script tag", () => {
    expect(structuredDataHtml(PROJECTS).match(/<\/script>/g)).toHaveLength(2)
  })

  it("puts the home page and every self-hosted project in the sitemap", () => {
    const xml = sitemapXml(PROJECTS, "2026-11-05")
    const selfHosted = PROJECTS.filter((p) => !/^https?:/.test(p.href)).length
    expect(xml.match(/<url>/g)).toHaveLength(selfHosted + 1)
    expect(xml).toContain(`<loc>${SITE_URL}/</loc>`)
    expect(xml).not.toContain("github.com")
  })
})
