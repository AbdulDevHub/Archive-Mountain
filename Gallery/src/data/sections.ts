/**
 * The five portfolio sections, one per valley of the island.
 * Everything that differs between valleys (colours, landmark, position)
 * lives here, so adding a section is a one-object change.
 */

export type SectionId = "effects" | "websites" | "ai" | "ui" | "extensions"

export type LandmarkKind = "waterfall" | "village" | "observatory" | "windmill" | "lighthouse"

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
const step = TAU / 5

export const SECTIONS: readonly Section[] = [
  {
    id: "effects",
    label: "Awesome Effects",
    tagline: "Shaders, cursors, loaders and other small delights",
    accent: "#8b5cf6",
    grass: "#7cc49a",
    angle: FRONT,
    landmark: "waterfall",
  },
  {
    id: "websites",
    label: "Awesome Websites",
    tagline: "Complete apps, tools and games",
    accent: "#e07a5f",
    grass: "#96c96b",
    angle: FRONT + step,
    landmark: "village",
  },
  {
    id: "ai",
    label: "AI Valley",
    tagline: "LLM agents, on-device models and computer vision",
    accent: "#0e9f9f",
    grass: "#b9c968",
    angle: FRONT + step * 2,
    landmark: "observatory",
  },
  {
    id: "ui",
    label: "UI Experiments",
    tagline: "Landing pages and interface concepts",
    accent: "#e9a800",
    grass: "#a8d46f",
    angle: FRONT + step * 3,
    landmark: "windmill",
  },
  {
    id: "extensions",
    label: "Chrome Extensions",
    tagline: "Tools that live in the browser toolbar",
    accent: "#ef476f",
    grass: "#7fb86c",
    angle: FRONT + step * 4,
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
