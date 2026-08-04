// Validation for the "Upload Licensed Titles" library manager.
// Accepts a JSON array (or single object) of titles pointing at streams/files
// the user is licensed to host. Valid entries merge into the catalogue via
// localStorage key `sh.custom` (read by src/data/catalog.js at boot).

export const LIBRARY_SAMPLE = {
  id: 'my-indie-film',
  type: 'film',
  title: 'My Licensed Indie Film',
  year: 2026,
  age: 'TV-14',
  durMin: 96,
  genres: ['Drama'],
  syn: 'A short line about your title.',
  videoUrl: 'https://cdn.example.com/your-licensed/master.m3u8'
}

function isUrl (u) {
  return typeof u === 'string' && /^(https?:\/\/|\/videos\/)/i.test(u)
}

export function validateLibraryJSON (text) {
  let data
  try {
    data = JSON.parse(text)
  } catch (e) {
    return { ok: [], errors: [`Not valid JSON — ${e.message}`] }
  }
  const arr = Array.isArray(data) ? data : [data]
  const ok = []
  const errors = []
  const seen = new Set()

  arr.forEach((j, i) => {
    const at = `Entry ${i + 1}${j && j.id ? ` (${j.id})` : ''}`
    if (!j || typeof j !== 'object' || Array.isArray(j)) { errors.push(`${at}: must be an object`); return }
    if (!j.id || !/^[\w-]+$/.test(j.id)) { errors.push(`${at}: "id" is required, kebab/words only`); return }
    if (seen.has(j.id)) { errors.push(`${at}: duplicate id`); return }
    seen.add(j.id)
    if (!j.title || typeof j.title !== 'string') { errors.push(`${at}: "title" is required`); return }
    if (j.type && !['series', 'film'].includes(j.type)) { errors.push(`${at}: "type" must be "series" or "film"`); return }
    if (j.type === 'series' && j.seasons && !Number.isFinite(Number(j.seasons))) { errors.push(`${at}: "seasons" must be a number`); return }
    if (j.age && !['TV-MA', 'TV-14', 'TV-PG', 'PG-13', 'R'].includes(j.age)) { errors.push(`${at}: unknown age rating "${j.age}"`); return }
    if (j.genres && (!Array.isArray(j.genres) || j.genres.some((g) => typeof g !== 'string'))) { errors.push(`${at}: "genres" must be an array of strings`); return }
    if (j.videoUrl && !isUrl(j.videoUrl)) { errors.push(`${at}: "videoUrl" must start with http(s):// or /videos/`); return }
    if (j.episodeVideos && (!Array.isArray(j.episodeVideos) || j.episodeVideos.some((u) => !isUrl(u)))) {
      errors.push(`${at}: "episodeVideos" must be an array of stream URLs`); return
    }
    if (!j.videoUrl && !j.episodeVideos) { errors.push(`${at}: no stream configured — it will show a simulated preview (that's fine, just a heads-up)`); }
    ok.push(j)
  })

  return { ok, errors }
}
