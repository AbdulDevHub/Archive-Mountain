/** Typed `getElementById` that fails loudly if the markup and the code drift apart */
export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id)
  if (!el) throw new Error(`Missing #${id} in index.html`)
  return el as T
}

/** True when the keyboard event came from somewhere the user is typing */
export function isTyping(event: KeyboardEvent): boolean {
  const el = event.target as HTMLElement | null
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))
}

export const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches
