import { navLinks } from "../constants"

export type Product = "mac" | "iphone"

/** Nav labels that switch the page; the rest are decorative, like on the real site */
const PAGES: Record<string, Product> = { Mac: "mac", iPhone: "iphone" }

const NavBar = ({ product }: { product: Product }) => {
  return (
    <header>
      <nav>
        <a href="#mac" aria-label="Apple, MacBook Pro page">
          <img src="/logo.svg" alt="Apple Logo" />
        </a>

        <ul>
          {navLinks.map(({ label }) => {
            const page = PAGES[label]
            return (
              <li key={label}>
                {page ? (
                  <a href={`#${page}`} aria-current={page === product ? "page" : undefined}>
                    {label}
                  </a>
                ) : (
                  <span>{label}</span>
                )}
              </li>
            )
          })}
        </ul>

        <div className="flex-center gap-3">
          <button type="button" aria-label="Search">
            <img src="/search.svg" alt="" />
          </button>
          <button type="button" aria-label="Bag">
            <img src="/cart.svg" alt="" />
          </button>
        </div>
      </nav>
    </header>
  )
}
export default NavBar
