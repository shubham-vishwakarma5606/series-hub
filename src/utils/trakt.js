// Trakt.tv integration template (requires user-provided Client ID + Client Secret)
// Source: https://trakt.tv/
// Usage: set VITE_TRAKT_CLIENT_ID and VITE_TRAKT_CLIENT_SECRET in .env.local

const CLIENT_ID = import.meta.env.VITE_TRAKT_CLIENT_ID || ''
const CLIENT_SECRET = import.meta.env.VITE_TRAKT_CLIENT_SECRET || ''
export const TRAKT_ENABLED = Boolean(CLIENT_ID)

export async function fetchTrakt (query, by = 'movie') {
  if (!TRAKT_ENABLED) return null
  const endpoint = `https://api.trakt.tv/search/${by === 'movie' ? 'movie' : 'show'}?query=${encodeURIComponent(query)}`
  try {
    const res = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': CLIENT_ID
      }
    })
    if (!res.ok) return null
    const data = await res.json()
    const first = (data || []).find((item) => item[type] && item[type][by] && item[type][by].ids)
    if (!first) return null
    const info = first[type][by]
    return {
      id: info.ids?.trakt || info.ids?.imdb || info.ids?.slug || query,
      title: info.title || info.name || 'Untitled',
      year: info.year ? String(info.year) : '',
      type: by === 'movie' ? 'movie' : 'series',
      genres: (info.genres || []).filter(Boolean),
      plot: info.overview || '',
      poster: info.images ? (info.images.poster ? info.images.poster.full || info.images.poster.medium : null) : null,
      rating: info.rating ? Number(info.rating) : 0,
      tagline: info.tagline || ''
    }
  } catch (e) {
    console.error('Trakt fetch error:', e)
    return null
  }
}
