/**
 * The search dialog (press "/" or Ctrl+K). Choosing a result flies to the
 * project's valley and highlights its card.
 */
import type { Project } from "../data/projects.ts"
import { getSection } from "../data/sections.ts"
import { escapeHtml } from "./directory.ts"
import { byId, isTyping } from "./dom.ts"
import { searchProjects } from "./searchIndex.ts"

const SUGGESTED = ["WebGL", "React", "LLM", "game", "Chrome", "loader"]

export function createSearch(projects: readonly Project[], onPick: (project: Project) => void) {
  const dialog = byId<HTMLDialogElement>("search")
  const input = byId<HTMLInputElement>("search-input")
  const list = byId<HTMLUListElement>("search-results")
  input.placeholder = `Search ${projects.length} projects by name, idea or tech…`
  let results: Project[] = []
  let selected = 0

  const render = () => {
    const query = input.value.trim()
    results = searchProjects(query, projects)
    selected = Math.min(selected, Math.max(0, results.length - 1))
    if (!query) {
      list.innerHTML = `<li class="search__hint">Try ${SUGGESTED.map((s) => `<button type="button" class="chip" data-suggest="${s}">${s}</button>`).join(" ")}</li>`
      return
    }
    if (results.length === 0) {
      list.innerHTML = `<li class="search__hint">No projects match “${escapeHtml(query)}”.</li>`
      return
    }
    list.innerHTML = results
      .map((p, i) => {
        const s = getSection(p.section)
        return `<li role="option" id="result-${i}" aria-selected="${i === selected}" class="search__result" data-index="${i}" style="--accent:${s.accent}">
          <img src="${p.image}" alt="" loading="lazy" width="96" height="60" />
          <span class="search__text">
            <span class="search__name">${escapeHtml(p.name)}</span>
            <span class="search__meta"><span class="dot" aria-hidden="true"></span>${escapeHtml(s.label)} · ${escapeHtml(p.tags.join(", "))}</span>
          </span>
        </li>`
      })
      .join("")
    input.setAttribute("aria-activedescendant", `result-${selected}`)
  }

  const pick = (index: number) => {
    const project = results[index]
    if (!project) return
    dialog.close()
    onPick(project)
  }

  const open = () => {
    if (dialog.open) return
    input.value = ""
    selected = 0
    render()
    dialog.showModal()
    input.focus()
  }

  input.addEventListener("input", () => {
    selected = 0
    render()
  })
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      if (results.length === 0) return
      selected = (selected + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length
      render()
      list.querySelector(`[data-index="${selected}"]`)?.scrollIntoView({ block: "nearest" })
    } else if (e.key === "Enter") {
      e.preventDefault()
      pick(selected)
    }
  })
  list.addEventListener("click", (e) => {
    const target = e.target as HTMLElement
    const suggestion = target.closest<HTMLElement>("[data-suggest]")?.dataset.suggest
    if (suggestion) {
      input.value = suggestion
      render()
      input.focus()
      return
    }
    const item = target.closest<HTMLElement>("[data-index]")
    if (item) pick(Number(item.dataset.index))
  })
  // Clicking the dimmed backdrop closes the dialog
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close()
  })
  byId("search-open").addEventListener("click", open)
  document.addEventListener("keydown", (e) => {
    const shortcut = (e.key === "/" && !isTyping(e)) || (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey))
    if (shortcut) {
      e.preventDefault()
      open()
    }
  })

  return { open, get isOpen() { return dialog.open } }
}
