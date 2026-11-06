const scrollToDisplay = () => document.querySelector(".display-section")?.scrollIntoView({ behavior: "smooth" })

const SoundSection = () => {
  return (
    <section className="sound-section wrapper">
      <div className="body">
        <div className="sound-section-content content">
          <h2 className="title">New sound system</h2>
          <p className="text">Feel the bass.</p>
          <span className="description">From $41.62/mo. for 24 mo. or $999 before trade-in</span>

          <ul className="links">
            <li>
              <button type="button" className="button">
                Buy
              </button>
            </li>
            <li>
              <button type="button" className="link" onClick={scrollToDisplay}>
                Learn more
              </button>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default SoundSection
