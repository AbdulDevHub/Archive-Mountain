import { useEffect, useState } from "react"
import clsx from "clsx"
import { useMediaQuery } from "react-responsive"
import Jumbotron from "./Jumbotron.jsx"
import SoundSection from "./SoundSection.jsx"
import DisplaySection from "./DisplaySection.jsx"
import IphoneViewer from "./IphoneViewer.jsx"
import "./iphone.css"

/** The iPhone 14 Pro page: copy that scrolls over a fixed 3D phone */
const IphonePage = () => {
  const [preview, setPreview] = useState(false)
  const isMobile = useMediaQuery({ query: "(max-width: 990px)" })

  // While the phone is in close-up: hide the shared footer (it sits outside this page) and lock
  // scrolling, so the scroll-scrubbed camera tweens can't fight the preview flight and OrbitControls
  useEffect(() => {
    document.body.classList.toggle("iphone-previewing", preview)
    document.documentElement.style.overflow = preview ? "hidden" : ""
    return () => {
      document.body.classList.remove("iphone-previewing")
      document.documentElement.style.overflow = ""
    }
  }, [preview])

  return (
    <div className={clsx("iphone-page", isMobile && "mobile-or-tablet")}>
      <div className={clsx("iphone-content", preview && "is-hidden")}>
        <Jumbotron />
        <SoundSection />
        <DisplaySection onPreview={() => setPreview(true)} />
      </div>
      <IphoneViewer isMobile={isMobile} preview={preview} onExit={() => setPreview(false)} />
    </div>
  )
}

export default IphonePage
