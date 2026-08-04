import { useEffect, useRef, useState } from 'react'
import { taDum } from '../utils/sound.js'

// Power-on / boot animation: rotating light rays, letter slam, sheen sweep,
// white flash, then a "portal" zoom out into the app. Click to skip.
export default function Boot ({ onDone }) {
  const [phase, setPhase] = useState('in')
  const done = useRef(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    setPhase('out')
    setTimeout(onDone, 650)
  }

  useEffect(() => {
    try { taDum(0.4) } catch { /* autoplay blocked — continue silently */ }
    const t = setTimeout(finish, 3000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const letter = (c, i, cls) => (
    <span key={cls + i} className={cls} style={{ '--d': `${i * 60}ms` }}>{c}</span>
  )

  return (
    <div className={`boot ph-${phase}`} onClick={finish} role="presentation">
      <div className="boot-rays" aria-hidden="true" />
      <div className="boot-horizon" aria-hidden="true" />
      <div className="boot-logo" aria-label="Series Hub">
        {'SERIES'.split('').map((c, i) => letter(c, i, 'r'))}
        <span className="boot-gap" aria-hidden="true" />
        {'HUB'.split('').map((c, i) => letter(c, i, 'b'))}
      </div>
      <div className="boot-sheen" aria-hidden="true" />
      <div className="boot-tag">
        <span>SERIES</span><i />
        <span>FILMS</span><i />
        <span>UNLIMITED</span>
      </div>
      <div className="boot-flash" aria-hidden="true" />
      <button className="boot-skip" onClick={finish}>Skip Intro</button>
    </div>
  )
}
