# Web Mountain

This file is read by AI coding agents working in this repo. It holds terse, project-specific rules and commands.
After any meaningful change to this project, update this file, `context/PROGRESS_TRACKER.md`, and the "Project Overview" section of `README.md` to reflect the current state. Do this proactively, without being asked.

Verify: cd Gallery && npm run build && npm test

## Overview
A portfolio monorepo of 83 frontend projects, deployed as one static Netlify site (modern-web-mountain.netlify.app). Its front page, `Gallery/`, is a 3D low-poly island: each of its six valleys is a section. Projects with a live browser demo live here; server-only, desktop and practice projects live in the separate Archive Mountain repo.

## Tech stack
- `Gallery/`: TypeScript, Vite 8, Three.js, camera-controls, postprocessing, simplex-noise, Vitest. Uses npm.
- `AI Valley/`: its own Vite + TS sub-project with Netlify functions. Rules are in `AI Valley/AGENTS.md`.
- Other projects are mostly static HTML/CSS/JS. Bulk File Renamer, Gitmoji Helper, Midnight Passages, Flappy Bird and Animated CSS Login Form build in place.
- `App Valley/` and several `UI Experiments/` folders are framework apps (React/Vite, Next.js static export, Vue, Angular, CRA, Vue CLI) moved from Archive Mountain with their history. `build.sh` builds each one for `/projects/<slug>/` (the `APPS` table) and writes the matching Netlify `_redirects`.
- Four Chrome extensions are git submodules. Filmverse, CaseCobra, Modern AliExpress, Glisten AI and DhikrForest live in their own repos: their folders only hold a screenshot and README, and the gallery links to their live sites.

## Commands
- Gallery: `cd Gallery && npm install`, `npm run dev` (also serves the rest of the repo), `npm test`, `npm run build` (output in `Gallery/dist/`, gitignored).
- Full deploy build: `bash build.sh` (Netlify runs this; publish dir is the repo root). Jobs run in parallel (`BUILD_JOBS`, default 4); each logs to `.build-logs/<name>.log`. It works in Git Bash on Windows too.

## Conventions
- `projects.json` (repo root) is the single source for the gallery. Each entry needs `name`, `category` (`effects|websites|apps|ai|ui|extensions`), `description` (one line, no trailing period), 1–4 `tags`, `href` and `image` (repo-relative, or a full URL for GitHub-hosted extensions). `Gallery/tests/data.test.ts` validates it.
- When adding a project, also add it to the matching list in `README.md`.
- Adding a framework app: make its config read `BASE_PATH` (Vite `base`, Next `basePath` + `output: "export"`, Vue CLI `publicPath`; CRA reads `PUBLIC_URL`), add a row to `APPS` in `build.sh`, ignore its output folder in `.gitignore`, and link it as `/projects/<slug>/` in `projects.json`. `tools/relocate.mjs` rewrites leftover root-absolute public paths after the build.
- Netlify rewrites `/` to `/Gallery/dist/index.html`, so gallery links must be site-absolute (`toSiteUrl()` in `Gallery/src/data/projects.ts`).
- Gallery terrain maths are pure functions in `Gallery/src/world/terrain.ts`. Landmarks, trees, the camera and picking all use `heightAt()`; never sample the mesh.
- The gallery must work at 390px wide with no horizontal scroll, respect reduced motion, and keep the no-WebGL directory (`?no3d`) working.
- SEO: meta tags in `Gallery/src/index.html` use `%PROJECT_COUNT%` / `%SITE_URL%` tokens. JSON-LD and `sitemap.xml` are generated from `projects.json` (`Gallery/src/data/seo.ts`), and `netlify.toml` serves the sitemap at `/sitemap.xml`. Icons, the manifest and `og-image.png` (1200×630) live in `/brand`; regenerate the OG image if the island's look changes. The canonical URL is https://modern-web-mountain.netlify.app.
- Commit messages use gitmoji + conventional commits (e.g. `✨ feat(Gallery): ...`), with the sub-project as the scope.

## Boundaries
- Don't edit submodule folders (`Chrome Extensions/Gallery-Viewer`, `Linkest`, `Hydration-Hero`, `Local-Video-Player`); change them in their own repos. The same goes for the linked-out projects above.
- Build outputs (`Gallery/dist/`, `AI Valley/apps/`, the moved apps' `dist/`/`out/`/`build/`, `_redirects`, `.build-logs/`) are generated on Netlify. Don't commit them.

## More
- `README.md`: a plain-language overview and the full project list.
- `Gallery/README.md`: gallery features and architecture.
- `context/`: `PROGRESS_TRACKER.md` (status, next steps, session log), `ARCHITECTURE.md` (deploy layout and gallery data flow), `UI_TOKENS.md` (gallery colours and type).
