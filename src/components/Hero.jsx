import { useEffect, useState } from 'react'
import Logo from './Logo.jsx'

// Rotating billboard with a crossfading backdrop, Netflix-style metadata
// column, action buttons and a right-edge maturity box.
export default function Hero ({ items, onPlay, onInfo }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 9000)
    return () => clearInterval(id)
  }, [items.length, paused])

  const show = items[i]

  return (
    <section className="hero" aria-label={`Featured: ${show.title}`}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {items.map((s, ix) => (
        <div
          key={s.id}
          className={`hero-bg${ix === i ? ' on' : ''}`}
          style={s.backdrop
            ? { backgroundImage: `url(${s.backdrop})` }
            : { background: `linear-gradient(120deg, ${s.palette[0]}, ${s.palette[1]})` }}
          aria-hidden="true"
        />
      ))}
      <div className="hero-vig" aria-hidden="true" />
      <div className="hero-fade" aria-hidden="true" />

      <div className="hero-in" key={show.id}>
        <div className="hero-eyebrow">
          <Logo compact />
          <span>{show.type === 'series' ? 'S E R I E S' : 'F I L M'}</span>
        </div>
        <h1 className={`hero-title f-${show.font || 'bebas'}`}>
          {show.title.split('').map((c, ix) => (
            <span key={ix} style={{ '--d': `${ix * 45}ms` }}>{c === ' ' ? '\u00A0' : c}</span>
          ))}
        </h1>
        {show.rank && <p className="hero-rank"><b>{show.rank}</b> this week</p>}
        <div className="hero-meta">
          <span className="match">{show.match}% Match</span>
          <span>{show.year}</span>
          <span className="age">{show.age}</span>
          <span>{show.len}</span>
          <span className="hd">HD</span>
        </div>
        <p className="hero-syn">{show.syn}</p>
        <div className="hero-btns">
          <button className="btn-play" onClick={() => onPlay(show)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 4l14 8-14 8z"/></svg>
            <span>Play</span>
          </button>
          <button className="btn-info" onClick={() => onInfo(show)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11 9h2V7h-2v2zm0 8h2v-6h-2v6zm1-15a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/></svg>
            <span>More Info</span>
          </button>
        </div>
      </div>

      <div className="hero-agebox">{show.age}</div>
      <div className="hero-dots" aria-hidden="true">
        {items.map((s, ix) => (
          <button key={s.id} className={ix === i ? 'on' : ''} onClick={() => setI(ix)} aria-label={`Feature ${s.title}`} />
        ))}
      </div>
    </section>
  )
}
