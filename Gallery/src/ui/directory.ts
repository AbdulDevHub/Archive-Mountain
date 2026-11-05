/**
 * Pure HTML-string renderers for project cards. They run in the browser (side
 * panel) and at build time (pre-rendered directory in index.html), so they
 * must not touch the DOM.
 */
import type { Project } from "../data/projects.ts"
import { SECTIONS, type Section } from "../data/sections.ts"

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ESCAPES[ch])
}

export function renderCardHtml(project: Project, section: Section): string {
  const tags = project.tags.map((t) => `<li>${escapeHtml(t)}</li>`).join("")
  // Projects hosted elsewhere (e.g. extension repos on GitHub) open in a new tab
  const external = /^https?:/.test(project.href) ? ' target="_blank" rel="noopener"' : ""
  return `
    <a class="card" href="${project.href}"${external} data-slug="${project.slug}" style="--accent:${section.accent}">
      <img class="card__image" src="${project.image}" alt="" loading="lazy" decoding="async" width="640" height="400" />
      <span class="card__body">
        <span class="card__name">${escapeHtml(project.name)}</span>
        <span class="card__description">${escapeHtml(project.description)}</span>
        <ul class="card__tags" aria-label="Built with">${tags}</ul>
      </span>
    </a>`
}

export function renderCardGridHtml(projects: readonly Project[], section: Section): string {
  return `<div class="card-grid">${projects.map((p) => renderCardHtml(p, section)).join("")}</div>`
}

/** Every section with its cards: the no-WebGL page and the summit's "All projects" view */
export function renderDirectoryHtml(projects: readonly Project[]): string {
  return SECTIONS.map((section) => {
    const items = projects.filter((p) => p.section === section.id)
    return `
      <section class="directory__section" id="directory-${section.id}" style="--accent:${section.accent}">
        <h2 class="directory__title"><span class="dot" aria-hidden="true"></span>${escapeHtml(section.label)} <span class="count">${items.length}</span></h2>
        <p class="directory__tagline">${escapeHtml(section.tagline)}</p>
        ${renderCardGridHtml(items, section)}
      </section>`
  }).join("")
}
