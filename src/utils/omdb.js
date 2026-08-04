// OMDB integration using the user-provided API key (7a414862).
// Fetches movie/series metadata by IMDb ID (i=tt...) or title (t=...).

const KEY = '7a414862'
const BASE = 'http://www.omdbapi.com/'

export async function fetchOmdb (query, by = 'i') {
  const url = `${BASE}?apikey=${KEY}&${by}=${encodeURIComponent(query)}&type=movie`
  try {
    const res = await fetch(url)
    const data = await res.json()
    if (data.Response === 'True') {
      return {
        id: data.imdbID || data.Title,
        title: data.Title || 'Untitled',
        year: data.Year ? String(data.Year) : '',
        type: data.Type === 'series' ? 'series' : 'movie',
        genres: (data.Genre || '').split(',').map((g) => g.trim()).filter(Boolean),
        plot: data.Plot || '',
        poster: data.Poster !== 'N/A' ? data.Poster : null,
        imdbRating: data.imdbRating ? parseFloat(data.imdbRating) : 0,
        runtime: data.Runtime || '',
        director: data.Director || '',
        actors: data.Actors || ''
      }
    }
    return null
  } catch (e) {
    console.error('OMDB fetch error:', e)
    return null
  }
}

// Fetch a specific IMDb ID (e.g., tt3896198)
export async function getOmdbById (imdbId) {
  return fetchOmdb(imdbId, 'i')
}

// Fetch by title (best effort)
export async function getOmdbByTitle (title) {
  return fetchOmdb(title, 't')
}
