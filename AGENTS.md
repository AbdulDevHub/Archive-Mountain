# Web Mountain

This file is read by AI coding agents working in this repo. It holds terse, project-specific rules and commands.
After any meaningful change to this project, update this file, `context/PROGRESS_TRACKER.md`, and the "Project Overview" section of `README.md` to reflect the current state. Do this proactively, without being asked.

Verify: cd Gallery && npm run build && npm test

## Overview
A portfolio monorepo of 64 small frontend projects, deployed as one static Netlify site (modern-web-mountain.netlify.app). Its front page, `Gallery/`, is a 3D low-poly island: each valley is a section.

## Tech stack
- `Gallery/`: TypeScript, Vite 8, Three.js, camera-controls, postprocessing, simplex-noise, Vitest. Uses npm.
- `AI Valley/`: its own Vite + TS sub-project with Netlify functions. Rules are in `AI Valley/AGENTS.md`.
- Other projects are mostly static HTML/CSS/JS. Bulk File Renamer is npm; Gitmoji Helper and Midnight Passages are pnpm. These three are built by `build.sh`. Several Chrome extensions and DhikrForest are git submodules.

## Commands
- Gallery: `cd Gallery && npm install`, `npm run dev` (also serves the rest of the repo), `npm test`, `npm run build` (output in `Gallery/dist/`, gitignored).
- Full deploy build: `bash build.sh` (Netlify runs this; publish dir is the repo root).

## Conventions
- `projects.json` (repo root) is the single source for the gallery. Each entry needs `name`, `category` (`effects|websites|ai|ui|extensions`), `description` (one line, no trailing period), 1–4 `tags`, `href` and `image` (repo-relative, or a full URL for GitHub-hosted extensions). `Gallery/tests/data.test.ts` validates it.
- When adding a project, also add it to the matching list in `README.md`.
- Netlify rewrites `/` to `/Gallery/dist/index.html`, so gallery links must be site-absolute (`toSiteUrl()` in `Gallery/src/data/projects.ts`).
- Gallery terrain maths are pure functions in `Gallery/src/world/terrain.ts`. Landmarks, trees, the camera and picking all use `heightAt()`; never sample the mesh.
- The gallery must work at 390px wide with no horizontal scroll, respect reduced motion, and keep the no-WebGL directory (`?no3d`) working.
- Commit messages use gitmoji + conventional commits (e.g. `✨ feat(Gallery): ...`), with the sub-project as the scope.

## Boundaries
- Don't edit submodule folders (`Chrome Extensions/Gallery-Viewer`, `Linkest`, `Hydration-Hero`, `Local-Video-Player`, `Awesome Websites/DhikrForest`); change them in their own repos.
- Build outputs (`Gallery/dist/`, `AI Valley/apps/`, the built folders inside the pnpm/npm websites) are generated on Netlify. Don't commit them.

## More
- `README.md`: a plain-language overview and the full project list.
- `Gallery/README.md`: gallery features and architecture.
- `context/`: `PROGRESS_TRACKER.md` (status, next steps, session log), `ARCHITECTURE.md` (deploy layout and gallery data flow), `UI_TOKENS.md` (gallery colours and type).
