import { useEffect, useMemo, useRef, useState } from 'react'
import { byId, moreLikeThis } from '../data/catalog.js'
import Logo from './Logo.jsx'

export default function Modal ({ showId, onClose, onPlay, hasInList, onToggleList, onPick, onToast }) {
  const show = byId[showId]
  const inThis = hasInList(show)
  const isSeries = show.type === 'series'
  const [tab, setTab] = useState(isSeries ? 'episodes' : 'similar')
  const [season, setSeason] = useState(1)
  const [liked, setLiked] = useState(false)
  const boxRef = useRef(null)

  useEffect(() => {
    setTab(byId[showId].type === 'series' ? 'episodes' : 'similar')
    setSeason(1)
    boxRef.current?.scrollTo({ top: 0 })
  }, [showId])

  // lock body scroll + close on Escape
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const esc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', esc) }
  }, [onClose])

  const similar = useMemo(() => moreLikeThis(show), [show])
  const seasons = Math.max(1, show.seasons || 1)

  if (!show) return null

  const eps = show.episodes || []
  const tabs = [
    ...(isSeries ? [['episodes', 'Episodes']] : []),
    ['similar', 'More Like This'],
    ['trailers', 'Trailers & More']
  ]

  return (
    <div className="m-wrap" ref={boxRef} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={show.title}>
        <button className="m-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3z" transform="translate(1 1) scale(0.92)"/></svg>
        </button>

        <div
          className="m-hero"
          style={show.backdrop
            ? { backgroundImage: `url(${show.backdrop})` }
            : { background: `linear-gradient(125deg, ${show.palette[0]}, ${show.palette[1]})` }}
        >
          <div className="m-hero-fade" />
          <div className="m-titleblock">
            <span className="m-eyebrow"><Logo compact /><i>{isSeries ? 'S E R I E S' : 'F I L M'}</i></span>
            <h2 className={`m-title f-${show.font || 'bebas'}`}>{show.title}</h2>
            <div className="m-actions">
              <button className="btn-play" onClick={() => onPlay(show)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 4l14 8-14 8z"/></svg>
                <span>Play</span>
              </button>
              <button className={`cbd big${inThis ? ' ok' : ''}`} aria-label="Toggle My List" onClick={() => onToggleList(show)}>
                {inThis
                  ? <svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
                  : <svg viewBox="0 0 24 24"><path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z"/></svg>}
              </button>
              <button className={`cbd big${liked ? ' ok' : ''}`} aria-label="Rate thumbs up" onClick={() => { setLiked((v) => !v); onToast(liked ? 'Rating removed' : 'Rated: Loved it') }}>
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 20h2V9H2v11zm20-9a2 2 0 0 0-2-2h-6.3l.95-4.57.03-.32a1.5 1.5 0 0 0-.44-1.06L13.17 2 6.59 8.59A2 2 0 0 0 6 10v9a2 2 0 0 0 2 2h7.8a2 2 0 0 0 1.84-1.23l3-7.09c.1-.22.16-.46.16-.68v-1z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="m-body">
          <div className="m-grid">
            <div className="m-left">
              <div className="m-meta">
                <span className="match">{show.match}% Match</span>
                <span className="dim">{show.year}</span>
                <span>{show.len}</span>
                <span className="hd">HD</span>
                {show.comingSoon && <span className="m-soon">Coming {show.comingSoon}</span>}
              </div>
              <div className="m-age">
                <span className="agebox">{show.age}</span>
                <span className="dim">{show.advisory}</span>
                <span className="chip4k">4K Ultra HD</span>
              </div>
              <p className="m-syn">{show.syn}</p>
            </div>
            <div className="m-right">
              <p><i>Cast:</i> {show.cast.slice(0, 3).join(', ')}, <em>more</em></p>
              <p><i>Genres:</i> {show.genres.join(', ')}</p>
              <p><i>This {isSeries ? 'show' : 'film'} is:</i> {show.flavor}</p>
              <p><i>Maturity rating:</i> <span className="agebox sm">{show.age}</span> {show.advisory}</p>
            </div>
          </div>

          <nav className="m-tabs" aria-label="More about this title">
            {tabs.map(([k, label]) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
            ))}
          </nav>

          {tab === 'episodes' && isSeries && (
            <div className="m-eps">
              <div className="m-eps-head">
                <h3>Episodes</h3>
                <label className="m-season">
                  Season&nbsp;
                  <select value={season} onChange={(e) => setSeason(Number(e.target.value))}>
                    {Array.from({ length: seasons }, (_, i) => <option key={i + 1} value={i + 1}>Season {i + 1}</option>)}
                  </select>
                </label>
              </div>
              <ol>
                {eps.map((ep, ix) => (
                  <li key={ep.n}>
                    <button className="ep" onClick={() => onPlay(show, ix)}>
                      <span className="ep-n">{ep.n}</span>
                      <span className="ep-thumb" style={{ '--c1': show.palette[0], '--c2': show.palette[1], '--r': `${((ix * 37) % 40) - 20}deg` }}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l13-7.5z"/></svg>
                      </span>
                      <span className="ep-txt">
                        <span className="ep-top"><b>{ep.title}</b><i>{ep.dur}</i></span>
                        <span className="ep-syn">{ep.syn}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {tab === 'similar' && (
            <div className="m-mlt">
              <h3>More Like This</h3>
              <div className="mlt-grid">
                {similar.map((s) => (
                  <button key={s.id} className="mlt" onClick={() => onPick(s.id)} aria-label={s.title}>
                    <span className="mlt-art" style={{ '--c1': s.palette[0], '--c2': s.palette[1] }}>
                      <span className={`mlt-title f-${s.font || 'bebas'}`}>{s.title}</span>
                      <span className="mlt-add" onClick={(e) => { e.stopPropagation(); onToggleList(s) }} aria-label="Add to My List">
                        {hasInList(s)
                          ? <svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
                          : <svg viewBox="0 0 24 24"><path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z"/></svg>}
                      </span>
                    </span>
                    <span className="mlt-meta"><b className="match">{s.match}% Match</b><span className="agebox sm">{s.age}</span><i>{s.len}</i></span>
                    <span className="mlt-syn">{s.syn}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'trailers' && (
            <div className="m-trailers">
              <h3>Trailers & More</h3>
              <div className="mlt-grid">
                {['Official Trailer', isSeries ? 'Season 1 Recap' : 'Behind the Scenes', 'The Look: Visual World'].map((t, ix) => (
                  <button key={t} className="mlt trailer" onClick={() => onPlay(show, 0)}>
                    <span className="mlt-art" style={{ '--c1': show.palette[0], '--c2': show.palette[1], '--r': `${ix * 25 - 20}deg` }}>
                      <span className="mlt-title f-oswald">{show.title}</span>
                      <span className="mlt-play"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 4.5v15l13-7.5z"/></svg></span>
                    </span>
                    <span className="mlt-meta"><b>{t}</b><i>{['2:14', '4:48', '3:32'][ix]}</i></span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <footer className="m-about">
            <h4>About <b>{show.title}</b></h4>
            {isSeries && <p><i>Created by:</i> {show.creator}</p>}
            <p><i>Cast:</i> {show.cast.join(', ')}</p>
            <p><i>Genres:</i> {show.genres.join(', ')}</p>
            <p><i>This {isSeries ? 'show' : 'film'} is:</i> {show.flavor}</p>
            <p><i>Maturity rating:</i> <span className="agebox sm">{show.age}</span> — {show.advisory}. Recommended for ages {show.age.includes('MA') || show.age === 'R' ? '17' : '13'} and up.</p>
          </footer>
        </div>
      </div>
    </div>
  )
}
