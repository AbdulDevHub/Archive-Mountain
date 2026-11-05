/** Hover preview for a valley: name, count, tagline and three screenshots */
import type { Project } from "../data/projects.ts"
import type { Section } from "../data/sections.ts"
import { escapeHtml } from "./directory.ts"
import { byId } from "./dom.ts"

export function createTooltip() {
  const el = byId("tooltip")
  let shownFor: string | null = null

  return {
    show(key: string, title: string, accent: string, tagline: string, projects: readonly Project[], point: { x: number; y: number }) {
      if (shownFor !== key) {
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
          <p class="tooltip__cta">Click to explore</p>`
      }
      el.hidden = false
      // Keep the card on screen: flip to the left/top near the edges
      const { offsetWidth: w, offsetHeight: h } = el
      const x = point.x + 18 + w > innerWidth ? point.x - w - 18 : point.x + 18
      const y = point.y + 18 + h > innerHeight ? point.y - h - 18 : point.y + 18
      el.style.transform = `translate(${Math.max(8, x)}px, ${Math.max(8, y)}px)`
    },
    showSection(section: Section, projects: readonly Project[], point: { x: number; y: number }) {
      this.show(section.id, section.label, section.accent, section.tagline, projects, point)
    },
    hide() {
      el.hidden = true
      shownFor = null
    },
  }
}
