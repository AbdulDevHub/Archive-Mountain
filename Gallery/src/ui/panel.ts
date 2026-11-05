/**
 * The project panel: a side panel on wide screens, a draggable bottom sheet
 * on phones. It only renders cards; deciding *when* to open is main.ts's job.
 */
import type { PanelLayout } from "../camera/CameraRig.ts"
import type { Project } from "../data/projects.ts"
import { SECTIONS, type Section } from "../data/sections.ts"
import { renderCardGridHtml, renderDirectoryHtml } from "./directory.ts"
import { byId, prefersReducedMotion } from "./dom.ts"

const SHEET_QUERY = matchMedia("(max-width: 860px)")

export class Panel {
  private readonly root = byId("panel")
  private readonly content = byId("panel-content")
  private readonly title = byId("panel-title")
  private readonly eyebrow = byId("panel-eyebrow")
  private readonly tagline = byId("panel-tagline")
  private highlightTimer = 0
  private hideTimer = 0
  private openFrame = 0

  constructor(private readonly onClose: () => void) {
    byId("panel-close").addEventListener("click", () => this.onClose())
    this.enableSheetDrag()
  }

  get isSheet() {
    return SHEET_QUERY.matches
  }

  /** How much of the screen the open panel covers, for the camera to work around */
  layout(): PanelLayout {
    if (this.root.hidden) return { right: 0, bottom: 0 }
    // offsetWidth/Height ignore the slide-in transform, so this is right even mid-animation
    const margin = 16
    return this.isSheet
      ? { right: 0, bottom: Math.min(0.85, this.root.offsetHeight / innerHeight) }
      : { right: Math.min(0.8, (this.root.offsetWidth + margin) / innerWidth), bottom: 0 }
  }

  onLayoutChange(callback: () => void) {
    SHEET_QUERY.addEventListener("change", callback)
  }

  showSection(section: Section, projects: readonly Project[]) {
    this.open(section.accent, `${projects.length} projects`, section.label, section.tagline)
    this.content.innerHTML = renderCardGridHtml(projects, section)
  }

  showAll(projects: readonly Project[]) {
    this.open("#38bdf8", `The summit · ${SECTIONS.length} valleys`, "All projects", `Every one of the ${projects.length} projects on the mountain`)
    this.content.innerHTML = renderDirectoryHtml(projects)
  }

  hide() {
    if (this.root.hidden) return
    cancelAnimationFrame(this.openFrame)
    clearTimeout(this.hideTimer)
    this.root.classList.remove("is-open", "is-expanded")
    document.body.classList.remove("has-panel")
    // Remove it from the page once the slide-out has finished (or after a fallback delay,
    // in case no transition runs); a re-open in the meantime cancels this
    const done = () => {
      if (!this.root.classList.contains("is-open")) this.root.hidden = true
    }
    if (prefersReducedMotion()) return done()
    const onEnd = (e: TransitionEvent) => {
      if (e.target !== this.root || e.propertyName !== "transform") return // ignore card hovers bubbling up
      this.root.removeEventListener("transitionend", onEnd)
      done()
    }
    this.root.addEventListener("transitionend", onEnd)
    this.hideTimer = window.setTimeout(() => {
      this.root.removeEventListener("transitionend", onEnd)
      done()
    }, 900)
  }

  /** Scroll a card into view and pulse it, e.g. after picking a search result */
  highlight(slug: string) {
    const card = this.content.querySelector<HTMLElement>(`.card[data-slug="${CSS.escape(slug)}"]`)
    if (!card) return
    card.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" })
    card.classList.add("is-highlighted")
    card.focus({ preventScroll: true })
    clearTimeout(this.highlightTimer)
    this.highlightTimer = window.setTimeout(() => card.classList.remove("is-highlighted"), 2600)
  }

  private open(accent: string, eyebrow: string, title: string, tagline: string) {
    this.root.style.setProperty("--accent", accent)
    this.eyebrow.textContent = eyebrow
    this.title.textContent = title
    this.tagline.textContent = tagline
    this.content.scrollTop = 0
    clearTimeout(this.hideTimer)
    this.root.hidden = false
    document.body.classList.add("has-panel")
    // Next frame, so the slide-in transition runs from the hidden state
    cancelAnimationFrame(this.openFrame)
    this.openFrame = requestAnimationFrame(() => this.root.classList.add("is-open"))
  }

  /** Drag the sheet's handle up to expand it, or down to close it */
  private enableSheetDrag() {
    const handle = byId("panel-handle")
    let startY = 0
    let dy = 0
    let dragging = false
    const header = this.root.querySelector<HTMLElement>(".panel__header")!

    const start = (e: PointerEvent) => {
      if (!this.isSheet || (e.target as HTMLElement).closest("button")) return
      dragging = true
      startY = e.clientY
      dy = 0
      this.root.classList.add("is-dragging")
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      dy = e.clientY - startY
      this.root.style.transform = `translateY(${Math.max(dy, -40)}px)`
    }
    const end = () => {
      if (!dragging) return
      dragging = false
      this.root.classList.remove("is-dragging")
      this.root.style.transform = ""
      if (dy > 110) this.onClose()
      else if (dy < -50) this.root.classList.add("is-expanded")
      else if (dy > 40) this.root.classList.remove("is-expanded")
    }
    for (const el of [handle, header]) {
      el.addEventListener("pointerdown", start)
      el.addEventListener("pointermove", move)
      el.addEventListener("pointerup", end)
      el.addEventListener("pointercancel", end)
    }
  }
}
