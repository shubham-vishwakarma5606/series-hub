import { useEffect, useMemo, useRef, useState } from 'react'
import { getDetails, pickTrailer, img, genreNames, normalize } from '../utils/tmdb.js'
import Logo from './Logo.jsx'

// Real-title details via TMDB + official trailer playback via YouTube embed.
export default function TmdbModal ({ sel, onClose, onPick }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)
  const [trailerKey, setTrailerKey] = useState(null)
  const boxRef = useRef(null)

  useEffect(() => {
    let live = true
    setData(null); setError(false); setTrailerKey(null)
    boxRef.current?.scrollTo({ top: 0 })
    getDetails(sel.type, sel.id)
      .then((d) => {
        if (!live) return
        setData(d)
        if (sel.trailer) {
          const tr = pickTrailer(d.videos)
          if (tr) setTrailerKey(tr.key)
        }
      })
      .catch(() => { if (live) setError(true) })
    return () => { live = false }
  }, [sel.type, sel.id, sel.trailer])

  // body lock + esc
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const esc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', esc) }
  }, [onClose])

  const d = data
  const type = sel.type
  const title = d?.title || d?.name || ''
  const year = (d?.release_date || d?.first_air_date || '').slice(0, 4)
  const runtime = type === 'movie' && d?.runtime ? `${Math.floor(d.runtime / 60)}h ${d.runtime % 60}m`
    : type === 'tv' && d?.number_of_seasons ? `${d.number_of_seasons} Season${d.number_of_seasons > 1 ? 's' : ''}` : null
  const genres = d?.genres?.map((g) => g.name) || genreNames(type, d?.genre_ids || [])
  const trailer = useMemo(() => (d ? pickTrailer(d.videos) : null), [d])
  const cast = d?.credits?.cast?.slice(0, 6).map((c) => c.name) || []
  const similar = useMemo(
    () => (d?.similar?.results || []).map((it) => normalize(it, type)).filter((it) => it.backdrop || it.poster).slice(0, 9),
    [d, type]
  )

  return (
    <div className="m-wrap" ref={boxRef} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title || 'Title details'}>
        <button className="m-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3z" transform="translate(1 1) scale(0.92)" /></svg>
        </button>

        <div className="m-hero" style={{ background: 'linear-gradient(125deg, #0d1420, #1c2c44)' }}>
          {!d && !error && <div className="spin" aria-label="Loading" />}
          {error && <p className="m-err">Couldn’t reach TMDB right now. Check your API key / connection.</p>}
          {d && trailerKey && (
            <iframe
              className="m-trailer"
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`${title} — trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          {d && !trailerKey && (
            <>
              {img(d.backdrop_path, 'w1280') && <img className="art-img" src={img(d.backdrop_path, 'w1280')} alt="" />}
              <div className="m-hero-fade" />
              <div className="m-titleblock">
                <span className="m-eyebrow"><Logo compact /><i>{type === 'tv' ? 'S E R I E S' : 'F I L M'}</i></span>
                <h2 className="m-title f-oswald">{title}</h2>
                <div className="m-actions">
                  {trailer
                    ? (
                      <button className="btn-play" onClick={() => setTrailerKey(trailer.key)}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 4l14 8-14 8z" /></svg>
                        <span>Play Trailer</span>
                      </button>
                      )
                    : <span className="m-notrailer">No official trailer available</span>}
                  {d.homepage && (
                    <a className="cbd big" href={d.homepage} target="_blank" rel="noreferrer" aria-label="Official site">
                      <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3h-7zM5 5h5v2H7v10h10v-3h2v5H5V5z"/></svg>
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {d && (
          <div className="m-body">
            <div className="m-grid">
              <div className="m-left">
                <div className="m-meta">
                  <span className="match">{Math.round((d.vote_average || 0) * 10)}% Match</span>
                  {year && <span className="dim">{year}</span>}
                  {runtime && <span>{runtime}</span>}
                  <span className="hd">HD</span>
                  {d.status && <span className="dim">· {d.status}</span>}
                </div>
                {d.tagline && <p className="m-tagline">“{d.tagline}”</p>}
                <p className="m-syn">{d.overview || 'No overview available.'}</p>
              </div>
              <div className="m-right">
                {cast.length > 0 && <p><i>Cast:</i> {cast.slice(0, 3).join(', ')}, <em>more</em></p>}
                {genres.length > 0 && <p><i>Genres:</i> {genres.join(', ')}</p>}
                {d.vote_count > 0 && <p><i>Votes:</i> {d.vote_count.toLocaleString('en-IN')}</p>}
                {d.original_language && <p><i>Original language:</i> {d.original_language.toUpperCase()}</p>}
              </div>
            </div>

            {similar.length > 0 && (
              <div className="m-mlt">
                <h3>More Like This</h3>
                <div className="mlt-grid">
                  {similar.map((s) => (
                    <button key={s.id} className="mlt" onClick={() => onPick({ type, id: s.id, trailer: false })} aria-label={s.title}>
                      <span className="mlt-art" style={{ '--c1': '#0d1420', '--c2': '#1c2c44' }}>
                        {img(s.backdrop, 'w300') || img(s.poster, 'w185')
                          ? <img className="art-img" src={img(s.backdrop, 'w300') || img(s.poster, 'w185')} alt="" loading="lazy" />
                          : <span className="mlt-title f-oswald">{s.title}</span>}
                      </span>
                      <span className="mlt-meta"><b className="match">{Math.round(s.vote * 10)}% Match</b><i>{s.year}</i></span>
                      <span className="mlt-syn">{s.overview}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <footer className="m-about">
              {cast.length > 0 && <p><i>Cast:</i> {cast.join(', ')}</p>}
              {genres.length > 0 && <p><i>Genres:</i> {genres.join(', ')}</p>}
              <p className="tmdb-attr">Metadata &amp; artwork via The Movie Database (TMDB). This product uses the TMDB API but is not endorsed or certified by TMDB. Trailer © its respective owners, embedded from YouTube.</p>
            </footer>
          </div>
        )}
      </div>
    </div>
  )
}
