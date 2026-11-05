/**
 * Tiny ranked search over project names, blurbs and tags. 64 projects don't
 * need a search library: every word of the query must match somewhere, and
 * matches in the name count for more than matches in the description.
 */
import type { Project } from "../data/projects.ts"

const normalise = (text: string) => text.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}.+#\s]/gu, " ")

function scoreWord(word: string, p: Project): number {
  const name = normalise(p.name)
  const words = name.split(/\s+/)
  if (name === word) return 120
  if (name.startsWith(word)) return 90
  if (words.some((w) => w.startsWith(word))) return 70
  if (name.includes(word)) return 50
  if (p.tags.some((t) => normalise(t) === word)) return 45
  if (p.tags.some((t) => normalise(t).includes(word))) return 30
  if (normalise(p.description).includes(word)) return 18
  if (p.section.startsWith(word)) return 10
  return 0
}

export function searchProjects(query: string, projects: readonly Project[], limit = 8): Project[] {
  const words = normalise(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  return projects
    .map((p) => {
      const scores = words.map((w) => scoreWord(w, p))
      return { p, score: scores.includes(0) ? 0 : scores.reduce((a, b) => a + b, 0) }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name))
    .slice(0, limit)
    .map((r) => r.p)
}
