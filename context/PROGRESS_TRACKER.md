# Progress Tracker

The running status of Web Mountain for AI coding sessions and the owner.
Update it after meaningful work: refresh "Current state", move finished items out of "In progress", and add a dated session-log entry (newest first).
When old log entries stop being useful, fold them into "Earlier history" instead of deleting them.

## Current state
- The 3D island gallery (`Gallery/`) is the live front page on `main`. It is built by `build.sh`, and `netlify.toml` rewrites `/` to it. The old flat grid `index.html` is gone.
- All 64 projects in `projects.json` have a one-line description, 1–4 tech tags and a screenshot.
- SEO: meta/OG/Twitter tags, JSON-LD, a generated sitemap at `/sitemap.xml`, `robots.txt`, a manifest, icons and an OG image (`/brand`).
- Gallery features: a loading screen (shown before first paint by an inline script in `index.html`), valley fly-in with a side panel or bottom sheet, deep links (`#ai`, `#effects/ink-fluid`), search (`/`), clickable hover previews, ambient life, an optional Web Audio soundscape, a no-WebGL directory, and quality tiers. Project cards open in a new tab.
- 24 Vitest tests pass. The build is about 930 kB JS (237 kB gzip).

## In progress
- Nothing active. The owner is reviewing the live site on `main`.

## Next steps
- Spot-check the subagent-drafted blurbs and tags for the projects that weren't verified against code: Gitmoji Helper, the AI Valley apps, the extensions, and several effects.
- Optional: load `postprocessing` only on the high quality tier to cut the bundle for phones.

## Session log
- **2026-11-05 (later)**: Made the island read as an island and added SEO.
  - Sea: a lagoon-to-deep-water gradient per pixel, animated surf around the shoreline, distant islets, horizon haze, and a lower, further-back default camera (polar 64°, distance 178).
  - SEO: a full meta/OG/Twitter set, JSON-LD (`WebSite` + `CollectionPage`/`ItemList`), a generated sitemap, `robots.txt`, a web manifest, icons and an OG image in `/brand`, and a single h1. The GitHub repo description, homepage and topics are updated (the unused `firebase` topic was removed).
  - The GitHub social preview image must be uploaded by hand (Settings → Social preview → `brand/og-image.png`); there is no API for it.
- **2026-11-05**: Feedback fixes after the first live look.
  - The page showed the plain directory before switching to the island. Now an inline head script picks 3D before first paint and shows a loader until the first frames render.
  - The hover card followed the cursor and said "click", so it was chased. It now stays where it appeared and is itself clickable ("Explore …").
  - Project cards open in a new tab, so the island doesn't reload on Back.
  - Added the missing Discord Thread Extractor screenshot.
- **2026-11-04**: Planned the gallery redesign (grill session) and built `Gallery/`. Decisions: the mountain is the navigation layer, not a fully 3D gallery. It's low-poly and daytime, with one peak and five radial valleys, each with its own biome and landmark. Cards open in a side panel (a bottom sheet on phones). The stack is Vite + TS + Three.js. Cards show a blurb and tags, and there's a GitHub "Source" link. The user wanted daytime, not night, and gave free rein on colours and extras. Pushed straight to `main` at the user's request.

## Earlier history
- The repo began as a static grid (`index.html` + `projects.json`) over the project folders. AI Valley was rebuilt into 6 Vite apps (see `AI Valley/AGENTS.md`).
