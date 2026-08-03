// Tiny WebAudio synth for the Series Hub "ta-dum" power-on sound.
// Fails silently if the browser blocks autoplay before a user gesture.

let ctx = null

function ac () {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) throw new Error('no audio')
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

export function taDum (volume = 0.5) {
  const a = ac()
  const t = a.currentTime + 0.05
  const master = a.createGain()
  master.gain.setValueAtTime(0.0001, t)
  master.gain.exponentialRampToValueAtTime(volume, t + 0.04)
  master.gain.exponentialRampToValueAtTime(0.0001, t + 1.9)
  master.connect(a.destination)

  // low "ta" — deep cinematic thump
  const o1 = a.createOscillator()
  o1.type = 'sine'
  o1.frequency.setValueAtTime(150, t)
  o1.frequency.exponentialRampToValueAtTime(46, t + 0.55)
  const g1 = a.createGain()
  g1.gain.setValueAtTime(0.9, t)
  g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.7)
  o1.connect(g1).connect(master)
  o1.start(t); o1.stop(t + 0.8)

  // noise sweep for the "whoosh"
  const len = a.sampleRate * 0.6
  const buf = a.createBuffer(1, len, a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const noise = a.createBufferSource(); noise.buffer = buf
  const nf = a.createBiquadFilter(); nf.type = 'bandpass'; nf.Q.value = 1.2
  nf.frequency.setValueAtTime(300, t)
  nf.frequency.exponentialRampToValueAtTime(3200, t + 0.45)
  const ng = a.createGain()
  ng.gain.setValueAtTime(0.25, t)
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
  noise.connect(nf).connect(ng).connect(master)
  noise.start(t)

  // bright "dum" — stacked perfect fifth, quick attack, long tail
  const t2 = t + 0.34
  ;[[220, 0.5], [330, 0.42], [440, 0.3], [660, 0.2], [880, 0.12]].forEach(([f, v]) => {
    const o = a.createOscillator(); o.type = 'sine'; o.frequency.value = f
    const g = a.createGain()
    g.gain.setValueAtTime(0.0001, t2)
    g.gain.exponentialRampToValueAtTime(v, t2 + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, t2 + 1.4)
    o.connect(g).connect(master)
    o.start(t2); o.stop(t2 + 1.6)
  })
}

export function chime (volume = 0.25) {
  const a = ac()
  const t = a.currentTime + 0.02
  const master = a.createGain()
  master.gain.setValueAtTime(volume, t)
  master.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
  master.connect(a.destination)
  ;[523.25, 659.25, 783.99].forEach((f, i) => {
    const o = a.createOscillator(); o.type = 'triangle'; o.frequency.value = f
    const g = a.createGain()
    const ts = t + i * 0.07
    g.gain.setValueAtTime(0.0001, ts)
    g.gain.exponentialRampToValueAtTime(0.4, ts + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ts + 0.5)
    o.connect(g).connect(master)
    o.start(ts); o.stop(ts + 0.6)
  })
}
