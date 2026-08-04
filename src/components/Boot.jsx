import { useCallback, useEffect, useRef, useState } from 'react'
import { taDum } from '../utils/sound.js'

// Power-on / boot animation: rotating light rays, letter slam, sheen sweep,
// white flash, then a "portal" zoom out into the app. Click to skip.
// This component is the guaranteed landing — App starts with screen='boot',
// and index.html also has a static .boot-static fallback for first paint.
export default function Boot ({ onDone }) {
  const [phase, setPhase] = useState('in')
  const done = useRef(false)
  const outTimer = useRef(null)
  const autoTimer = useRef(null)

  const finish = useCallback(() => {
    if (done.current) return
    done.current = true
    setPhase('out')
    // clear the auto timer if we were skipped early
    if (autoTimer.current) {
      clearTimeout(autoTimer.current)
      autoTimer.current = null
    }
    outTimer.current = setTimeout(() => {
      try { onDone?.() } catch {}
    }, 650)
  }, [onDone])

  useEffect(() => {
    // sound is best-effort — never block the boot animation
    try { taDum(0.4) } catch { /* autoplay blocked — continue silently */ }

    // auto-advance after 3s, plus a hard safety at 4.2s
    autoTimer.current = setTimeout(finish, 3000)
    const safety = setTimeout(finish, 4200)

    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        finish()
      }
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      if (autoTimer.current) clearTimeout(autoTimer.current)
      if (outTimer.current) clearTimeout(outTimer.current)
      clearTimeout(safety)
    }
  }, [finish])

  const letter = (c, i, cls) => (
    <span key={cls + i} className={cls} style={{ '--d': `${i * 60}ms` }}>{c}</span>
  )

  return (
    <div className={`boot ph-${phase}`} onClick={finish} role="presentation" aria-label="Series Hub boot animation">
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
      <button className="boot-skip" onClick={(e) => { e.stopPropagation(); finish() }}>Skip Intro</button>
    </div>
  )
}
