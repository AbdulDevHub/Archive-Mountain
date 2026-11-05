# Progress Tracker

The running status of Web Mountain for AI coding sessions and the owner.
Update it after meaningful work: refresh "Current state", move finished items out of "In progress", and add a dated session-log entry (newest first).
When old log entries stop being useful, fold them into "Earlier history" instead of deleting them.

## Current state
- The 3D island gallery (`Gallery/`) replaces the old flat grid `index.html`, which was deleted. It is built by `build.sh`, and `netlify.toml` rewrites `/` to it.
- All 64 projects in `projects.json` have a one-line description and 1–4 tech tags.
- Gallery features: valley fly-in with a side panel or bottom sheet, deep links (`#ai`, `#effects/ink-fluid`), search (`/`), hover previews, ambient life, an optional Web Audio soundscape, a no-WebGL directory, and quality tiers.
- 21 Vitest tests pass. The build is about 930 kB JS (237 kB gzip).

## In progress
- Branch `3d-mountain-gallery`: needs review, a Netlify deploy preview check (the `/` rewrite and sub-app links), and a merge.

## Next steps
- Add the missing screenshot `Awesome Websites/Oneshot/Screenshot.png` (Discord Thread Extractor). A placeholder shows until then, and `data.test.ts` lists it as the known gap.
- Spot-check the subagent-drafted blurbs and tags for the projects that weren't verified against code: Gitmoji Helper, the AI Valley apps, the extensions, and several effects.
- Optional: load `postprocessing` only on the high quality tier to cut the bundle for phones.

## Session log
- **2026-11-04**: Planned the gallery redesign (grill session) and built `Gallery/`. Decisions: the mountain is the navigation layer, not a fully 3D gallery. It's low-poly and daytime, with one peak and five radial valleys, each with its own biome and landmark. Cards open in a side panel (a bottom sheet on phones). The stack is Vite + TS + Three.js. Cards show a blurb and tags, and there's a GitHub "Source" link. The user wanted daytime, not night, and gave free rein on colours and extras.

## Earlier history
- The repo began as a static grid (`index.html` + `projects.json`) over the project folders. AI Valley was rebuilt into 6 Vite apps (see `AI Valley/AGENTS.md`).
