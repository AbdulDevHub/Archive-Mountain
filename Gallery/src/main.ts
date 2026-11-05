/**
 * Entry point: decides between the 3D island and the plain directory, then
 * wires the pieces together.
 *
 *   router (URL) ──► applyRoute ──► World (camera flight, glow)
 *                              └──► Panel (cards)
 *   World / Dock / Search / Labels ──► router.navigate
 */
import "./styles/theme.css"
import "./styles/scene.css"
import "./styles/panel.css"
import "./styles/search.css"
import "./styles/directory.css"

import { Ambience } from "./audio/ambience.ts"
import { groupBySection, PROJECTS, type Project } from "./data/projects.ts"
import { getSection, SECTIONS, type SectionId } from "./data/sections.ts"
import { createRouter, sameRoute, type Route } from "./router.ts"
import { createDock } from "./ui/dock.ts"
import { byId, isTyping, prefersReducedMotion } from "./ui/dom.ts"
import { Panel } from "./ui/panel.ts"
import { createSearch } from "./ui/search.ts"
import { createTooltip } from "./ui/tooltip.ts"
import { detectQuality, supportsWebGL } from "./world/quality.ts"
import { World } from "./world/World.ts"
import type { IslandPart } from "./world/picking.ts"

const grouped = groupBySection(PROJECTS)
const counts = new Map<SectionId, number>([...grouped].map(([id, list]) => [id, list.length]))

function startIsland() {
  document.documentElement.classList.replace("no-3d", "has-3d")
  byId("directory").hidden = true

  const reducedMotion = prefersReducedMotion()
  const ambience = new Ambience()
  const tooltip = createTooltip()
  const panel = new Panel(() => router.navigate({ view: "overview" }))
  let introDone = false

  const routeFor = (part: IslandPart): Route | null =>
    part.kind === "summit" ? { view: "all" } : part.kind === "valley" ? { view: "section", id: part.id } : null

  const world = new World({
    container: byId("scene"),
    quality: detectQuality(),
    reducedMotion,
    counts,
    total: PROJECTS.length,
    onSelect(part) {
      const route = routeFor(part)
      if (route && introDone) router.navigate(route)
    },
    onHover(part, point) {
      // On phones the sheet covers the island, and there is no hover anyway
      if (!part || !point || part.kind === "sea" || panel.isSheet) return tooltip.hide()
      if (part.kind === "summit") tooltip.show("summit", "All projects", "#38bdf8", "The summit: every valley at once", PROJECTS, point)
      else tooltip.showSection(getSection(part.id), grouped.get(part.id) ?? [], point)
    },
  })

  const dock = createDock(counts, PROJECTS.length, {
    navigate: (route) => router.navigate(route),
    preview: (id) => world.previewSection(id),
  })

  /** Point the camera at a route, leaving room for the panel if it is open */
  function frameCamera(route: Route) {
    if (route.view === "overview") world.focusOverview({ right: 0, bottom: 0 }, null)
    else if (route.view === "all") world.focusOverview(panel.layout(), "summit")
    else world.focusSection(getSection(route.id), panel.layout())
  }

  let routeApplied = false

  /** Make the 3D view and the panel match a route */
  function applyRoute(route: Route) {
    routeApplied = true
    tooltip.hide()
    dock.setActive(route)
    byId("hint").classList.toggle("is-hidden", route.view !== "overview")
    if (route.view === "overview") panel.hide()
    else if (route.view === "all") panel.showAll(PROJECTS)
    else panel.showSection(getSection(route.id), grouped.get(route.id) ?? [])
    frameCamera(route)
    if (route.view !== "overview") {
      ambience.whoosh()
      if (route.project) panel.highlight(route.project)
      else byId("panel-title").focus({ preventScroll: true })
    }
  }

  const router = createRouter(applyRoute)

  const search = createSearch(PROJECTS, (project: Project) => {
    const route: Route = { view: "section", id: project.section, project: project.slug }
    // Already there: navigate() would do nothing, so just point at the card again
    if (sameRoute(route, router.current)) panel.highlight(project.slug)
    else router.navigate(route)
  })

  // Brand link and keyboard shortcuts
  document.querySelector('[data-route="overview"]')?.addEventListener("click", (e) => {
    e.preventDefault()
    router.navigate({ view: "overview" })
  })
  document.addEventListener("keydown", (e) => {
    tooltip.hide()
    if (isTyping(e) || e.defaultPrevented || !introDone || search.isOpen) return
    if (e.key === "Escape" && router.current.view !== "overview") router.navigate({ view: "overview" })
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      // Walk around the island valley by valley
      const route = router.current
      const n = SECTIONS.length
      const step = e.key === "ArrowRight" ? 1 : -1
      const current = route.view === "section" ? SECTIONS.findIndex((s) => s.id === route.id) : -1
      const next = current === -1 ? (step === 1 ? 0 : n - 1) : (current + step + n) % n
      router.navigate({ view: "section", id: SECTIONS[next].id })
    }
  })

  // When the layout flips between side panel and bottom sheet, re-frame the camera
  panel.onLayoutChange(() => frameCamera(router.current))

  // Sound toggle (the first click also unlocks audio for the browser)
  const soundButton = byId("sound-toggle")
  const syncSound = () => soundButton.setAttribute("aria-pressed", String(ambience.enabled))
  soundButton.addEventListener("click", async () => {
    await ambience.setEnabled(!ambience.enabled)
    syncSound()
  })
  syncSound()
  if (ambience.enabled) {
    // Remembered as "on": resume on the first interaction, as browsers require
    window.addEventListener("pointerdown", () => ambience.setEnabled(true), { once: true })
  }

  world.start()
  // The intro can be cut short by dragging; never let it block the page
  const timeout = new Promise((resolve) => setTimeout(resolve, 4500))
  Promise.race([world.rig.playIntro(), timeout]).then(() => {
    introDone = true
    byId("intro").classList.add("is-done")
    // Open a deep link (#ai) now, unless the visitor already navigated during the intro
    if (!routeApplied && router.current.view !== "overview") applyRoute(router.current)
  })
}

/** No WebGL (or ?no3d): the pre-rendered directory is the whole page */
function startDirectory() {
  byId("scene-ui").remove()
}

/** Swap any screenshot that fails to load for a soft mountain placeholder */
function useImageFallback() {
  const placeholder =
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect width="160" height="100" fill="#e6f2fb"/><path d="M30 80 70 30l18 22 12-14 30 42Z" fill="#b9d7c4"/><path d="m70 30 10 12-5-2-5 5-5-5-5 2Z" fill="#fff"/></svg>`,
    )
  document.addEventListener(
    "error",
    (e) => {
      const img = e.target
      if (img instanceof HTMLImageElement && img.src !== placeholder) img.src = placeholder
    },
    true, // image errors don't bubble, so listen in the capture phase
  )
}

useImageFallback()
if (supportsWebGL()) startIsland()
else startDirectory()
