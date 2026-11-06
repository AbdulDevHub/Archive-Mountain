# Progress Tracker

The running status of Archive Mountain for AI coding sessions and the owner.
Update it after meaningful work: refresh "Current state", move finished items out of "In progress", and add a dated session-log entry (newest first).
When old log entries stop being useful, fold them into "Earlier history" instead of deleting them.

## Current state
- One repo for everything: Web Mountain, University Mountain, Automation Mountain, Mobile Mountain, Case-Cobra and Modern-AliExpress were merged into Archive Mountain with full history (every commit keeps its author and date; 33 duplicate commits from an earlier Archive→Web move were dropped so nothing counts twice on the contribution graph).
- Folders are grouped by type (see `README.md`). The gallery (`Gallery/`) is the front page at https://archive-mountain.netlify.app and shows 27 approved projects in four valleys: Tools, Design, Apps, Games.
- New combined sites: the Effects Playground (`Effects/Playground/`, 26 effects), the AI Toolkit (`AI/AI Toolkit/`, hub + 7 tools) and the Apple Homepage (`Designs/Apple Homepage/`, Mac + iPhone pages, the iPhone page ported from WebGi to React Three Fiber).
- Deploy: `build.sh` builds everything, then `Gallery/tools/assemble-site.mjs` copies only gallery projects into `_site/` (Netlify's publish dir).

## In progress
- Netlify site `archive-mountain` now builds from this repo (publish `_site`).
- Vercel: `case-cobra` and `modern-ali-express` have Root Directory `Web Apps/<name>` and an ignored-build-step, but are still Git-connected to their old repos. The owner must swap the repo in the Vercel dashboard (Settings → Git → Disconnect, then Connect `AbdulDevHub/Archive-Mountain`); the CLI needs a confirmation the agent isn't allowed to skip.
- All 39 issues from the merged repos are transferred here (#33–#71, labels re-applied since transfers drop them). The owner deletes the 6 old repos by hand.

## Next steps
- 3D Svelte Portfolio: its Prismic repo only has two starter pages and no `settings` document, so it can't render. It is set up to prerender statically under `/projects/3d-svelte-portfolio/`; it needs its content recreated (or moved into local files) before it can join Design Valley.
- CareerFlow and Digital Hippo: deploy on Vercel from their folders once the owner provides env vars (CareerFlow: `DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET`, GitHub OAuth; Digital Hippo: Payload secret, MongoDB URL, Stripe, Resend), then add them to App Valley.
- Video.js effect: build out more variations (issue #72).
- `LABELS_TOKEN` secret must be added to this repo for the daily label sync workflow.
- Roll the Stripe test key that is in the public history of `Web Apps/Angular Webshop`.
- Optional: add `@types/three` to the Apple Homepage so `tsc -b` passes (the MacBook code had type errors before the merge).

## Session log
- **2026-11-05 (consolidation)**: Grill session, then the merge. Decisions: one public repo; flat layout by type; the gallery keeps only projects the owner approved one by one ("quality over quantity"); effects and AI apps each become one site; 3D Apple + MacBook pages merged; Console Wars added; rebranded to Archive Mountain on the renamed Netlify site; issues transferred with all states, no extra labels; the owner deletes old repos manually. Cut from the gallery (still in the repo): Rename Files, Face Bomp, PWA Notes, DhikrForest, Skynet Eats, Drone Series, Scenic Forests, Momentum, Video Background Website, Glisten AI, Vuetify Image Gallery, Animated CSS Login Form, Ghost Eyes, Moving Squares, Animated Input Border, Magic Card, Shine Effect, Balloon Spawn, Filmverse, Job Board, Angular Webshop and all Chrome extensions.
- **2026-11-05 (earlier, Web Mountain)**: Moved 15 Archive projects into Web Mountain, added App Valley, SEO, loader and hover-card fixes.
- **2026-11-04 (Web Mountain)**: Built the 3D island gallery (Vite + TS + Three.js, daytime low-poly, radial valleys, side panel / bottom sheet).

## Earlier history
- Web Mountain began as a static grid (`index.html` + `projects.json`) over the project folders. AI Valley was rebuilt from 18 Scrimba course projects into 6 Vite apps, now the AI Toolkit.
