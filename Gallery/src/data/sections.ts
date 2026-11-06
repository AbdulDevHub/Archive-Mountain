/**
 * The four portfolio sections, one per valley of the island.
 * Everything that differs between valleys (colours, landmark, position)
 * lives here, so adding a section is a one-object change.
 */

export type SectionId = "tools" | "design" | "apps" | "games"

export type LandmarkKind = "village" | "windmill" | "castle" | "lighthouse"

export interface Section {
  id: SectionId
  label: string
  tagline: string
  /** UI accent: labels, pills, card highlights, valley glow */
  accent: string
  /** Ground tint for the valley's meadow */
  grass: string
  /** Direction of the valley from the summit, in radians (0 = +x, counter-clockwise seen from above) */
  angle: number
  landmark: LandmarkKind
}

const TAU = Math.PI * 2
/** The camera starts looking from +z, so the first section faces the visitor */
const FRONT = Math.PI / 2
const step = TAU / 4

export const SECTIONS: readonly Section[] = [
  {
    id: "tools",
    label: "Tools Valley",
    tagline: "Browser tools that do one job well",
    accent: "#e07a5f",
    grass: "#96c96b",
    angle: FRONT,
    landmark: "village",
  },
  {
    id: "design",
    label: "Design Valley",
    tagline: "Landing pages, portfolios and a playground of effects",
    accent: "#8b5cf6",
    grass: "#a8d46f",
    angle: FRONT + step,
    landmark: "windmill",
  },
  {
    id: "apps",
    label: "App Valley",
    tagline: "Full-stack shops, AI tools and API-driven apps",
    accent: "#2f6fe0",
    grass: "#8cc47e",
    angle: FRONT + step * 2,
    landmark: "castle",
  },
  {
    id: "games",
    label: "Game Valley",
    tagline: "Card games and an arcade classic",
    accent: "#ef476f",
    grass: "#7fb86c",
    angle: FRONT + step * 3,
    landmark: "lighthouse",
  },
]

const byId = new Map(SECTIONS.map((s) => [s.id, s]))

export function getSection(id: SectionId): Section {
  const section = byId.get(id)
  if (!section) throw new Error(`Unknown section "${id}"`)
  return section
}

export function isSectionId(value: string): value is SectionId {
  return byId.has(value as SectionId)
}
