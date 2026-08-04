// Series Hub service worker — artwork & font precaching.
// App data stays network-first; nothing else is intercepted.

const ART_CACHE = 'sh-art-v1'
const FONT_CACHE = 'sh-font-v1'

const isArtwork = (url) =>
  url.pathname.includes('/backdrops/') ||
  url.hostname === 'image.tmdb.org' ||
  url.hostname === 'img.youtube.com' ||
  url.hostname === 'i.ytimg.com'

const isFont = (url) =>
  url.hostname === 'fonts.gstatic.com' || url.hostname === 'fonts.googleapis.com'

self.addEventListener('install', (e) => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => ![ART_CACHE, FONT_CACHE].includes(k)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET') return

  // Cache-first for artwork (posters/backdrops) and fonts — immutable-ish assets
  if (isArtwork(url) || isFont(url)) {
    const cacheName = isFont(url) ? FONT_CACHE : ART_CACHE
    e.respondWith(
      caches.open(cacheName).then(async (cache) => {
        const hit = await cache.match(e.request)
        if (hit) {
          // refresh in background (stale-while-revalidate)
          fetch(e.request).then((res) => { if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res) }).catch(() => {})
          return hit
        }
        const res = await fetch(e.request)
        if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone())
        return res
      })
    )
  }
})
