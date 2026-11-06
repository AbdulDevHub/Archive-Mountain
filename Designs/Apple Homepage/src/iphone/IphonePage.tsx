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

  // The shared footer sits outside this page, so hide it from the body while the phone is in close-up
  useEffect(() => {
    document.body.classList.toggle("iphone-previewing", preview)
    return () => document.body.classList.remove("iphone-previewing")
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
