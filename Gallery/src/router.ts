/**
 * URL hash <-> view state. Deep links like `#apps` or `#tools/dupehunt`
 * open straight into a valley (and highlight a card), and the browser's
 * Back button flies you back out.
 */
import { isSectionId, type SectionId } from "./data/sections.ts"

export type Route =
  | { view: "overview" }
  | { view: "all"; project?: string }
  | { view: "section"; id: SectionId; project?: string }

export function parseHash(hash: string): Route {
  let decoded: string
  try {
    decoded = decodeURIComponent(hash.replace(/^#\/?/, ""))
  } catch {
    return { view: "overview" } // malformed link, e.g. a stray "%"
  }
  const [first = "", project] = decoded.split("/")
  const slug = project || undefined
  if (first === "all") return { view: "all", project: slug }
  if (isSectionId(first)) return { view: "section", id: first, project: slug }
  return { view: "overview" }
}

export function routeToHash(route: Route): string {
  if (route.view === "overview") return ""
  const base = route.view === "all" ? "all" : route.id
  return "#" + (route.project ? `${base}/${route.project}` : base)
}

export function sameRoute(a: Route, b: Route): boolean {
  return routeToHash(a) === routeToHash(b)
}

export function createRouter(onChange: (route: Route) => void) {
  let current = parseHash(location.hash)

  window.addEventListener("popstate", () => {
    current = parseHash(location.hash)
    onChange(current)
  })

  return {
    get current() {
      return current
    },
    navigate(route: Route, options: { replace?: boolean } = {}) {
      if (sameRoute(route, current)) return
      const url = routeToHash(route) || location.pathname + location.search
      if (options.replace) history.replaceState(null, "", url)
      else history.pushState(null, "", url)
      current = route
      onChange(route)
    },
  }
}
