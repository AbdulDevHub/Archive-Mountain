import rawProjects from "../../../projects.json"
import { isSectionId, SECTIONS, type SectionId } from "./sections.ts"

/** One entry of the repo-root projects.json, the single source of truth for the gallery */
export interface Project {
  name: string
  /** URL-safe id used in deep links, e.g. #effects/ink-fluid */
  slug: string
  section: SectionId
  description: string
  tags: string[]
  /** Site-absolute, URL-encoded link to the live project */
  href: string
  /** Site-absolute, URL-encoded screenshot */
  image: string
}

interface RawProject {
  name: string
  category: string
  description: string
  tags: string[]
  href: string
  image: string
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * Turns a repo-relative path like "Awesome Websites/UNO/uno-game.html" into
 * "/Awesome%20Websites/UNO/uno-game.html". Full URLs (e.g. GitHub links) pass
 * through, and segments that are already encoded are not encoded twice.
 */
export function toSiteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return "/" + path.split("/").map((segment) => encodeURIComponent(decodeURIComponent(segment))).join("/")
}

/** Validates projects.json and normalises it. Throws with a helpful message on bad data. */
export function parseProjects(raw: readonly RawProject[]): Project[] {
  const seen = new Set<string>()
  return raw.map((p, i) => {
    const where = `projects.json[${i}] (${p.name ?? "unnamed"})`
    if (!p.name || !p.href || !p.image) throw new Error(`${where} needs name, href and image`)
    if (!isSectionId(p.category)) throw new Error(`${where} has unknown category "${p.category}"`)
    if (!p.description) throw new Error(`${where} needs a description`)
    if (!Array.isArray(p.tags) || p.tags.length === 0) throw new Error(`${where} needs at least one tag`)
    const slug = slugify(p.name)
    if (seen.has(slug)) throw new Error(`${where} duplicates the slug "${slug}"`)
    seen.add(slug)
    return {
      name: p.name,
      slug,
      section: p.category,
      description: p.description,
      tags: p.tags,
      href: toSiteUrl(p.href),
      image: toSiteUrl(p.image),
    }
  })
}

export const PROJECTS: readonly Project[] = parseProjects(rawProjects)

export function projectsIn(section: SectionId, projects: readonly Project[] = PROJECTS): Project[] {
  return projects.filter((p) => p.section === section)
}

/** Projects grouped by section, in island order */
export function groupBySection(projects: readonly Project[] = PROJECTS): Map<SectionId, Project[]> {
  return new Map(SECTIONS.map((s) => [s.id, projectsIn(s.id, projects)]))
}
