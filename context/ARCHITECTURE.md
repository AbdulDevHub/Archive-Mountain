# Architecture

How Web Mountain is deployed and how the 3D gallery is put together, so code lands in the right layer.
Read this before changing the deploy setup, `projects.json`'s shape, or gallery modules. Update it when those boundaries change.
`Gallery/README.md` has the longer, reader-facing version.

## Deploy layout
- Netlify publishes the **repo root** as-is (`netlify.toml`: `publish = "."`), after `bash build.sh` builds the sub-projects that need it, in parallel: Bulk File Renamer, Gitmoji Helper, Midnight Passages, Flappy Bird, Animated CSS Login Form, AI Valley, the Gallery and the framework apps in its `APPS` table.
- Framework apps (`App Valley/*`, most moved `UI Experiments/*`, Sky Diving Parallax Cat) are served at `/projects/<slug>/`. `build.sh` sets `BASE_PATH=/projects/<slug>/` for each build, runs `tools/relocate.mjs` on the output to fix root-absolute public paths, and writes `_redirects` lines (`/projects/<slug>/*` → the output folder, status 200). Netlify applies `_redirects` before `netlify.toml`.
- `/` is rewritten (status 200) to `/Gallery/dist/index.html`. The Vite build uses `base: "/Gallery/dist/"`, so its assets resolve there. Project links and screenshots are site-absolute paths into the repo.
- `netlify/functions/*.mts` are served at `/api/<name>` (used by AI Valley).

## Gallery data flow
```
projects.json ─► data/projects.ts (parse, validate, slug, toSiteUrl) ─► main.ts
main.ts: router (hash) ─► applyRoute ─► World.focusSection / focusOverview  (camera + valley glow)
                                    └─► Panel.showSection / showAll         (cards via ui/directory.ts)
inputs ─► router.navigate: island clicks (World ► picking.ts), labels, dock, search, arrow keys, Esc
```
- **Layers**: `data/` (pure config and validation), `world/` (three.js only, no DOM UI apart from CSS2D labels), `camera/` (camera-controls wrapper), `ui/` (DOM only, no three.js), `main.ts` (the only module that connects them).
- **Pure, tested modules**: `world/terrain.ts`, `world/picking.ts`, `world/lighting.ts` (`daylightAt`), `router.ts`, `ui/searchIndex.ts`, `ui/directory.ts`, `data/*`.
- `ui/directory.ts` runs both in the browser and in `vite.config.ts` (the build-time pre-render), so it must stay DOM-free.
- Valley order, colours and landmarks live only in `data/sections.ts`. Landmark builders are in `world/landmarks/`, each returning `{ group, update(dt, time) }`.
