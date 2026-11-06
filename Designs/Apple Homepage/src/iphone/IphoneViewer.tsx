import { Suspense, useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree, type RootState } from "@react-three/fiber"
import { OrbitControls, useGLTF, useProgress } from "@react-three/drei"
import { Vector3, type Camera } from "three"
import gsap from "gsap"
import StudioLights from "../components/three/StudioLights.jsx"
import { scrollAnimation, shot } from "./scrollAnimation"
import AnimatedLogo from "./assets/logo-animated.gif"

const MODEL = `${import.meta.env.BASE_URL}models/iphone-14-pro.glb`

const Iphone = () => {
  // The model is Draco-compressed; drei loads the decoder on demand
  const { scene } = useGLTF(MODEL, true)
  return <primitive object={scene} />
}

/** Points the camera from `position` at `target` every frame, unless the visitor is orbiting it */
const CameraRig = ({ position, target, orbiting }: { position: Vector3; target: Vector3; orbiting: boolean }) => {
  const camera = useThree((state) => state.camera)
  useFrame(() => {
    if (orbiting) return
    camera.position.copy(position)
    camera.lookAt(target)
  })
  return null
}

const Loader = () => {
  const { active, progress } = useProgress()
  const done = !active && progress === 100
  return (
    <div className={done ? "iphone-loader is-done" : "iphone-loader"} aria-hidden="true">
      <img src={AnimatedLogo} alt="" />
    </div>
  )
}

interface Props {
  isMobile: boolean
  preview: boolean
  onExit: () => void
}

/**
 * The 3D iPhone in front of the page. Scrolling flies the camera between shots; "Try me"
 * flies it to a close-up and hands control to OrbitControls until "Exit".
 */
const IphoneViewer = ({ isMobile, preview, onExit }: Props) => {
  const [position] = useState(() => new Vector3())
  const [target] = useState(() => new Vector3())
  const [orbiting, setOrbiting] = useState(false)
  const camera = useRef<Camera | null>(null)
  const firstRun = useRef(true)

  // Scroll-driven shots
  useEffect(() => {
    // The scrubbed tweens record their start values when created, so build them at the top of
    // the page; a restored or leftover scroll position would bake the wrong shot into them
    window.scrollTo({ top: 0, behavior: "instant" })
    const start = shot("start", isMobile)
    position.set(start.position.x, start.position.y, start.position.z)
    target.set(start.target.x, start.target.y, start.target.z)
    const ctx = gsap.context(() => scrollAnimation(position, target, isMobile))
    return () => ctx.revert()
  }, [isMobile, position, target])

  // Flights into and out of the close-up preview
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    setOrbiting(false)
    // Leaving the preview starts from wherever the visitor orbited to
    if (!preview && camera.current) position.copy(camera.current.position)
    const next = shot(preview ? "preview" : "display", isMobile)
    const flight = gsap.timeline({ onComplete: () => setOrbiting(preview) })
    flight.to(position, { ...next.position, duration: 2, ease: "power2.inOut" }, 0)
    flight.to(target, { ...next.target, duration: 2, ease: "power2.inOut" }, 0)
    return () => {
      flight.kill()
    }
  }, [preview, isMobile, position, target])

  return (
    <div className={preview ? "iphone-canvas is-preview" : "iphone-canvas"}>
      <Canvas
        camera={{ fov: 25, near: 0.1, far: 200 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        onCreated={(state: RootState) => {
          camera.current = state.camera
        }}
      >
        <StudioLights />
        <Suspense fallback={null}>
          <Iphone />
        </Suspense>
        <CameraRig position={position} target={target} orbiting={orbiting} />
        {orbiting && <OrbitControls target={target} enablePan={false} minDistance={4} maxDistance={24} />}
      </Canvas>
      {preview && (
        <button type="button" className="iphone-exit" onClick={onExit}>
          Exit
        </button>
      )}
      <Loader />
    </div>
  )
}

useGLTF.preload(MODEL, true)

export default IphoneViewer
