/**
 * Floating name tags above each valley and the summit. They are real DOM
 * buttons (via CSS2DRenderer), so text stays crisp and they are clickable.
 */
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js"
import type { Section } from "../data/sections.ts"
import type { IslandPart } from "./picking.ts"
import { heightAt, valleyPoint } from "./terrain.ts"

export interface LabelHandlers {
  select(part: IslandPart): void
  hover(part: IslandPart | null): void
}

function labelElement(text: string, count: number, accent: string, handlers: LabelHandlers, part: IslandPart) {
  const el = document.createElement("button")
  el.type = "button"
  el.className = "valley-label"
  // The dock offers the same choices to keyboard and screen-reader users
  el.tabIndex = -1
  el.style.setProperty("--accent", accent)
  el.innerHTML = `<span class="dot" aria-hidden="true"></span><span class="valley-label__name"></span><span class="valley-label__count">${count}</span>`
  el.querySelector(".valley-label__name")!.textContent = text
  el.addEventListener("click", (e) => {
    e.stopPropagation()
    handlers.select(part)
  })
  el.addEventListener("pointerenter", () => handlers.hover(part))
  el.addEventListener("pointerleave", () => handlers.hover(null))
  return el
}

export function createLabels(sections: readonly Section[], counts: Map<string, number>, total: number, handlers: LabelHandlers) {
  const objects = new Map<string, CSS2DObject>()

  for (const s of sections) {
    const p = valleyPoint(s.angle, 0.5)
    const label = new CSS2DObject(labelElement(s.label, counts.get(s.id) ?? 0, s.accent, handlers, { kind: "valley", id: s.id }))
    label.position.set(p.x, p.y + 8, p.z)
    objects.set(s.id, label)
  }

  const summit = new CSS2DObject(labelElement("All projects", total, "#38bdf8", handlers, { kind: "summit" }))
  summit.position.set(0, heightAt(0, 0) + 6.5, 0)
  summit.element.classList.add("valley-label--summit")
  objects.set("summit", summit)

  return {
    objects: [...objects.values()],
    /** Mark one label as active (the open valley) and dim the rest */
    setActive(key: string | null) {
      for (const [k, obj] of objects) {
        obj.element.classList.toggle("is-active", k === key)
        obj.element.classList.toggle("is-dimmed", key !== null && k !== key)
      }
    },
    setHovered(key: string | null) {
      for (const [k, obj] of objects) obj.element.classList.toggle("is-hovered", k === key)
    },
  }
}
