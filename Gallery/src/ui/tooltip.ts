/**
 * Hover preview for a valley: name, count, tagline and three screenshots.
 * It appears where the pointer entered the valley and then stays put, and it
 * is clickable itself, so moving onto it to click "Explore" works.
 */
import type { Project } from "../data/projects.ts"
import type { Section } from "../data/sections.ts"
import { escapeHtml } from "./directory.ts"
import { byId } from "./dom.ts"

export interface TooltipHandlers {
  /** The preview card was clicked */
  select(key: string): void
  /** The pointer is over the card (key) or has left it (null), to keep the valley glowing */
  preview(key: string | null): void
}

const HIDE_DELAY = 220 // ms: time to move the pointer from the island onto the card

export function createTooltip(handlers: TooltipHandlers) {
  const el = byId("tooltip")
  let shownFor: string | null = null
  let hideTimer = 0

  const hide = () => {
    clearTimeout(hideTimer)
    el.hidden = true
    shownFor = null
  }

  el.addEventListener("pointerenter", () => {
    clearTimeout(hideTimer)
    handlers.preview(shownFor)
  })
  el.addEventListener("pointerleave", () => {
    handlers.preview(null)
    hideTimer = window.setTimeout(hide, HIDE_DELAY)
  })
  el.addEventListener("click", () => {
    const key = shownFor
    hide()
    if (key) handlers.select(key)
  })

  return {
    show(key: string, title: string, accent: string, tagline: string, projects: readonly Project[], point: { x: number; y: number }) {
      clearTimeout(hideTimer)
      if (shownFor === key && !el.hidden) return // already showing: don't follow the pointer
      shownFor = key
      el.style.setProperty("--accent", accent)
      const thumbs = projects
        .slice(0, 3)
        .map((p) => `<img src="${p.image}" alt="" width="96" height="60" />`)
        .join("")
      el.innerHTML = `
        <p class="tooltip__title"><span class="dot" aria-hidden="true"></span>${escapeHtml(title)}<span class="tooltip__count">${projects.length}</span></p>
        <p class="tooltip__tagline">${escapeHtml(tagline)}</p>
        <div class="tooltip__thumbs">${thumbs}</div>
        <p class="tooltip__cta">Explore ${escapeHtml(title)} <span aria-hidden="true">→</span></p>`
      el.hidden = false
      // Place it beside the pointer, flipping left/up near the screen edges
      const { offsetWidth: w, offsetHeight: h } = el
      const x = point.x + 24 + w > innerWidth ? point.x - w - 24 : point.x + 24
      const y = point.y + 24 + h > innerHeight ? point.y - h - 24 : point.y + 24
      el.style.transform = `translate(${Math.max(8, x)}px, ${Math.max(8, y)}px)`
    },
    showSection(section: Section, projects: readonly Project[], point: { x: number; y: number }) {
      this.show(section.id, section.label, section.accent, section.tagline, projects, point)
    },
    /** Hide after a short delay, unless the pointer moves onto the card first */
    hideSoon() {
      if (el.hidden) return
      clearTimeout(hideTimer)
      hideTimer = window.setTimeout(hide, HIDE_DELAY)
    },
    hide,
  }
}
