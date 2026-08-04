// Data integrity check for the catalogue (runs directly with node).
import { SHOWS, ROWS, FEATURED, byId, moreLikeThis, searchCatalog } from '../src/data/catalog.js'

let errors = 0
const bad = (msg) => { errors++; console.error('FAIL', msg) }

// unique ids
const ids = new Set()
for (const s of SHOWS) {
  if (ids.has(s.id)) bad(`duplicate id ${s.id}`)
  ids.add(s.id)
  if (!Array.isArray(s.palette) || s.palette.length !== 2) bad(`${s.id} bad palette`)
  if (!s.title || !s.syn || !s.genres?.length) bad(`${s.id} missing fields`)
  if (s.type === 'series' && (!Array.isArray(s.episodes) || s.episodes.length < 4)) bad(`${s.id} episodes missing`)
  if (s.type === 'film' && !s.durMin) bad(`${s.id} film without duration`)
  if (s.videoUrl !== undefined && typeof s.videoUrl !== 'string') bad(`${s.id} videoUrl must be a string`)
  if (s.episodeVideos !== undefined && (!Array.isArray(s.episodeVideos) || s.episodeVideos.some((u) => typeof u !== 'string'))) {
    bad(`${s.id} episodeVideos must be an array of url strings`)
  }
  if (s.backdrop && !s.backdrop.startsWith('/backdrops/')) bad(`${s.id} backdrop path looks wrong`)
}

// rows reference real ids, non-empty, no dupes inside a row
for (const [tab, rows] of Object.entries(ROWS)) {
  if (!rows.length) bad(`tab ${tab} has no rows`)
  for (const r of rows) {
    if (!r.items.length) bad(`${tab}/${r.key} empty row`)
    const seen = new Set()
    for (const s of r.items) {
      if (seen.has(s.id)) bad(`${tab}/${r.key} duplicate ${s.id}`)
      seen.add(s.id)
    }
  }
}

if (FEATURED.length !== 3 || FEATURED.some((f) => !f.backdrop)) bad('featured lineup incomplete')
if (moreLikeThis(byId['neon-district']).length !== 9) bad('moreLikeThis broken')
if (!searchCatalog('neon').length) bad('searchCatalog broken')
if (searchCatalog('crime').length < 5) bad('genre search weak')

console.log(errors ? `${errors} data problem(s) found` : `Data OK — ${SHOWS.length} titles, ${Object.keys(ROWS).length} browse tabs.`)
process.exit(errors ? 1 : 0)
