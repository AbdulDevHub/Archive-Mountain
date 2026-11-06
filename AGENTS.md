# Archive Mountain

This file is read by AI coding agents working in this repo. It holds terse, project-specific rules and commands.
After any meaningful change to this project, update this file, `context/PROGRESS_TRACKER.md`, and the "Project Overview" section of `README.md` to reflect the current state. Do this proactively, without being asked.

Verify: cd Gallery && npm run build && npm test

## Overview
One monorepo holding every project, merged from seven repos with full history (Web Mountain, University, Automation, Mobile, Case-Cobra, Modern-AliExpress and the original Archive Mountain). Folders are grouped by type (`Websites/`, `Designs/`, `Effects/`, `Web Apps/`, `AI/`, `Desktop Apps/`, `Chrome Extensions/`, `Backend/`, `Experiments/`, `Mobile/`, `Automation/`, `University/`). The front page, `Gallery/`, is a 3D low-poly island with four valleys (Tools, Design, Apps, Games) showing only approved, deployable projects. Live at https://archive-mountain.netlify.app.

## Tech stack
- `Gallery/`: TypeScript, Vite 8, Three.js, camera-controls, postprocessing, simplex-noise, Vitest. Uses npm.
- `AI/AI Toolkit/`: one Vite + TS multi-page site (hub + 7 tools) with Netlify functions in the root `netlify/functions/`. Rules are in `AI/AI Toolkit/AGENTS.md`.
- `Effects/Playground/`: static page that loads each effect's own folder in an iframe; the list is `Effects/Playground/effects.json`.
- `Designs/Apple Homepage/`: React 19 + React Three Fiber; Mac and iPhone pages switch on `#mac` / `#iphone`.
- Other gallery projects are static HTML/CSS/JS or framework apps built by `build.sh`. Bulk File Renamer, Gitmoji Helper, Midnight Passages and Flappy Bird build in place.
- `Web Apps/Case-Cobra` (Next.js) and `Web Apps/Modern-AliExpress` (Nuxt) deploy on Vercel from this repo (Root Directory = their folder). Sub-projects outside the gallery keep their own tooling and READMEs.

## Commands
- Gallery: `cd Gallery && npm install`, `npm run dev` (also serves the rest of the repo), `npm test`, `npm run build` (output in `Gallery/dist/`, gitignored).
- Full deploy build: `bash build.sh` (Netlify runs it). Jobs run in parallel (`BUILD_JOBS`, default 4), each logging to `.build-logs/<name>.log`; then `Gallery/tools/assemble-site.mjs` copies only gallery projects into `_site/` (the publish dir). `bash build.sh <label>…` builds selected jobs only and skips assembly. Works in Git Bash on Windows.

## Conventions
- `Gallery/projects.json` is the single source for the gallery. Each entry needs `name`, `category` (`tools|design|apps|games`), `description` (one line, no trailing period), 1–4 `tags`, `href` and `image` (repo-relative, `/projects/<slug>/`, or a full URL). `Gallery/tests/data.test.ts` validates it. Valleys live only in `Gallery/src/data/sections.ts`.
- What gets deployed = the folder holding each static `href`, each `image`, every folder listed in `Effects/Playground/effects.json`, and the `APPS` outputs in `build.sh` (copied to `_site/projects/<slug>/`). Nothing else in the repo is published.
- Adding a framework app: make its config read `BASE_PATH` (Vite `base`, Next `basePath` + `output: "export"`, Vue CLI `publicPath`, SvelteKit `paths.base`; CRA reads `PUBLIC_URL`), add a row to `APPS` in `build.sh`, and link it as `/projects/<slug>/`. `Gallery/tools/relocate.mjs` rewrites leftover root-absolute public paths after the build.
- Adding an effect: give it its own folder under `Effects/` with an `index.html`, then add it to `Effects/Playground/effects.json`.
- The gallery is the site root (Vite `base: "/"`, `Gallery/public/` holds `brand/` and `robots.txt`). Gallery links are site-absolute (`toSiteUrl()` in `Gallery/src/data/projects.ts`).
- Gallery terrain maths are pure functions in `Gallery/src/world/terrain.ts`. Landmarks, trees, the camera and picking all use `heightAt()`; never sample the mesh.
- The gallery must work at 390px wide with no horizontal scroll, respect reduced motion, and keep the no-WebGL directory (`?no3d`) working.
- SEO: meta tags in `Gallery/src/index.html` use `%PROJECT_COUNT%` / `%SITE_URL%` tokens. JSON-LD and `sitemap.xml` come from `projects.json` (`Gallery/src/data/seo.ts`). Regenerate `Gallery/public/brand/og-image.png` (1200×630) if the island's look changes: run `npm run dev -- --port 5199`, then `uv run --with playwright Gallery/tools/og-image.py Gallery/public/brand/og-image.png` (update the project count in the script first).
- Commits: gitmoji + conventional commits with the project folder as scope (e.g. `✨ feat(Gallery): ...`).

## Boundaries
- Keep history: move files with `git mv`; never rewrite pushed history (other contributors' commits and the contribution graph depend on it).
- Build outputs (`_site/`, `Gallery/dist/`, `AI/AI Toolkit/apps/`, apps' `dist/`/`out/`/`build/`, `.build-logs/`) are generated. Don't commit them.
- Don't commit `.env` files; several sub-projects have local ones.
- `.github/workflows/sync-labels.yml` runs `Automation/GitHub Valley/update-all-labels.sh` daily and needs the `LABELS_TOKEN` repo secret.

## More
- `README.md`: overview and folder map.
- `Gallery/README.md`: gallery features and architecture.
- `context/`: `PROGRESS_TRACKER.md` (status, next steps, session log), `ARCHITECTURE.md` (deploy layout and gallery data flow), `UI_TOKENS.md` (gallery colours and type).
- Nested `AGENTS.md`: `AI/AI Toolkit/`, `Automation/`.
