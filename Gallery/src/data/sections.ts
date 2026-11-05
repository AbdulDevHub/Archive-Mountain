/**
 * The six portfolio sections, one per valley of the island.
 * Everything that differs between valleys (colours, landmark, position)
 * lives here, so adding a section is a one-object change.
 */

export type SectionId = "effects" | "websites" | "apps" | "ai" | "ui" | "extensions"

export type LandmarkKind = "waterfall" | "village" | "castle" | "observatory" | "windmill" | "lighthouse"

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
const step = TAU / 6

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
    tagline: "Browser tools, utilities and games",
    accent: "#e07a5f",
    grass: "#96c96b",
    angle: FRONT + step,
    landmark: "village",
  },
  {
    id: "apps",
    label: "App Valley",
    tagline: "Full apps built with React, Next.js, Vue and Angular",
    accent: "#2f6fe0",
    grass: "#8cc47e",
    angle: FRONT + step * 2,
    landmark: "castle",
  },
  {
    id: "ai",
    label: "AI Valley",
    tagline: "LLM agents, on-device models and computer vision",
    accent: "#0e9f9f",
    grass: "#b9c968",
    angle: FRONT + step * 3,
    landmark: "observatory",
  },
  {
    id: "ui",
    label: "UI & Portfolios",
    tagline: "Landing pages, portfolios and interface components",
    accent: "#e9a800",
    grass: "#a8d46f",
    angle: FRONT + step * 4,
    landmark: "windmill",
  },
  {
    id: "extensions",
    label: "Chrome Extensions",
    tagline: "Tools that live in the browser toolbar",
    accent: "#ef476f",
    grass: "#7fb86c",
    angle: FRONT + step * 5,
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
