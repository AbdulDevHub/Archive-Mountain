import type { LandmarkKind, Section } from "../../data/sections.ts"
import { LANDMARK_T } from "../terrain.ts"
import type { Landmark } from "./kit.ts"
import { createCastle } from "./castle.ts"
import { createLighthouse } from "./lighthouse.ts"
import { createObservatory } from "./observatory.ts"
import { createVillage } from "./village.ts"
import { createWaterfall } from "./waterfall.ts"
import { createWindmill } from "./windmill.ts"

export type { Landmark } from "./kit.ts"

const BUILDERS: Record<LandmarkKind, { build: (angle: number, t: number) => Landmark; t: number }> = {
  waterfall: { build: createWaterfall, t: LANDMARK_T - 0.04 },
  village: { build: createVillage, t: LANDMARK_T },
  castle: { build: createCastle, t: LANDMARK_T },
  observatory: { build: createObservatory, t: LANDMARK_T },
  windmill: { build: createWindmill, t: LANDMARK_T },
  lighthouse: { build: createLighthouse, t: 0.86 },
}

/** Where each landmark stands along its valley (0 = summit, 1 = coast) */
export const landmarkT = (kind: LandmarkKind) => BUILDERS[kind].t

export function createLandmark(section: Section): Landmark {
  const { build, t } = BUILDERS[section.landmark]
  return build(section.angle, t)
}
