/**
 * The row of valley buttons at the bottom of the screen. It mirrors what the
 * 3D labels do, so the island is fully usable with a keyboard or screen reader.
 */
import type { Route } from "../router.ts"
import { SECTIONS, type SectionId } from "../data/sections.ts"
import { escapeHtml } from "./directory.ts"
import { byId } from "./dom.ts"

export interface DockHandlers {
  navigate(route: Route): void
  preview(id: SectionId | null): void
}

export function createDock(counts: Map<SectionId, number>, total: number, handlers: DockHandlers) {
  const dock = byId("dock")
  const button = (key: string, label: string, accent: string, count: number) =>
    `<button type="button" class="dock__item" data-key="${key}" style="--accent:${accent}">
      <span class="dot" aria-hidden="true"></span>
      <span class="dock__label">${escapeHtml(label)}</span>
      <span class="dock__count" aria-label="${count} projects">${count}</span>
    </button>`

  dock.innerHTML =
    button("all", "All", "#38bdf8", total) + SECTIONS.map((s) => button(s.id, s.label, s.accent, counts.get(s.id) ?? 0)).join("")

  dock.addEventListener("click", (e) => {
    const key = (e.target as HTMLElement).closest<HTMLElement>(".dock__item")?.dataset.key
    if (!key) return
    handlers.navigate(key === "all" ? { view: "all" } : { view: "section", id: key as SectionId })
  })
  dock.addEventListener("pointerover", (e) => {
    const key = (e.target as HTMLElement).closest<HTMLElement>(".dock__item")?.dataset.key
    handlers.preview(key && key !== "all" ? (key as SectionId) : null)
  })
  dock.addEventListener("pointerleave", () => handlers.preview(null))

  return {
    setActive(route: Route) {
      const active = route.view === "all" ? "all" : route.view === "section" ? route.id : null
      for (const item of dock.querySelectorAll<HTMLElement>(".dock__item")) {
        const on = item.dataset.key === active
        item.classList.toggle("is-active", on)
        if (on) item.setAttribute("aria-current", "true")
        else item.removeAttribute("aria-current")
      }
      dock.querySelector(".is-active")?.scrollIntoView({ inline: "center", block: "nearest" })
    },
  }
}
