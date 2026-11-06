import "./shared/theme.css"
import "./hub.css"
import { TOOLS } from "./shared/nav"

// Each tool's screenshot lives next to its page; Vite bundles the ones listed here
const SHOTS = import.meta.glob<string>("./*/Screenshot.png", { eager: true, query: "?url", import: "default" })

const grid = document.getElementById("tools")!
grid.replaceChildren(
  ...TOOLS.map((tool) => {
    const card = document.createElement("a")
    card.className = "hub-card card"
    card.href = `./${tool.slug}/`
    card.style.setProperty("--accent", tool.accent)

    const shot = SHOTS[`./${tool.slug}/Screenshot.png`]
    if (shot) {
      const img = document.createElement("img")
      img.src = shot
      img.alt = ""
      img.loading = "lazy"
      card.append(img)
    }

    const body = document.createElement("div")
    body.className = "hub-card__body"
    const name = document.createElement("h2")
    name.textContent = tool.name
    const blurb = document.createElement("p")
    blurb.textContent = tool.blurb
    body.append(name, blurb)
    if (tool.onDevice) {
      const badge = document.createElement("span")
      badge.className = "hub-card__badge"
      badge.textContent = "Runs on your device"
      body.append(badge)
    }
    card.append(body)
    return card
  }),
)
