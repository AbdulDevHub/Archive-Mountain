/**
 * Island soundscape made entirely with the Web Audio API (no audio files):
 * wind from filtered noise, synthesised birdsong, and a whoosh for flights.
 * Off by default; the choice is remembered per browser.
 */
const STORAGE_KEY = "web-mountain:sound"

function readPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "on"
  } catch {
    return false
  }
}

function writePreference(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off")
  } catch {
    // Storage can be blocked (private mode); sound still works for this visit
  }
}

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  // Brown-ish noise: a random walk sounds softer than white noise
  let last = 0
  for (let i = 0; i < data.length; i++) {
    last = (last + (Math.random() * 2 - 1) * 0.02) / 1.02
    data[i] = last * 3.5
  }
  return buffer
}

export class Ambience {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private birdTimer = 0
  private wanted = readPreference()

  get enabled() {
    return this.wanted
  }

  /** Browsers only allow audio after a user gesture, so call this from one */
  async setEnabled(on: boolean) {
    this.wanted = on
    writePreference(on)
    if (on) await this.start()
    else this.stop()
  }

  private async start() {
    if (!this.ctx) this.build()
    const ctx = this.ctx!
    await ctx.resume()
    this.master!.gain.setTargetAtTime(0.9, ctx.currentTime, 0.6)
    this.scheduleBird()
  }

  private stop() {
    if (!this.ctx || !this.master) return
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25)
    clearTimeout(this.birdTimer)
    const ctx = this.ctx
    setTimeout(() => !this.wanted && ctx.suspend(), 900)
  }

  private build() {
    const ctx = new AudioContext()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    // Wind: looping noise through a band-pass whose centre slowly drifts
    const wind = ctx.createBufferSource()
    wind.buffer = noiseBuffer(ctx, 6)
    wind.loop = true
    const band = ctx.createBiquadFilter()
    band.type = "bandpass"
    band.frequency.value = 420
    band.Q.value = 0.6
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.07
    const lfoDepth = ctx.createGain()
    lfoDepth.gain.value = 260
    lfo.connect(lfoDepth).connect(band.frequency)
    const windGain = ctx.createGain()
    windGain.gain.value = 0.22
    wind.connect(band).connect(windGain).connect(master)
    wind.start()
    lfo.start()

    this.ctx = ctx
    this.master = master
  }

  /** One bird call: a few quick chirps sweeping down in pitch */
  private chirp() {
    const ctx = this.ctx!
    const now = ctx.currentTime
    const notes = 2 + Math.floor(Math.random() * 4)
    const base = 2600 + Math.random() * 1600
    const pan = ctx.createStereoPanner()
    pan.pan.value = Math.random() * 1.6 - 0.8
    pan.connect(this.master!)
    for (let i = 0; i < notes; i++) {
      const t = now + i * (0.09 + Math.random() * 0.05)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(base * (1 + Math.random() * 0.15), t)
      osc.frequency.exponentialRampToValueAtTime(base * 0.62, t + 0.08)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.05, t + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
      osc.connect(gain).connect(pan)
      osc.start(t)
      osc.stop(t + 0.1)
    }
  }

  private scheduleBird() {
    clearTimeout(this.birdTimer)
    this.birdTimer = window.setTimeout(() => {
      if (!this.wanted) return
      this.chirp()
      this.scheduleBird()
    }, 2500 + Math.random() * 6000)
  }

  /** A soft rush of air, played when the camera flies somewhere */
  whoosh() {
    if (!this.wanted || !this.ctx || !this.master) return
    const ctx = this.ctx
    const now = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = noiseBuffer(ctx, 1.6)
    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"
    filter.Q.value = 1.4
    filter.frequency.setValueAtTime(300, now)
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.6)
    filter.frequency.exponentialRampToValueAtTime(400, now + 1.4)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.5, now + 0.35)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5)
    src.connect(filter).connect(gain).connect(this.master)
    src.start(now)
  }
}
