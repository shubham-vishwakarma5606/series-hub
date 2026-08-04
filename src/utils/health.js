// Stream health — availability probes (green/yellow/red) for the Network
// Status screen, plus the shared vocabulary the player's live LED uses.
//
// Traffic-light semantics:
//   green  ok    — reachable fast (<1.8s) / playing smoothly
//   yellow slow  — reachable but sluggish, or buffering during playback
//   red    down  — unreachable / playback error

export const LAT_OK = 1800

// Probes a media URL without downloading the body:
//  - file streams  → HTTP Range request for the first bytes
//  - HLS playlists → GET (playlists are tiny text)
export async function probeStream (url, kind = 'file', timeoutMs = 6000) {
  if (!url) return { state: 'down' }
  const ctrl = new AbortController()
  const kill = setTimeout(() => ctrl.abort(), timeoutMs)
  const t0 = performance.now()
  try {
    const init = { cache: 'no-store', signal: ctrl.signal }
    if (kind !== 'hls') init.headers = { Range: 'bytes=0-2047' }
    const r = await fetch(url, init)
    const ms = Math.round(performance.now() - t0)
    if (!r.ok && r.status !== 206) return { state: 'down', ms, code: r.status }
    try { await r.arrayBuffer().then((b) => b.byteLength) } catch { /* body optional */ }
    return { state: ms < LAT_OK ? 'ok' : 'slow', ms }
  } catch (e) {
    const ms = Math.round(performance.now() - t0)
    if (e?.name === 'AbortError') return { state: 'down', ms, code: 'timeout' }
    // A CORS rejection means the host is reachable but not stream-readable —
    // that would fail in the player too, so it counts as down with a hint.
    return { state: 'down', ms, code: 'network/cors' }
  } finally { clearTimeout(kill) }
}

export const STATE_META = {
  ok: { label: 'Operational', color: '#46d369' },
  slow: { label: 'Degraded', color: '#f6c445' },
  down: { label: 'Down', color: '#e50914' },
  checking: { label: 'Checking…', color: '#8d99ae' },
  idle: { label: 'Idle', color: '#5a6478' }
}
