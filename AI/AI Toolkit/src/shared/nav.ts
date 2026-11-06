// The toolkit's shared top navigation and its list of tools (also used by the hub page).
// Built pages live at apps/<slug>/index.html with the hub at apps/index.html, so links are relative.

export interface Tool {
  slug: string
  name: string
  blurb: string
  accent: string
  /** Runs on the visitor's device, so it works without the AI proxy */
  onDevice?: boolean
}

export const TOOLS: readonly Tool[] = [
  { slug: "translator", name: "Lingua", blurb: "Translate between 20 languages and hear the result read aloud", accent: "#4fd1c5", onDevice: true },
  { slug: "agent", name: "ReAct Agent", blurb: "An agent that reasons, calls tools for live facts and shows every step", accent: "#f6b44b" },
  { slug: "movies", name: "ReelRecs", blurb: "Chat about films, grounded in its own list with in-browser embeddings (RAG)", accent: "#ff7eb6" },
  { slug: "vision", name: "Vision Lab", blurb: "Detect objects in a photo or webcam frame, then ask questions about it", accent: "#8b7bff", onDevice: true },
  { slug: "stocks", name: "Market Pulse", blurb: "An AI-written report on up to three stock tickers, with sparklines", accent: "#5ee0a0" },
  { slug: "images", name: "Image Studio", blurb: "Text-to-image, movie posters and photo remixes with free models", accent: "#ff9f6b" },
  { slug: "faces", name: "Face Emotions", blurb: "Real-time face, landmark and emotion detection from your webcam", accent: "#60a5fa", onDevice: true },
]

/** Fills every `<nav class="toolkit-nav" data-current="slug">` with the hub link and one link per tool */
export function renderNav(root: ParentNode = document): void {
  for (const nav of root.querySelectorAll<HTMLElement>("nav.toolkit-nav")) {
    const current = nav.dataset.current ?? ""
    const prefix = current ? "../" : "./"
    const home = document.createElement("a")
    home.className = "toolkit-nav__home"
    home.href = prefix
    home.textContent = "AI Toolkit"
    const links = document.createElement("div")
    links.className = "toolkit-nav__tools"
    for (const tool of TOOLS) {
      const a = document.createElement("a")
      a.href = `${prefix}${tool.slug}/`
      a.textContent = tool.name
      if (tool.slug === current) a.setAttribute("aria-current", "page")
      links.append(a)
    }
    nav.replaceChildren(home, links)
    links.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "center" })
  }
}

renderNav()
