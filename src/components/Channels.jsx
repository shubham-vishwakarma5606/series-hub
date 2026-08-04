import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { allChannels, fetchApiChannels, STREAM_API_URL } from '../data/streams.js'
import { probeStream, STATE_META } from '../utils/health.js'
import { byId } from '../data/catalog.js'

// ═══ NETWORK STATUS ═══ — every streaming source as a "channel" with
// traffic-light health: availability probes (ping) + live playback health
// reported by the player (buffering / errors / smooth playback).

const REFRESH_MS = 25000
const LIVE_FRESH = 20000

function Led ({ state, pulse = false }) {
  return <span className={`led ${state}${pulse ? ' pulse' : ''}`} aria-hidden="true" />
}

function strip (url = '') {
  try { const u = new URL(url); return u.host + u.pathname.slice(0, 34) + (u.pathname.length > 34 ? '…' : '') } catch { return url }
}

export default function Channels ({ live = {}, onPlay, onToast }) {
  const [api, setApi] = useState(null) // null = still loading
  const [probes, setProbes] = useState({})
  const [checking, setChecking] = useState(false)
  const aliveRef = useRef(true)
  useEffect(() => { aliveRef.current = true; return () => { aliveRef.current = false } }, [])

  // pull external stream-API channels once mounted
  useEffect(() => {
    if (!STREAM_API_URL) { setApi({ configured: false, channels: [] }); return undefined }
    let on = true
    fetchApiChannels().then((r) => { if (on) setApi(r) })
    return () => { on = false }
  }, [])

  const channels = useMemo(() => allChannels(api?.channels || []), [api])

  const checkAll = useCallback(async (list) => {
    setChecking(true)
    setProbes((p) => {
      const n = { ...p }
      for (const c of list) if (!n[c.id]) n[c.id] = { state: 'checking' }
      return n
    })
    await Promise.all(list.map(async (c) => {
      const r = await probeStream(c.url, c.kind)
      if (aliveRef.current) setProbes((p) => ({ ...p, [c.id]: { ...r, at: Date.now() } }))
    }))
    if (aliveRef.current) setChecking(false)
  }, [])

  useEffect(() => { if (api) checkAll(channels) }, [api, channels, checkAll])
  useEffect(() => {
    if (!api) return undefined
    const id = setInterval(() => checkAll(channels), REFRESH_MS)
    return () => clearInterval(id)
  }, [api, channels, checkAll])

  const counts = useMemo(() => {
    const n = { ok: 0, slow: 0, down: 0, checking: 0 }
    for (const c of channels) n[probes[c.id]?.state || 'checking'] = (n[probes[c.id]?.state || 'checking'] || 0) + 1
    return n
  }, [channels, probes])

  const overall = counts.down > 0 ? 'down' : counts.slow > 0 ? 'slow' : counts.checking > 0 ? 'checking' : 'ok'

  const liveState = (c) => {
    const l = live[c.id] || live[c.url]
    if (!l || Date.now() - l.at > LIVE_FRESH) return null
    return l
  }

  return (
    <main className="channels">
      <header className="ch-head">
        <div>
          <h1 className="ch-title">Network Status</h1>
          <p className="ch-sub">
            Live health of every streaming source — <b className={`dotword ${overall}`}>{STATE_META[overall].label}</b>
            {counts.ok > 0 && ` · ${counts.ok} green`}{counts.slow > 0 && ` · ${counts.slow} slow`}{counts.down > 0 && ` · ${counts.down} down`}
          </p>
        </div>
        <button className="btn-info ch-refresh" disabled={checking} onClick={() => checkAll(channels)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/></svg>
          <span>{checking ? 'Checking…' : 'Re-check now'}</span>
        </button>
      </header>

      <div className={`ch-api ${api?.error ? 'bad' : api?.configured ? 'ok' : 'neutral'}`}>
        <Led state={api == null ? 'checking' : api.error ? 'down' : api.configured ? 'ok' : 'idle'} />
        {api == null && <span>Linking streaming API…</span>}
        {api && !api.configured && (
          <span>Built-in open-license channels active. Link your own streaming API: set <code>VITE_STREAM_API_URL</code> to a JSON endpoint listing <code>{'[{ name, url }]'}'</code> — direct licensed streams only (no embed providers).</span>
        )}
        {api?.configured && !api.error && (
          <span>Stream API <b>connected</b>{typeof api.ms === 'number' ? ` in ${api.ms} ms` : ''} — {api.channels.length} channel{api.channels.length === 1 ? '' : 's'} linked{api.errors?.length ? ` (${api.errors.length} rejected: ${api.errors[0]})` : ''}</span>
        )}
        {api?.configured && api.error && <span>Stream API error — {api.error}. Built-in channels keep working.</span>}
      </div>

      <div className="ch-grid">
        {channels.map((c) => {
          const p = probes[c.id] || { state: 'checking' }
          const lv = liveState(c)
          const show = c.showId ? byId[c.showId] : null
          const meta = STATE_META[p.state] || STATE_META.checking
          return (
            <article key={c.id} className="ch-card">
              <div className="ch-art" style={show ? { '--c1': show.palette[0], '--c2': show.palette[1] } : undefined}>
                <span className="ch-art-name">{c.name.split('·')[0]}</span>
                <span className={`ch-kind ${c.kind}`}>{c.kind === 'hls' ? 'HLS LIVE' : c.kind.toUpperCase()}</span>
              </div>
              <div className="ch-body">
                <div className="ch-namerow">
                  <b>{c.name}</b>
                  <span className={`ch-origin ${c.origin}`}>{c.origin === 'api' ? 'API' : c.origin === 'library' ? 'Your library' : 'Built-in'}</span>
                </div>
                <p className="ch-tag">{c.tagline} · {c.cat}{show ? ` — ${show.title}` : ''}</p>
                <p className="ch-url" title={c.url}>{strip(c.url)}</p>

                <div className="ch-lights">
                  <div className="ch-light" title="Availability ping — can this source be reached right now?">
                    <Led state={p.state} pulse={p.state === 'checking'} />
                    <span className="ch-light-l">
                      <b style={{ color: meta.color }}>{meta.label}</b>
                      <i>{p.ms != null ? `${p.ms} ms ping` : p.code ? String(p.code) : 'ping…'}</i>
                    </span>
                  </div>
                  <div className="ch-light" title="Playback — how the stream performs while playing on this device">
                    <Led state={lv ? lv.state : 'idle'} pulse={lv?.state === 'slow'} />
                    <span className="ch-light-l">
                      <b style={{ color: lv ? STATE_META[lv.state].color : '#8d99ae' }}>
                        {lv ? (lv.state === 'ok' ? 'Playing smoothly' : lv.state === 'slow' ? 'Buffering' : 'Playback error') : 'Not playing'}
                      </b>
                      <i>{lv?.detail || (lv ? 'live' : 'start playback to measure')}</i>
                    </span>
                  </div>
                </div>

                <div className="ch-actions">
                  {show ? (
                    <button className="btn-play" onClick={() => onPlay(show.id)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l13-7.5z"/></svg>
                      <span>Play channel</span>
                    </button>
                  ) : (
                    <span className="ch-apionly">external source — add showId to enable in-app playback</span>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <p className="ch-note">
        🟢 reachable &amp; smooth · 🟡 slow to respond or buffering · 🔴 unreachable or playback error.
        Probes run every {Math.round(REFRESH_MS / 1000)}s using byte-range pings; playback lights update live from the player.
      </p>
    </main>
  )
}
