// Optional TMDB integration (legal metadata + artwork + official trailers).
// Enabled when VITE_TMDB_API_KEY is set (see .env.example).
// This product uses the TMDB API but is not endorsed or certified by TMDB.

const KEY = import.meta.env.VITE_TMDB_API_KEY
export const TMDB_ENABLED = Boolean(KEY)

const BASE = 'https://api.themoviedb.org/3'
export const img = (path, size = 'w500') => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null)

const TTL = 10 * 60 * 1000

async function req (path) {
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}api_key=${KEY}&language=en-US`
  const ck = 'tmdb:' + url
  try {
    const hit = JSON.parse(sessionStorage.getItem(ck))
    if (hit && Date.now() - hit.at < TTL) return hit.data
  } catch { /* storage unavailable */ }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TMDB responded ${res.status}`)
  const data = await res.json()
  try { sessionStorage.setItem(ck, JSON.stringify({ at: Date.now(), data })) } catch { /* full */ }
  return data
}

const GENRES = {
  movie: { 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller', 10752: 'War', 37: 'Western' },
  tv: { 10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family', 10762: 'Kids', 9648: 'Mystery', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics', 37: 'Western' }
}

export const genreNames = (type, ids = []) => ids.map((id) => (GENRES[type] || {})[id]).filter(Boolean)

export function normalize (it, fallbackType) {
  const type = it.media_type === 'tv' ? 'tv' : it.media_type === 'movie' ? 'movie' : fallbackType
  return {
    id: it.id,
    type,
    title: it.title || it.name || 'Untitled',
    year: (it.release_date || it.first_air_date || '').slice(0, 4),
    vote: it.vote_average || 0,
    overview: it.overview || '',
    poster: it.poster_path || null,
    backdrop: it.backdrop_path || null,
    genreIds: it.genre_ids || []
  }
}

const SHELVES = {
  trendMovies: ['/trending/movie/week', 'movie'],
  trendTv: ['/trending/tv/week', 'tv'],
  popMovies: ['/movie/popular', 'movie'],
  popTv: ['/tv/popular', 'tv'],
  cinemas: ['/movie/now_playing', 'movie'],
  onAir: ['/tv/on_the_air', 'tv']
}

export async function getShelf (kind) {
  const [path, type] = SHELVES[kind]
  const data = await req(path)
  return (data.results || [])
    .map((it) => normalize(it, type))
    .filter((it) => type && it.title && (it.backdrop || it.poster))
    .slice(0, 14)
}

export function getDetails (type, id) {
  return req(`/${type}/${id}?append_to_response=videos,credits,similar`)
}

export function pickTrailer (videos) {
  const yt = ((videos && videos.results) || []).filter((v) => v.site === 'YouTube')
  const score = (v) => (v.type === 'Trailer' ? 0 : v.type === 'Teaser' ? 1 : 2) - (v.official ? 0.5 : 0)
  yt.sort((a, b) => score(a) - score(b))
  return yt[0] || null
}
