// Streaming channel registry — every playable source becomes a "channel" with
// a live status light on the Network Status screen and in the player.
//
// LEGAL-SOURCES-ONLY policy: a channel must point at a DIRECT media URL
// (.m3u8 / .mpd / .mp4 / .webm) hosted by you, your CDN, or an openly
// licensed source. Embed/iframe providers are rejected by validateChannel —
// Series Hub never hot-links unofficial third-party players.
//
// Link your own streaming API with env var VITE_STREAM_API_URL — a GET that
// returns JSON: [{ "name": "Channel 4", "url": "https://cdn.you.com/x.m3u8",
// "cat": "Movies", "showId": "neon-district" }]  (or { "channels": [...] })

import { byId } from './catalog.js'

export const STREAM_API_URL = import.meta.env.VITE_STREAM_API_URL || ''

// Built-in channels: the catalogue's verified open-license streams (CC-BY).
const BUILTIN_IDS = ['big-buck-bunny', 'tears-of-steel', 'elephants-dream']
const CHAN_NAMES = [
  ['Channel 1', 'Animation · Toon Time'],
  ['Channel 2', 'Sci-Fi · Steel Cinema'],
  ['Channel 3', 'Fantasy · Dream Machine']
]

const kindOf = (src = '') => (/\.m3u8($|\?)/.test(src) ? 'hls' : /\.(mp4|webm|mov|m4v)($|\?)/.test(src) ? 'file' : /\.mpd($|\?)/.test(src) ? 'dash' : 'file')

export function builtinChannels () {
  return BUILTIN_IDS.map((id, i) => {
    const s = byId[id]
    return s?.videoUrl
      ? {
          id: `ch-${i + 1}`,
          name: CHAN_NAMES[i][0],
          tagline: CHAN_NAMES[i][1],
          cat: s.genres[0],
          showId: id,
          url: s.videoUrl,
          kind: kindOf(s.videoUrl),
          origin: 'built-in'
        }
      : null
  }).filter(Boolean)
}

// Licensed titles uploaded via the Library Manager join as extra channels.
export function libraryChannels () {
  let idx = 0
  return Object.values(byId)
    .filter((s) => s.custom && s.videoUrl)
    .map((s) => ({
      id: `ch-lib-${++idx}`,
      name: `Channel ${BUILTIN_IDS.length + idx}`,
      tagline: 'Your licensed library',
      cat: s.genres[0],
      showId: s.id,
      url: s.videoUrl,
      kind: kindOf(s.videoUrl),
      origin: 'library'
    }))
}

const MEDIA_OK = /^https?:\/\/.+\.(m3u8|mpd|mp4|webm|mov|m4v)(\?.*)?$/i
const EMBED_BAD = /\/embed\/|iframe|player\.php|\/e\/|\/v\/\d+$/i

export function validateChannel (raw, idx) {
  const name = typeof raw?.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 60) : `Channel ${idx}`
  const url = typeof raw?.url === 'string' ? raw.url.trim() : ''
  if (!MEDIA_OK.test(url) || EMBED_BAD.test(url)) return { error: `${name}: not a direct media URL (.m3u8/.mpd/.mp4/.webm) — embed/iframe providers are not allowed` }
  const showId = typeof raw?.showId === 'string' && byId[raw.showId] ? raw.showId : null
  return {
    channel: {
      id: `ch-api-${idx}`,
      name: name.toLowerCase().startsWith('channel') ? name : `Channel · ${name}`,
      tagline: 'Stream API',
      cat: typeof raw?.cat === 'string' ? raw.cat.slice(0, 24) : 'API',
      showId,
      url,
      kind: kindOf(url),
      origin: 'api'
    }
  }
}

// Fetch + validate channels from the configured streaming API endpoint.
export async function fetchApiChannels (endpoint = STREAM_API_URL, timeoutMs = 8000) {
  if (!endpoint) return { configured: false, channels: [] }
  const ctrl = new AbortController()
  const kill = setTimeout(() => ctrl.abort(), timeoutMs)
  const t0 = performance.now()
  try {
    const r = await fetch(endpoint, { cache: 'no-store', signal: ctrl.signal, headers: { accept: 'application/json' } })
    if (!r.ok) return { configured: true, channels: [], error: `HTTP ${r.status}` }
    const json = await r.json()
    const list = Array.isArray(json) ? json : json?.channels
    if (!Array.isArray(list)) return { configured: true, channels: [], error: 'API must return a JSON array or { channels: [...] }' }
    const channels = []; const errors = []
    list.slice(0, 24).forEach((raw, i) => {
      const v = validateChannel(raw, i + 100)
      if (v.channel) channels.push(v.channel)
      else errors.push(v.error)
    })
    return { configured: true, channels, errors, ms: Math.round(performance.now() - t0) }
  } catch (e) {
    return { configured: true, channels: [], error: e?.name === 'AbortError' ? 'timed out' : String(e?.message || e) }
  } finally { clearTimeout(kill) }
}

export function allChannels (api = []) {
  return [...builtinChannels(), ...libraryChannels(), ...api]
}

export function findChannelByUrl (url) {
  if (!url) return null
  return [...builtinChannels(), ...libraryChannels()].find((c) => c.url === url) || null
}
