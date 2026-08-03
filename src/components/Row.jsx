import { useRef } from 'react'
import Card from './Card.jsx'

// Horizontally scrolling shelf with big edge arrows (appear on hover).
export default function Row (props) {
  const { title, items, variant = 'land' } = props
  const trackRef = useRef(null)

  const scrollByPages = (dir) => {
    const el = trackRef.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.92, behavior: 'smooth' })
  }

  if (!items.length) return null

  return (
    <section className={`row v-${variant}`} aria-label={title}>
      <div className="row-head">
        <h2 className="row-title">{title}</h2>
        <button className="row-explore" onClick={() => scrollByPages(1)} tabIndex={-1}>
          Explore All
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 6l6 6-6 6"/></svg>
        </button>
      </div>

      <div className="row-viewport">
        <button className="row-arrow l" onClick={() => scrollByPages(-1)} aria-label="Scroll left">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M15 6l-6 6 6 6"/></svg>
        </button>

        <div className="row-track" ref={trackRef}>
          {variant === 'top10'
            ? items.map((s, i) => (
                <div className="t10" key={s.id}>
                  <span className="t10-num" aria-hidden="true">{i + 1}</span>
                  <Card show={s} variant="mini" {...props} />
                </div>
              ))
            : items.map((s) => <Card key={s.id} show={s} variant={variant} {...props} />)}
          <span className="row-pad" aria-hidden="true" />
        </div>

        <button className="row-arrow r" onClick={() => scrollByPages(1)} aria-label="Scroll right">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 6l6 6 6 6"/></svg>
        </button>
      </div>
    </section>
  )
}
