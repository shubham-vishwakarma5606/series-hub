import Logo from './Logo.jsx'

// Procedural "poster art" card: palette gradient + pattern + display title,
// with a Netflix-style expanding hover panel (actions, match, genres).
export default function Card ({ show, variant = 'land', onOpen, onPlay, inList, onToggleList, onRemind, reminded, onLike, liked }) {
  const artStyle = { '--c1': show.palette[0], '--c2': show.palette[1] }
  const newBadge = !show.comingSoon && show.year === 2026 && show.type === 'series'
  const lk = typeof liked === 'function' ? liked(show) : !!liked

  return (
    <div
      className={`card ${variant} at-${show.pattern} f-${show.font || 'bebas'}`}
      tabIndex={0}
      role="button"
      aria-label={`${show.title} — open details`}
      onClick={() => onOpen(show)}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(show) }}
    >
      <div className="card-art" style={artStyle}>
        {variant === 'original' && <span className="art-ribbon"><Logo compact /></span>}
        <span className="art-fx" aria-hidden="true" />
        <span className="art-kicker">{show.original ? 'A Series Hub Original' : show.genres[0]}</span>
        <span className="art-title">{show.title}</span>
        <span className="art-sub">{show.year} · {show.genres.slice(0, 2).join(' / ')}</span>
        {newBadge && <span className="art-badge">New Season</span>}
        {show.comingSoon && <span className="art-badge soon">Coming {show.comingSoon}</span>}
        <span className="art-sheen" aria-hidden="true" />
        {typeof show._pct === 'number' && (
          <span className="card-progress" aria-hidden="true">
            <i style={{ width: `${Math.min(100, Math.round(show._pct * 100))}%` }} />
          </span>
        )}
      </div>

      <div className="card-info">
        <div className="ci-btns">
          {show.comingSoon ? (
            <>
              <button
                className={`cbd ${reminded ? 'ok' : ''}`}
                aria-label={reminded ? 'Reminder set' : 'Remind me'}
                onClick={(e) => { e.stopPropagation(); onRemind(show) }}
              >
                {reminded
                  ? <svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
                  : <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 22a2.4 2.4 0 0 0 2.4-2.4H9.6A2.4 2.4 0 0 0 12 22zm7-6v-5c0-3.1-1.6-5.6-4.5-6.3V3.6a2.5 2.5 0 1 0-5 0v1.1C6.6 5.4 5 7.9 5 11v5l-2 2v1h18v-1l-2-2z"/></svg>}
              </button>
              <span className="ci-coming">{reminded ? 'Reminder set' : 'Remind Me'}</span>
            </>
          ) : (
            <>
              <button className="cbd solid" aria-label={`Play ${show.title}`}
                onClick={(e) => { e.stopPropagation(); onPlay(show, show._ep || 0, show._t || 0) }}>
                <svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg>
              </button>
              <button className={`cbd${inList ? ' ok' : ''}`} aria-label={inList ? 'Remove from My List' : 'Add to My List'}
                onClick={(e) => { e.stopPropagation(); onToggleList(show) }}>
                {inList
                  ? <svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
                  : <svg viewBox="0 0 24 24"><path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z"/></svg>}
              </button>
              <button className={`cbd${lk ? ' ok' : ''}`} aria-label="I like this"
                onClick={(e) => { e.stopPropagation(); onLike?.(show) }}>
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 20h2V9H2v11zm20-9a2 2 0 0 0-2-2h-6.3l.95-4.57.03-.32a1.5 1.5 0 0 0-.44-1.06L13.17 2 6.59 8.59A2 2 0 0 0 6 10v9a2 2 0 0 0 2 2h7.8a2 2 0 0 0 1.84-1.23l3-7.09c.1-.22.16-.46.16-.68v-1z"/></svg>
              </button>
            </>
          )}
          <button className="cbd more" aria-label="More info"
            onClick={(e) => { e.stopPropagation(); onOpen(show) }}>
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 9l6 6 6-6H6z"/></svg>
          </button>
        </div>
        <div className="ci-meta">
          <span className="match">{show.match}% Match</span>
          <span className="age">{show.age}</span>
          <span>{show.comingSoon ? show.comingSoon : show.len}</span>
          <span className="hd">HD</span>
        </div>
        <div className="ci-genres">
          {show.genres.map((g, ix) => <span key={g}>{g}{ix < show.genres.length - 1 && <i />}</span>)}
        </div>
      </div>
    </div>
  )
}
