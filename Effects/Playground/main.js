// Effects Playground: one page that loads each effect's own folder in an iframe.
// effects.json is the list (also read by Gallery/tools/assemble-site.mjs to publish the folders).
const REPO = "https://github.com/AbdulDevHub/Archive-Mountain/tree/main/"

const $ = (id) => document.getElementById(id)
const list = $("list")
const frame = $("frame")
const filter = $("filter")
const hint = $("hint")

const encodePath = (path) => path.split("/").map(encodeURIComponent).join("/")
/** Where the effect runs: its folder's index.html, or a built app's own URL */
const srcOf = (e) => e.src ?? `/${encodePath(e.folder)}/`
const sourceOf = (e) => REPO + encodePath(e.folder ?? e.source)

let effects = []
let current = -1

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])
}

function renderList(query = "") {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const matches = (e) => {
    const haystack = `${e.name} ${e.group} ${e.description} ${e.tags.join(" ")}`.toLowerCase()
    return words.every((w) => haystack.includes(w))
  }
  const groups = new Map()
  effects.forEach((e, i) => {
    if (!matches(e)) return
    if (!groups.has(e.group)) groups.set(e.group, [])
    groups.get(e.group).push(`<button class="item" type="button" data-index="${i}"${i === current ? ' aria-current="true"' : ""}>${escapeHtml(e.name)}</button>`)
  })
  list.innerHTML = groups.size
    ? [...groups].map(([group, items]) => `<div class="group"><p class="group__title">${escapeHtml(group)}</p>${items.join("")}</div>`).join("")
    : `<p class="empty">No effects match “${escapeHtml(query)}”.</p>`
}

function show(index, { updateHash = true } = {}) {
  if (index < 0 || index >= effects.length) return
  current = index
  const e = effects[index]
  $("group").textContent = e.group
  $("name").textContent = e.name
  $("desc").textContent = e.description
  $("tags").innerHTML = e.tags.map((t) => `<li>${escapeHtml(t)}</li>`).join("")
  $("open").href = srcOf(e)
  $("source").href = sourceOf(e)
  document.title = `${e.name} · Effects Playground`
  frame.title = `${e.name} preview`
  frame.src = srcOf(e)
  for (const item of list.querySelectorAll(".item")) {
    const active = Number(item.dataset.index) === index
    item.toggleAttribute("aria-current", active)
    if (active) {
      item.setAttribute("aria-current", "true")
      item.scrollIntoView({ block: "nearest", inline: "nearest" })
    }
  }
  if (updateHash) history.replaceState(null, "", `#${e.slug}`)
}

const step = (delta) => show((current + delta + effects.length) % effects.length)

function fromHash() {
  const slug = decodeURIComponent(location.hash.slice(1))
  const index = effects.findIndex((e) => e.slug === slug)
  show(index === -1 ? 0 : index, { updateHash: index !== -1 })
}

async function init() {
  effects = await (await fetch("effects.json")).json()
  $("count").textContent = String(effects.length)
  renderList()
  fromHash()

  list.addEventListener("click", (event) => {
    const item = event.target.closest(".item")
    if (item) show(Number(item.dataset.index))
  })
  filter.addEventListener("input", () => renderList(filter.value))
  $("prev").addEventListener("click", () => step(-1))
  $("next").addEventListener("click", () => step(1))
  $("reload").addEventListener("click", () => {
    frame.src = srcOf(effects[current])
  })
  window.addEventListener("hashchange", fromHash)
  document.addEventListener("keydown", (event) => {
    if (event.target === filter || event.altKey || event.ctrlKey || event.metaKey) return
    if (event.key === "ArrowRight") step(1)
    if (event.key === "ArrowLeft") step(-1)
  })
  // The hint fades once the visitor starts playing with an effect
  const hideHint = () => hint.classList.add("is-hidden")
  frame.addEventListener("mouseenter", hideHint, { once: true })
  frame.addEventListener("focus", hideHint, { once: true })
  setTimeout(hideHint, 6000)
}

init().catch((err) => {
  $("name").textContent = "Could not load the effects list"
  $("desc").textContent = String(err)
})
