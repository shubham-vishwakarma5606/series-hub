// TVDB v4 integration template (requires user-provided API key + PIN)
// Source: https://thetvdb.com/
// Usage: export const TVDB_KEY = import.meta.env.VITE_TVDB_API_KEY || 'your-tvdb-v4-token'

const KEY = import.meta.env.VITE_TVDB_API_KEY || ''
export const TVDB_ENABLED = Boolean(KEY)

export async function fetchTvdb (idOrName, type = 'series') {
  if (!TVDB_ENABLED) return null
  // TVDB v4 endpoint requires: /search?query=NAME or /series/{id}
  const url = `https://api.thetvdb.com/v4/${type === 'series' ? 'series' : 'movies'}/${encodeURIComponent(idOrName || '')}`
  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${KEY}`, 'Accept': 'application/json' }
    })
    if (!res.ok) return null
    const data = await res.json()
    return {
      id: data.data?.id || idOrName,
      title: data.data?.name || 'Untitled',
      year: data.data?.year ? String(data.data.year) : '',
      type: type,
      genres: (data.data?.genres || []).map((g) => g.name || String(g)).filter(Boolean),
      plot: data.data?.overview || '',
      poster: data.data?.image ? `https://artworks.thetvdb.com${data.data.image}` : null,
      rating: data.data?.rating ? Number(data.data.rating) : 0,
      network: data.data?.network || ''
    }
  } catch (e) {
    console.error('TVDB fetch error:', e)
    return null
  }
}
