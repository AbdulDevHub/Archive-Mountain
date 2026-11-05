/** A gradient sky dome with a soft sun glow, drawn behind everything else */
import * as THREE from "three"
import { sunDirection, type Daylight } from "./lighting.ts"

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  varying vec3 vDir;
  void main() {
    float h = max(vDir.y, 0.0);
    vec3 color = mix(uHorizon, uTop, pow(h, 0.55));
    float sun = max(dot(normalize(vDir), uSunDir), 0.0);
    color += uSunColor * (pow(sun, 900.0) * 1.6 + pow(sun, 12.0) * 0.22);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

export function createSky(light: Daylight): THREE.Mesh {
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTop: { value: new THREE.Color(light.skyTop) },
      uHorizon: { value: new THREE.Color(light.skyHorizon) },
      uSunDir: { value: sunDirection(light) },
      uSunColor: { value: new THREE.Color(light.sunColor) },
    },
  })
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), material)
  sky.name = "sky"
  sky.renderOrder = -1
  return sky
}
