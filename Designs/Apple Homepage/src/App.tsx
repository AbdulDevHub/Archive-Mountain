import { useEffect, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/all"
import NavBar, { type Product } from "./components/NavBar.jsx"
import Hero from "./components/Hero.jsx"
import ProductViewer from "./components/ProductViewer.jsx"
import Showcase from "./components/Showcase.jsx"
import Performance from "./components/Performance.jsx"
import Features from "./components/Features.jsx"
import Highlights from "./components/Highlights.jsx"
import Footer from "./components/Footer.jsx"
import IphonePage from "./iphone/IphonePage.jsx"

gsap.registerPlugin(ScrollTrigger)

/** The page is picked by the URL hash (#mac or #iphone), so both pages can be linked directly */
const productFromHash = (): Product => (location.hash === "#iphone" ? "iphone" : "mac")

const MacPage = () => (
  <>
    <Hero />
    <ProductViewer />
    <Showcase />
    <Performance />
    <Features />
    <Highlights />
  </>
)

const App = () => {
  const [product, setProduct] = useState<Product>(productFromHash)

  useEffect(() => {
    const onHash = () => setProduct(productFromHash())
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  // Each page sets up its own scroll animations, so start at the top and re-measure after a switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
    document.title = product === "iphone" ? "iPhone 14 Pro · Apple Homepage" : "MacBook Pro · Apple Homepage"
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [product])

  return (
    <main className={product === "iphone" ? "is-iphone" : undefined}>
      <NavBar product={product} />
      {product === "iphone" ? <IphonePage key="iphone" /> : <MacPage key="mac" />}
      <Footer />
    </main>
  )
}

export default App
