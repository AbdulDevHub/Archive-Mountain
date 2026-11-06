# Architecture

How Archive Mountain is deployed and how the 3D gallery is put together, so code lands in the right layer.
Read this before changing the deploy setup, `projects.json`'s shape, or gallery modules. Update it when those boundaries change.
`Gallery/README.md` has the longer, reader-facing version.

## Deploy layout
- Netlify runs `bash build.sh` and publishes `_site/` (`netlify.toml`). Nothing outside `_site/` is deployed, so University, Mobile, backend and cut projects are never published.
- `build.sh` builds in parallel: Bulk File Renamer, Gitmoji Helper, Midnight Passages and Flappy Bird (in place), the Gallery, and the framework apps in its `APPS` table (AI Toolkit, Anime Vault, Apple Homepage, the Design Valley apps, Sky Diving Parallax Cat). Each app builds with `BASE_PATH=/projects/<slug>/`; `Gallery/tools/relocate.mjs` fixes root-absolute public paths in the output.
- Then `Gallery/tools/assemble-site.mjs` copies `Gallery/dist/` to the root of `_site/`, plus, for every `Gallery/projects.json` entry, the folder holding its static `href` and its `image`, and every effect folder in `Effects/Playground/effects.json`. `build.sh` copies each app's output to `_site/projects/<slug>/`. No rewrites or `_redirects` are needed.
- The gallery builds with `base: "/"`. `Gallery/public/` (brand icons, manifest, OG image, `robots.txt`) lands at the site root next to the generated `sitemap.xml`. Project links and screenshots are site-absolute repo paths.
- `netlify/functions/*.mts` are served at `/api/<name>` (used by the AI Toolkit).
- Case-Cobra and Modern-AliExpress are separate Vercel projects built from their folders in this repo; the gallery links to their live URLs.

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
