import Iphone from "./assets/iphone-14.jpg"
import HoldingIphone from "./assets/iphone-hand.png"

const scrollToSound = () => document.querySelector(".sound-section")?.scrollIntoView({ behavior: "smooth" })

const Jumbotron = () => {
  return (
    <section className="jumbotron-section wrapper">
      <h2 className="title">New</h2>
      <img className="logo" src={Iphone} alt="iPhone 14 Pro" />
      <p className="text">Big and bigger.</p>
      <span className="description">From $41.62/mo. for 24 mo. or $999 before trade-in</span>

      <ul className="links">
        <li>
          <button type="button" className="button">
            Buy
          </button>
        </li>
        <li>
          <button type="button" className="link" onClick={scrollToSound}>
            Learn more
          </button>
        </li>
      </ul>

      <img className="iphone-img" src={HoldingIphone} alt="A hand holding an iPhone 14 Pro" />
    </section>
  )
}

export default Jumbotron
