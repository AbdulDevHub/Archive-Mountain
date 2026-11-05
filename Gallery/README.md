# Web Mountain Gallery: A Low-Poly 3D Island Portfolio

![Web Mountain island](../Screenshot.png)

The front page of [Web Mountain](https://github.com/AbdulDevHub/Web-Mountain). It shows all 64 projects as a daytime island. The summit means "all projects", and each of the five valleys around it is one section of the portfolio, with its own landmark. Click a valley and the camera flies in while that section's cards slide out beside it.

Built with **TypeScript, Three.js, Vite and camera-controls**. There are no model or texture files: the terrain, buildings, trees, birds and even the sound are generated in code.

| Valley | Landmark | Section |
| --- | --- | --- |
| Awesome Effects | Waterfall, glowing crystals, flowers | Shaders, cursors, loaders |
| Awesome Websites | Village with smoking chimneys | Full apps, tools and games |
| AI Valley | Observatory, radio dish, orbiting orbs | LLM agents and on-device models |
| UI Experiments | Windmill over tulip fields | Landing pages and UI concepts |
| Chrome Extensions | Lighthouse, pier, rope bridge | Browser extensions |

## Features

- **Fly-to navigation**: valleys, labels, the dock and the arrow keys all move the camera. The side panel (a draggable bottom sheet on phones) shows that section's cards, and the camera shifts so the panel never covers what you're looking at.
- **Deep links and Back**: `#ai` opens a valley and `#effects/ink-fluid` also highlights a card. The browser's Back button flies you back out.
- **Search** (`/` or `Ctrl+K`): ranked across names, blurbs and tech tags. Picking a result flies to the project and highlights its card.
- **Hover previews**: hovering a valley makes it glow and shows a tooltip with its count and three screenshots.
- **A living island**: drifting clouds, circling gulls, a hot-air balloon, a sailboat, a waving summit flag, chimney smoke and a turning windmill. The sun follows your local time but stays in daylight.
- **Optional soundscape**: wind, birdsong and a whoosh on each flight, all made with the Web Audio API. It's off by default and your choice is remembered.
- **Search-friendly**: the build fills in the meta and Open Graph/Twitter tags, generates JSON-LD structured data (`WebSite` plus an `ItemList` of every project) and writes a sitemap, all from `projects.json` (`src/data/seo.ts`). Icons, the web manifest and the 1200×630 social image live in `/brand` at the repo root.
- **Works everywhere**: phones get a lighter quality tier. A frame-rate watchdog drops post-processing if the device struggles. The reduced-motion setting turns flights into cuts. Browsers without WebGL (or `?no3d`) get a plain, pre-rendered project directory, which is also what crawlers see.

## How it works

```
projects.json (repo root)
      │  validated + normalised
      ▼
src/data ──► src/main.ts ──► router (URL hash) ──► applyRoute()
                 │                                   ├─► World.focusSection()  (camera + glow)
                 │                                   └─► Panel.showSection()   (cards)
                 └─ Dock, Search, Labels, clicks on the island ──► router.navigate()
```

- **Terrain is a pure function.** `world/terrain.ts` exports `heightAt(x, z)`: a cone-shaped mountain, a beach shelf, ridges raised everywhere, then five valleys carved down to gently sloping floors along their axes, plus fractal simplex noise. The same function places landmarks and trees, aims the camera, and handles picking, so the code doesn't need the mesh to answer questions about the island.
- **Low-poly look.** `world/island.ts` displaces a grid with `heightAt` and splits it into separate triangles. Each face gets one colour (sand, then a valley-tinted meadow, then rock, then snow). Hover glow is a small `onBeforeCompile` patch to three's standard material, driven by a per-face "which valley" attribute.
- **Picking without raycasting 100k triangles.** `world/picking.ts` marches the pointer ray against `heightAt` and refines the hit by bisection. `partAt()` then turns the hit point into summit, valley or sea using its angle around the island.
- **Camera.** `camera/CameraRig.ts` wraps camera-controls. It handles the intro descent through the clouds, overview, fly-to-valley, idle auto-rotate, and a focal offset that keeps the subject centred in the part of the screen the panel leaves free.
- **One card renderer, two outputs.** `ui/directory.ts` renders cards to HTML strings. The browser uses it for the panel, and a Vite plugin uses it at build time to pre-render the full directory into `index.html`.

## File map

```
src/
  main.ts              wiring: WebGL check, routes, shortcuts, sound toggle
  router.ts            hash routes (#ai, #effects/ink-fluid, #all)
  data/                sections.ts (valley config), projects.ts (typed, validated projects.json)
  camera/CameraRig.ts  every camera move
  world/
    World.ts           renderer, scene, render loop, pointer input, post-processing
    terrain.ts         pure height/valley maths
    island.ts          terrain mesh, face colours, hover glow shader patch
    picking.ts         pointer ray -> summit / valley / sea
    lighting.ts sky.ts water.ts quality.ts labels.ts
    landmarks/         waterfall, village, observatory, windmill, lighthouse (+ kit.ts helpers)
    ambient/           trees (instanced), clouds, birds, balloon / sailboat / summit flag
  ui/                  panel, dock, search (+ searchIndex), tooltip, directory renderer
  audio/ambience.ts    Web Audio soundscape
  styles/              theme tokens, scene overlay, panel, search, directory
tests/                 Vitest: terrain, picking, data, router, search, daylight
```

## Develop

```bash
cd Gallery
npm install
npm run dev      # http://localhost:5173 (serves the rest of the repo too, so screenshots and project links work)
npm test         # unit tests
npm run build    # type-check + production build to Gallery/dist
```

Add or edit projects in the repo-root `projects.json`: `name`, `category` (a section id), `description`, `tags`, `href` and `image`. The tests check that every entry is valid and that its screenshot exists.

On Netlify, the root `build.sh` builds this folder, and `netlify.toml` rewrites `/` to `Gallery/dist/index.html`.
