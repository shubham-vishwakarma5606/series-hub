import { useEffect, useRef, useState } from 'react'
import { TMDB_ENABLED, getShelf, img, genreNames } from '../utils/tmdb.js'

const DEFS = {
  home: [
    { k: 'trendMovies', title: 'Trending Films Worldwide' },
    { k: 'trendTv', title: 'Trending TV Worldwide' }
  ],
  films: [
    { k: 'trendMovies', title: 'Trending Films Worldwide' },
    { k: 'popMovies', title: 'Popular Films Worldwide' }
  ],
  series: [
    { k: 'trendTv', title: 'Trending TV Worldwide' },
    { k: 'popTv', title: 'Popular TV Worldwide' }
  ],
  fresh: [
    { k: 'cinemas', title: 'In Cinemas Right Now' },
    { k: 'onAir', title: 'On The Air This Week' }
  ]
}

export default function TmdbShelves ({ tab, onOpen }) {
  if (!TMDB_ENABLED) return null
  const defs = DEFS[tab] || DEFS.home
  return defs.map((d) => <Shelf key={d.k} def={d} onOpen={onOpen} />)
}

function Shelf ({ def, onOpen }) {
  const [items, setItems] = useState(null)
  const trackRef = useRef(null)

  useEffect(() => {
    let live = true
    getShelf(def.k)
      .then((list) => { if (live) setItems(list) })
      .catch(() => { if (live) setItems([]) })
    return () => { live = false }
  }, [def.k])

  const scrollByPages = (dir) => {
    const el = trackRef.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.92, behavior: 'smooth' })
  }

  if (items && items.length === 0) return null

  return (
    <section className="row v-land" aria-label={def.title}>
      <div className="row-head">
        <h2 className="row-title">{def.title}</h2>
        <span className="tmdb-tag">SOURCE: TMDB</span>
        <button className="row-explore" onClick={() => scrollByPages(1)} tabIndex={-1}>
          Explore All
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>

      <div className="row-viewport">
        <button className="row-arrow l" onClick={() => scrollByPages(-1)} aria-label="Scroll left">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M15 6l-6 6 6 6" /></svg>
        </button>

        <div className="row-track" ref={trackRef}>
          {items === null
            ? Array.from({ length: 7 }, (_, i) => <span key={i} className="card land skel" aria-hidden="true" />)
            : items.map((it) => <TmdbCard key={it.type + it.id} item={it} onOpen={onOpen} />)}
          <span className="row-pad" aria-hidden="true" />
        </div>

        <button className="row-arrow r" onClick={() => scrollByPages(1)} aria-label="Scroll right">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 6l6 6 6 6" /></svg>
        </button>
      </div>
    </section>
  )
}

export function TmdbCard ({ item, onOpen }) {
  const art = img(item.backdrop) || img(item.poster)
  const [imgOk, setImgOk] = useState(Boolean(art))
  const genres = genreNames(item.type, item.genreIds).slice(0, 3)

  return (
    <div
      className="card land tmdb"
      tabIndex={0}
      role="button"
      aria-label={`${item.title} — open details`}
      onClick={() => onOpen(item, false)}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(item, false) }}
    >
      <div className="card-art">
        {imgOk
          ? <img className="art-img" src={art} alt="" loading="lazy" onError={() => setImgOk(false)} />
          : <>
              <span className="art-fx at-glow" aria-hidden="true" />
              <span className="art-title f-oswald">{item.title}</span>
            </>}
        <span className="art-sheen" aria-hidden="true" />
      </div>

      <div className="card-info">
        <div className="ci-btns">
          <button className="cbd solid" aria-label={`Play trailer for ${item.title}`}
            onClick={(e) => { e.stopPropagation(); onOpen(item, true) }}>
            <svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z" /></svg>
          </button>
          <button className="cbd more" aria-label="More info"
            onClick={(e) => { e.stopPropagation(); onOpen(item, false) }}>
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 9l6 6 6-6H6z" /></svg>
          </button>
        </div>
        <div className="ci-meta">
          <span className="match">{Math.round(item.vote * 10)}% Match</span>
          {item.year && <span>{item.year}</span>}
          <span className="hd">{item.type === 'tv' ? 'TV' : 'FILM'}</span>
        </div>
        {genres.length > 0 && (
          <div className="ci-genres">
            {genres.map((g, ix) => <span key={g}>{g}{ix < genres.length - 1 && <i />}</span>)}
          </div>
        )}
      </div>
    </div>
  )
}
