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
- **Archive → Web Mountain migration: paused 2026-11-05 at the owner's request (a bigger merge is planned). Committed locally, not pushed.**
  - Done: 15 projects merged in with history (merge commit `🔀 merge: Move 15 projects…`); Archive's 5 submodules and the DhikrForest submodule removed; link-only cards for Filmverse, CaseCobra, Modern AliExpress, Glisten AI, DhikrForest; App Valley (6th valley, castle landmark) and the "UI & Portfolios" relabel; `projects.json` (83 entries), READMEs and agent docs updated; Netflix copied to the Filmverse repo as `todo/netflix-card-ui/`.
  - Build: `build.sh` now builds in parallel, records each job's exit code, accepts task labels (`bash build.sh job-board Gallery`), and writes `_redirects` for `/projects/<slug>/`. `tools/relocate.mjs` fixes root-absolute paths (skips paths already under the base).
  - Verified in a local preview: Job Board (mock API, hash routes), Anime Vault (infinite scroll from shikimori.io), PWA Notes (service worker). Built OK but not yet clicked through: Angular Webshop, MacBook Homepage, GSAP Drinks, Techno Explosion, Animated CSS Login Form.
  - Still to do: rebuild and check black-hole (its first build was double-prefixed before the relocate fix), fancy-green, 3d-solar-portfolio, pay-card, sky-diving-parallax-cat, vuetify-image-gallery and Flappy Bird (`allowBuilds: esbuild` added for pnpm 11). Then take a Pay Card screenshot (it uses `demo.gif` for now), look at the castle on the island, regenerate `Screenshot.png` and `brand/og-image.png` (they still show five valleys), and run one full Netlify deploy preview. Full local build takes about 25 min on Windows; Netlify build minutes will rise, so consider caching unchanged apps.
  - Stayed in Archive: 3D Apple Homepage (its `webgi` package is a raw tarball URL, blocked by the local npm `allow-remote` policy), 3D Svelte Portfolio (its Prismic repo returns no content), plus server, desktop and practice projects.
  - Later (owner): polish the moved tutorial clones; decide whether to absorb NoteMark/CaseCobra as subtrees and delete their repos.

## Next steps
- Spot-check the subagent-drafted blurbs and tags for the projects that weren't verified against code: Gitmoji Helper, the AI Valley apps, the extensions, and several effects.
- Optional: load `postprocessing` only on the high quality tier to cut the bundle for phones.

## Session log
- **2026-11-05 (migration)**: Grill session on Archive vs Web Mountain, then most of the migration (see In progress). Decisions: any project with a live demo belongs here; no new standalone deploys; repos with their own live site are linked, not submoduled; Gallery-Viewer, Local-Video-Player, Linkest and Hydration-Hero stay submodules; history is kept when moving projects.
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
