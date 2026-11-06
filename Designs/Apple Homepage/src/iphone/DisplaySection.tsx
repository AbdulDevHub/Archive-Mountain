const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })

const DisplaySection = ({ onPreview }: { onPreview: () => void }) => {
  return (
    <section className="display-section wrapper">
      <h2 className="title">New</h2>
      <p className="text">Brilliant.</p>
      <span className="description">A display that's up to 2x brighter in the sun.</span>
      <button type="button" className="button" onClick={onPreview}>
        Try me!
      </button>
      <button type="button" className="back-button" onClick={scrollToTop}>
        Top
      </button>
    </section>
  )
}

export default DisplaySection
