import { useEffect, useRef, useState } from 'react'
import { byId } from '../data/catalog.js'
import { findChannelByUrl } from '../data/streams.js'
import Logo from './Logo.jsx'
import { PARTY_SUPPORTED, makeRoomCode, joinParty, sendParty, leaveParty } from '../utils/party.js'

const fmt = (t) => {
  if (!Number.isFinite(t)) return '--:--'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const isHls = (u) => /\.m3u8($|\?)/i.test(u)

// Player with two modes:
//  • REAL — actual MP4/WebM/HLS playback (videoUrl / episodeVideos in catalog.js)
//           with hls.js track menus (audio / subtitles / quality) + PiP
//  • SIMULATED — marked cinematic preview when no stream is configured
// Both modes feed "Continue Watching" via onProgress and support resume (startAt).
export default function Player ({ showId, epIdx = 0, startAt = 0, partyJoin = null, onClose, onToast, onProgress, onHealth }) {
  const show = byId[showId]
  const isSeries = show.type === 'series'
  const [epN, setEpN] = useState(Math.min(epIdx, (show.episodes || []).length - 1))
  const ep = isSeries ? show.episodes[epN] : null

  const src = isSeries ? show.episodeVideos?.[epN] : show.videoUrl
  const real = Boolean(src)
  const fallbackDur = isSeries ? parseInt(ep.dur, 10) * 60 : (show.durMin || 100) * 60

  const [t, setT] = useState(0)
  const [dur, setDur] = useState(fallbackDur)
  const [bufPct, setBufPct] = useState(real ? 0 : 14)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(false)
  const [ctl, setCtl] = useState(true)
  const [drawer, setDrawer] = useState(false)
  const [endedReal, setEndedReal] = useState(false)

  const [subTr, setSubTr] = useState([]); const [selSub, setSelSub] = useState(-1)
  const [audTr, setAudTr] = useState([]); const [selAud, setSelAud] = useState(0)
  const [levels, setLevels] = useState([]); const [selQ, setSelQ] = useState(-1)
  const [speed, setSpeed] = useState(1)
  const [menu, setMenu] = useState(null)
  const [fs, setFs] = useState(false)
  const [flash, setFlash] = useState(null) // { side: 'l'|'r', k }

  const [partyCode, setPartyCode] = useState(null)
  const [partyPeers, setPartyPeers] = useState(1)
  const [partyInput, setPartyInput] = useState('')
  const [castAvail, setCastAvail] = useState(false)
  const [casting, setCasting] = useState(false)
  const [health, setHealth] = useState(null) // { state: 'ok'|'slow'|'down', detail } — stream LED
  const applyingRemote = useRef(false)
  const partyRef = useRef(null)

  const idle = useRef(null)
  const barRef = useRef(null)
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const rootRef = useRef(null)
  const lastSavedRef = useRef(-1)
  const lastTap = useRef({ at: 0, x: 0 })
  const onProgressRef = useRef(onProgress)
  const onToastRef = useRef(onToast)
  const onHealthRef = useRef(onHealth)
  onProgressRef.current = onProgress
  onToastRef.current = onToast
  onHealthRef.current = onHealth

  // Live stream health → the player LED + the Network Status dashboard.
  const chanRef = useRef(null)
  chanRef.current = real ? findChannelByUrl(src) : null
  const healthRef = useRef(null)
  const reportHealth = (state, detail) => {
    const prev = healthRef.current
    if (prev?.state === state && prev?.detail === detail) return
    const rec = { state, detail, at: Date.now() }
    healthRef.current = rec
    setHealth(rec)
    const c = chanRef.current
    if (c) onHealthRef.current?.(c.id, { ...rec, url: c.url })
  }

  const duration = real ? dur : fallbackDur
  const ended = real ? endedReal : t >= duration
  const epNo = isSeries ? epN : 0
  const latestRef = useRef(null)
  latestRef.current = { showId, ep: epNo, t, dur: duration }
  const pipOk = typeof document !== 'undefined' && !!document.pictureInPictureEnabled
  partyRef.current = partyCode

  const poke = () => {
    setCtl(true)
    clearTimeout(idle.current)
    idle.current = setTimeout(() => setCtl(false), 2800)
  }

  // page lock + control auto-hide
  useEffect(() => {
    poke()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      clearTimeout(idle.current)
      const s = latestRef.current
      if (s && onProgressRef.current) onProgressRef.current({ ...s, at: Date.now() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // keyboard shortcuts
  useEffect(() => {
    const key = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ') { e.preventDefault(); togglePlay() }
      if (e.key === 'ArrowRight') seekBy(10)
      if (e.key === 'ArrowLeft') seekBy(-10)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })

  const report = (sec, d) => {
    const s = Math.floor(sec)
    if (s - lastSavedRef.current >= 5) {
      lastSavedRef.current = s
      onProgressRef.current?.({ showId, ep: epNo, t: sec, dur: d, at: Date.now() })
    }
  }

  // ── REAL MODE: attach stream (native or hls.js for .m3u8) ────────────────
  useEffect(() => {
    if (!real) return undefined
    const v = videoRef.current
    if (!v) return undefined
    let hls = null
    let cancelled = false

    setT(0); setEndedReal(false); setBufPct(0); setPlaying(true); setMenu(null)
    setSubTr([]); setSelSub(-1); setAudTr([]); setSelAud(0); setLevels([]); setSelQ(-1)
    lastSavedRef.current = -1
    reportHealth('slow', 'connecting…')

    const start = () => { v.play().catch(() => setPlaying(false)) }

    if (isHls(src) && !v.canPlayType('application/vnd.apple.mpegurl')) {
      import('hls.js').then(({ default: Hls }) => {
        if (cancelled) return
        if (!Hls.isSupported()) { onToastRef.current?.('This browser cannot play HLS streams'); return }
        hls = new Hls({ enableWorker: true })
        hlsRef.current = hls
        hls.loadSource(src)
        hls.attachMedia(v)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (cancelled) return
          setAudTr(hls.audioTracks || [])
          setSubTr(hls.subtitleTracks || [])
          setLevels(hls.levels || [])
          start()
        })
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data?.fatal) {
            reportHealth('down', data?.details ? String(data.details).replace(/_/g, ' ') : 'fatal stream error')
            onToastRef.current?.('Stream error — check the source URL / CORS headers')
          } else if (data?.type === 'networkError') reportHealth('slow', 'network hiccup — recovering')
        })
      }).catch(() => onToastRef.current?.('Could not load the stream engine'))
    } else {
      v.src = src
      v.load()
      start()
    }
    return () => { cancelled = true; if (hls) hls.destroy(); hlsRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, real])

  // ── SIMULATED MODE: fake clock ────────────────────────────────────────────
  useEffect(() => {
    if (real || !playing || ended) return undefined
    const intervalMs = 1000 / speed
    const id = setInterval(() => {
      setT((v) => {
        const nv = Math.min(duration, v + (1 / speed))
        report(nv, duration)
        return nv
      })
      setBufPct((b) => Math.min(100, b + 0.5 * speed))
    }, intervalMs)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [real, playing, ended, duration, speed])

  useEffect(() => { if (ended) { setPlaying(false); setCtl(true) } }, [ended])

  // sim mode honors startAt
  useEffect(() => { if (!real && startAt > 10 && startAt < duration - 10) setT(startAt) },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showId, epN])

  // ── controls ──────────────────────────────────────────────────────────────
  const togglePlay = () => {
    poke()
    const willPlay = real ? videoRef.current?.paused ?? !playing : !playing
    if (real) {
      const v = videoRef.current
      if (!v) return
      if (ended) v.currentTime = 0
      if (v.paused) v.play().catch(() => {})
      else v.pause()
    } else {
      if (ended) setT(0)
      setPlaying((p) => !p)
    }
    broadcast(willPlay ? 'play' : 'pause')
  }

  const seekTo = (sec) => {
    const clamped = Math.min(Math.max(0, sec), duration || 0)
    if (real) { const v = videoRef.current; if (v) v.currentTime = clamped }
    setT(clamped)
    poke()
  }
  const seekBy = (d) => {
    const target = (real ? videoRef.current?.currentTime || 0 : t) + d
    seekTo(target)
    broadcast('seek', { t: Math.min(Math.max(0, target), duration || 0) })
  }

  const seekClick = (e) => {
    const r = barRef.current.getBoundingClientRect()
    const pct = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    seekTo(pct * duration)
    broadcast('seek', { t: pct * duration })
  }

  const pickEp = (ix) => {
    setEpN(ix); setT(0); setEndedReal(false); setPlaying(true); setDrawer(false)
    onToast(`Now playing S1:E${ix + 1} “${show.episodes[ix].title}”`)
    broadcast('ep', { i: ix })
  }

  const toggleMute = () => {
    setMuted((m) => !m)
    if (real && videoRef.current) videoRef.current.muted = !muted
    poke()
  }

  const togglePip = async () => {
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else await videoRef.current?.requestPictureInPicture()
    } catch { onToast('Picture-in-Picture is not available for this stream') }
  }

  const pickTrack = (kind, i) => {
    const hls = hlsRef.current
    if (kind === 'subs') {
      if (hls) { hls.subtitleTrack = i; hls.subtitleDisplay = i >= 0 }
      setSelSub(i)
    } else if (kind === 'audio') {
      if (hls) hls.audioTrack = i
      setSelAud(i)
    } else {
      if (hls) hls.currentLevel = i
      setSelQ(i)
    }
    setMenu(null)
  }

  // ── Watch Party (BroadcastChannel tabs sync) ─────────────────────────────
  const broadcast = (kind, data = {}) => {
    if (!applyingRemote.current && partyRef.current) sendParty({ kind, ...data })
  }

  const applyRemote = (m) => {
    applyingRemote.current = true
    try {
      if (m.kind === 'play') { real ? videoRef.current?.play?.().catch(() => {}) : setPlaying(true); onToast('Party: play') }
      else if (m.kind === 'pause') { real ? videoRef.current?.pause?.() : setPlaying(false); onToast('Party: pause') }
      else if (m.kind === 'seek' && Number.isFinite(m.t)) { seekTo(m.t); onToast(`Party: jumped to ${fmt(m.t)}`) }
      else if (m.kind === 'ep' && isSeries && show.episodes[m.i]) pickEp(m.i)
    } finally {
      setTimeout(() => { applyingRemote.current = false }, 0)
    }
  }

  const partyStart = (code) => {
    const c = joinParty(code, { onEvent: applyRemote, onPresence: (n) => setPartyPeers(n) })
    if (c) { setPartyCode(c); setMenu(null); onToast(`Watch Party “${c}” live — invite link opens a synced tab`) }
    else onToast('Watch Party is not supported in this browser')
  }

  const copyInvite = () => {
    const link = `${window.location.origin}${window.location.pathname}?party=${partyCode}`
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(link).then(() => onToast('Invite link copied — open it in another tab')).catch(() => onToast(`Room code: ${partyCode}`))
    else onToast(`Room code: ${partyCode}`)
  }

  useEffect(() => () => leaveParty(), [])
  useEffect(() => {
    if (partyJoin && PARTY_SUPPORTED && !partyRef.current) partyStart(partyJoin)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partyJoin])

  // ── Chromecast / AirPlay (Remote Playback API) ───────────────────────────
  useEffect(() => {
    if (!real) { setCastAvail(false); setCasting(false); return undefined }
    const r = videoRef.current?.remote
    if (!r || typeof r.watchAvailability !== 'function') return undefined
    let cancelled = false
    r.watchAvailability((a) => { if (!cancelled) setCastAvail(a) }).catch(() => setCastAvail(false))
    const onState = () => setCasting(r.state === 'connecting' || r.state === 'connected')
    r.addEventListener('connect', onState)
    r.addEventListener('disconnect', onState)
    onState()
    return () => { cancelled = true; r.removeEventListener('connect', onState); r.removeEventListener('disconnect', onState) }
  }, [src, real]);

  const cast = () => {
    const r = videoRef.current?.remote
    if (!r) return
    r.prompt().catch((e) => { if (e?.name !== 'NotAllowedError') onToastRef.current?.('Could not start casting') })
  }

  // ── fullscreen (with best-effort landscape lock on phones) ───────────────
  useEffect(() => {
    const onFs = () => setFs(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const toggleFs = async () => {
    try {
      if (!document.fullscreenElement) {
        await rootRef.current?.requestFullscreen?.()
        try { await window.screen.orientation?.lock?.('landscape') } catch { /* not allowed — fine */ }
      } else {
        await document.exitFullscreen()
        try { window.screen.orientation?.unlock?.() } catch { /* noop */ }
      }
    } catch { onToastRef.current?.('Fullscreen is not available here') }
  }

  // ── touch gestures: tap = controls, double-tap side = seek ±10s ──────────
  const handleTouch = (e) => {
    poke()
    if (e.target.closest('button, input, .p-seek, .px-menu, .p-drawer, select')) return
    const tch = e.changedTouches?.[0]
    if (!tch) return
    const now = Date.now()
    const rect = rootRef.current?.getBoundingClientRect()
    const x = rect ? (tch.clientX - rect.left) / rect.width : 0.5
    if (now - lastTap.current.at < 320) {
      const side = x < 0.5 ? 'l' : 'r'
      seekBy(side === 'l' ? -10 : 10)
      setFlash({ side, k: now })
      lastTap.current = { at: 0, x: 0 }
    } else {
      lastTap.current = { at: now, x }
    }
  }

  // Apply playback speed to real video element
  useEffect(() => {
    if (real && videoRef.current) videoRef.current.playbackRate = speed
  }, [speed, real])

  // ── video element events (real mode) ─────────────────────────────────────
  const onVid = {
    onTimeUpdate: (e) => { setT(e.currentTarget.currentTime); report(e.currentTarget.currentTime, e.currentTarget.duration) },
    onLoadedMetadata: (e) => {
      const d = e.currentTarget.duration || fallbackDur
      setDur(d)
      if (startAt > 10 && startAt < d - 10) e.currentTarget.currentTime = startAt
    },
    onPlay: () => { setPlaying(true); setEndedReal(false) },
    onPlaying: () => reportHealth('ok', 'playing smoothly'),
    onCanPlay: () => { if (healthRef.current?.state === 'slow') reportHealth('ok', 'playing smoothly') },
    onWaiting: () => reportHealth('slow', 'buffering…'),
    onStalled: () => reportHealth('slow', 'stalled — waiting for data'),
    onPause: () => setPlaying(false),
    onEnded: () => setEndedReal(true),
    onProgress: (e) => {
      const v = e.currentTarget
      try {
        if (v.buffered.length && v.duration) setBufPct((v.buffered.end(v.buffered.length - 1) / v.duration) * 100)
      } catch { /* noop */ }
    },
    onError: () => {
      reportHealth('down', 'load error — source unreachable or blocked')
      onToastRef.current?.('Could not load this video — check the URL and licensing host')
    }
  }

  const label = isSeries ? `S1:E${ep.n} “${ep.title}”` : show.title

  // Netflix-style Skip Intro / Skip Recap markers from the catalogue
  const mk = show.markers
  let skip = null
  if (mk && !ended) {
    if (mk.intro && t >= mk.intro[0] && t < mk.intro[1]) skip = { label: 'Skip Intro', to: mk.intro[1] }
    else if (mk.recap && t >= mk.recap[0] && t < mk.recap[1]) skip = { label: 'Skip Recap', to: mk.recap[1] }
  }

  return (
    <div ref={rootRef} className={`player${ctl ? ' showctl' : ''}`} onMouseMove={poke} onTouchEnd={handleTouch}>
      {real ? (
        <video
          ref={videoRef}
          className="pv-real"
          playsInline
          crossOrigin="anonymous"
          onClick={togglePlay}
          {...onVid}
        />
      ) : (
        <div className={`p-video${playing ? '' : ' paused'}`} style={{ '--c1': show.palette[0], '--c2': show.palette[1] }} aria-hidden="true">
          <div className="pv-ken" />
          <div className="pv-light l1" />
          <div className="pv-light l2" />
          <div className="pv-grain" />
          <div className="pv-vig" />
        </div>
      )}

      {!real && (
        <span className="pv-sim" title="No stream configured for this title — showing a simulated presentation">
          SIMULATED PREVIEW · configure <code>videoUrl</code> in catalog to play real video
        </span>
      )}

      {(!playing && !ended) && (
        <button className="p-bigplay" onClick={togglePlay} aria-label="Resume">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 4.5v15l13-7.5z"/></svg>
        </button>
      )}

      {ended && (
        <div className="p-ended">
          <h3>You finished {label}</h3>
          <div className="p-ended-btns">
            <button className="btn-play" onClick={() => { real ? seekTo(0) : setT(0); real ? videoRef.current?.play?.().catch(() => {}) : setPlaying(true) }}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/></svg>
              <span>Watch Again</span>
            </button>
            {isSeries && epN < show.episodes.length - 1 && (
              <button className="btn-info" onClick={() => pickEp(epN + 1)}><span>Next Episode</span></button>
            )}
            <button className="btn-info" onClick={onClose}><span>Back to Browse</span></button>
          </div>
        </div>
      )}

      {skip && (
        <button className="p-skip" onClick={() => { seekTo(skip.to); broadcast('seek', { t: skip.to }); onToast(`${skip.label} → skipped`) }}>
          {skip.label}
        </button>
      )}

      {flash && (
        <span key={flash.k} className={`p-flash ${flash.side}`} aria-hidden="true">
          {flash.side === 'l' ? '« 10' : '10 »'}
        </span>
      )}

      {/* top chrome */}
      <div className="p-top">
        <button className="p-back" onClick={onClose} aria-label="Back to browse">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20v-2z"/></svg>
        </button>
        <span className="p-brand"><Logo compact /></span>
        {partyCode && <span className="p-flag party">● PARTY{partyPeers > 1 ? ` ×${partyPeers}` : ''}</span>}
        <span className="p-flag">{casting ? 'PLAYING ON TV' : real ? 'HD · LIVE SOURCE' : '4K ULTRA HD · DOLBY VISION'}</span>
        {real && health && (
          <span
            className={`p-led ${health.state}`}
            title={`Stream health: ${health.state === 'ok' ? 'green — playing smoothly' : health.state === 'slow' ? 'yellow — ' + health.detail : 'red — ' + health.detail}`}
          >
            <span className="led" aria-hidden="true" />
            {health.state === 'ok' ? 'SOURCE OK' : health.state === 'slow' ? 'BUFFERING' : 'SOURCE DOWN'}
          </span>
        )}
      </div>

      {/* track / quality menus (real HLS only) */}
      {menu === 'subs' && (
        <div className="px-menu" role="menu">
          <h5>Subtitles</h5>
          {(real ? [{ name: 'Off', lang: '', i: -1 }, ...subTr.map((s, i) => ({ name: s.name || s.lang || `Track ${i + 1}`, lang: s.lang, i }))] : [{ name: 'Off', i: -1 }, { name: 'English (CC)', i: 0 }, { name: 'हिन्दी', i: 1 }, { name: 'Español', i: 2 }]).map((o) => (
            <button key={o.i + o.name} className={selSub === o.i ? 'on' : ''} onClick={() => { if (real && hlsRef.current) { hlsRef.current.subtitleTrack = o.i; hlsRef.current.subtitleDisplay = o.i >= 0 } setSelSub(o.i); setMenu(null); onToast(`Subtitles: ${o.name}`) }}>
              {o.name}{selSub === o.i && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
      {menu === 'audio' && (
        <div className="px-menu" role="menu">
          <h5>Audio</h5>
          {(real ? audTr.map((a, i) => ({ name: a.name || a.lang || `Track ${i + 1}`, i })) : [{ name: 'English', i: 0 }, { name: 'Hindi', i: 1 }, { name: 'Español', i: 2 }]).map((o) => (
            <button key={o.i} className={selAud === o.i ? 'on' : ''} onClick={() => { if (real && hlsRef.current) hlsRef.current.audioTrack = o.i; setSelAud(o.i); setMenu(null); onToast(`Audio: ${o.name}`) }}>
              {o.name}{selAud === o.i && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
      {menu === 'quality' && (
        <div className="px-menu" role="menu">
          <h5>Quality</h5>
          {(real ? [{ name: 'Auto', height: 0, i: -1 }, ...levels.map((l, i) => ({ name: `${l.height}p`, height: l.height, i }))] : [{ name: 'Auto', i: -1 }, { name: '480p', i: 0 }, { name: '720p', i: 1 }, { name: '1080p', i: 2 }, { name: '4K HDR', i: 3 }]).map((o) => (
            <button key={o.i} className={selQ === o.i ? 'on' : ''} onClick={() => { if (real && hlsRef.current) hlsRef.current.currentLevel = o.i; setSelQ(o.i); setMenu(null); onToast(`Quality: ${o.name}`) }}>
              {o.name}{selQ === o.i && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
      {menu === 'speed' && (
        <div className="px-menu" role="menu">
          <h5>Playback Speed</h5>
          {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((sVal) => (
            <button key={sVal} className={speed === sVal ? 'on' : ''} onClick={() => { setSpeed(sVal); if (real && videoRef.current) videoRef.current.playbackRate = sVal; setMenu(null); onToast(`Speed: ${sVal}x`) }}>
              {sVal}x {speed === sVal && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
      {menu === 'party' && (
        <div className="px-menu party" role="menu">
          <h5>Watch Party{!PARTY_SUPPORTED && ' — unsupported browser'}</h5>
          {partyCode ? (
            <>
              <p className="party-status">Room <b>{partyCode}</b> · {partyPeers} connected</p>
              <button onClick={copyInvite}>Copy invite link</button>
              <button onClick={() => { leaveParty(); setPartyCode(null); setPartyPeers(1); setMenu(null); onToast('Left the party') }}>Leave party</button>
            </>
          ) : (
            <>
              <div className="party-join">
                <input value={partyInput} maxLength={4} placeholder="CODE" aria-label="Party code"
                  onChange={(e) => setPartyInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))} />
                <button disabled={partyInput.trim().length < 4} onClick={() => partyStart(partyInput)}>Join</button>
              </div>
              <button onClick={() => partyStart(makeRoomCode())}>Start a party (host)</button>
              <p className="party-note">Syncs play / pause / seek / episode across tabs of this browser.</p>
            </>
          )}
        </div>
      )}

      {/* bottom chrome */}
      <div className="p-bottom">
        <div className="p-seek" ref={barRef} onClick={seekClick} role="slider" aria-label="Seek"
          aria-valuenow={duration ? Math.round((t / duration) * 100) : 0} aria-valuemin={0} aria-valuemax={100}>
          <span className="p-buf" style={{ width: `${Math.min(100, duration ? (t / duration) * 100 : 0) + (duration ? Math.min(14, Math.max(0, bufPct - (t / duration) * 100)) : 0)}%` }} />
          <span className="p-fill" style={{ width: `${duration ? (t / duration) * 100 : 0}%` }}>
            <i className="p-knob" />
          </span>
        </div>
        <span className="p-time">-{fmt(Math.max(0, duration - t))}</span>

        <div className="p-ctlrow">
          <div className="p-ctl-l">
            <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
              {playing
                ? <svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
                : <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 4.5v15l13-7.5z"/></svg>}
            </button>
            <button onClick={() => seekBy(-10)} aria-label="Back 10 seconds">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/><text x="8" y="16.5" fontSize="7" fontWeight="700" fill="currentColor">10</text></svg>
            </button>
            <button onClick={() => seekBy(10)} aria-label="Forward 10 seconds">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 5V1l5 5-5 5V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z" transform="scale(-1 1) translate(-24 0)"/><text x="9.5" y="16.5" fontSize="7" fontWeight="700" fill="currentColor">10</text></svg>
            </button>
            <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted
                ? <svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4L13.8 12l-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4-2.7-2.7z"/></svg>
                : <svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>}
            </button>
            <span className="p-title">{label}</span>
          </div>

          <div className="p-ctl-r">
            {isSeries && epN < show.episodes.length - 1 && (
              <button className="p-wide" onClick={() => pickEp(epN + 1)}>Next Episode</button>
            )}
            {isSeries && (
              <button onClick={() => { setDrawer((d) => !d); poke() }} aria-label="Episodes">
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 5h16v2H4zM4 11h16v2H4zM4 17h16v2H4z"/></svg>
              </button>
            )}

            {/* Subtitles — always visible */}
            <button className={(real ? selSub >= 0 : false) ? 'sel' : ''} aria-label="Subtitles"
              onClick={() => setMenu(menu === 'subs' ? null : 'subs')}>
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM6 16H4.5v-1.5H6V16zm0-3.5H4.5V11H6v1.5zm3.5 3.5H8v-1.5h1.5V16zm0-3.5H8V11h1.5v1.5zM19 16h-8v-1.5h8V16zm0-3.5h-8V11h8v1.5z"/></svg>
            </button>

            {/* Audio — always visible */}
            <button className={(real ? selAud > 0 : false) ? 'sel' : ''} aria-label="Audio track"
              onClick={() => setMenu(menu === 'audio' ? null : 'audio')}>
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a9 9 0 0 0-9 9v7h4v-6H5a7 7 0 0 1 14 0h-2v6h4v-7a9 9 0 0 0-9-9z"/></svg>
            </button>

            {/* Quality — always visible */}
            <button className={(real ? selQ >= 0 : false) ? 'sel' : ''} aria-label="Quality"
              onClick={() => setMenu(menu === 'quality' ? null : 'quality')}>
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19.4 13a7.5 7.5 0 0 0 .1-1 7.5 7.5 0 0 0-.1-1l2.1-1.6a.5.5 0 0 0 .1-.7l-2-3.4a.5.5 0 0 0-.7-.2l-2.5 1a7.4 7.4 0 0 0-1.7-1L14.5 2.7a.5.5 0 0 0-.5-.4h-4a.5.5 0 0 0-.5.4l-.3 2.7a7.4 7.4 0 0 0-1.7 1l-2.5-1a.5.5 0 0 0-.7.2l-2 3.4a.5.5 0 0 0 .1.7L4.5 11a7.5 7.5 0 0 0-.1 1 7.5 7.5 0 0 0 .1 1l-2.1 1.6a.5.5 0 0 0-.1.7l2 3.4c.1.3.4.4.7.3l2.5-1a7.4 7.4 0 0 0 1.7 1l.3 2.7c0 .2.2.4.5.4h4c.3 0 .5-.2.5-.4l.3-2.7a7.4 7.4 0 0 0 1.7-1l2.5 1c.3.1.6 0 .7-.2l2-3.4a.5.5 0 0 0-.1-.7L19.4 13zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>
            </button>
            {/* Speed — always visible */}
            <button className={speed !== 1 ? 'sel' : ''} aria-label="Playback speed"
              onClick={() => setMenu(menu === 'speed' ? null : 'speed')}>
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4zm0 16a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4z"/></svg>
              <span style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.05em', marginLeft: '.2em' }}>{speed}x</span>
            </button>

            {real && pipOk && (
              <button onClick={togglePip} aria-label="Picture in Picture">
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 7h-8v6h8V7zm2-4H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H3V5h18v14z"/></svg>
              </button>
            )}
            {real && (castAvail || casting) && (
              <button className={casting ? 'sel' : ''} onClick={cast} aria-label="Cast to TV">
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3a2 2 0 0 0-2 2v3h2V5h18v14h-7v2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM1 18v3h3a3 3 0 0 0-3-3zm0-4v2a5 5 0 0 1 5 5h2a7 7 0 0 0-7-7zm0-4v2a9 9 0 0 1 9 9h2A11 11 0 0 0 1 10z"/></svg>
              </button>
            )}
            <button className={partyCode ? 'sel' : ''} aria-label="Watch Party"
              onClick={() => setMenu(menu === 'party' ? null : 'party')}>
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 2c-2.3 0-7 1.2-7 3.5V19h9v-2.5c0-.8.2-1.6.6-2.3A11.4 11.4 0 0 0 8 13zm8 0c-.3 0-.7 0-1 .1a4 4 0 0 1 1 3.4V19h6v-2.5c0-2.3-3.7-3.5-6-3.5z"/></svg>
            </button>
            <button onClick={toggleFs} aria-label={fs ? 'Exit fullscreen' : 'Fullscreen'}>
              {fs
                ? <svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
                : <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>}
            </button>
          </div>
        </div>
      </div>

      {/* episode drawer */}
      {isSeries && (
        <aside className={`p-drawer${drawer ? ' open' : ''}`} aria-label="Episodes">
          <h4>{show.title} — Season 1</h4>
          <ol>
            {show.episodes.map((e, ix) => (
              <li key={e.n}>
                <button className={ix === epN ? 'on' : ''} onClick={() => pickEp(ix)}>
                  <span className="ep-thumb" style={{ '--c1': show.palette[0], '--c2': show.palette[1], '--r': `${((ix * 37) % 40) - 20}deg` }}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l13-7.5z"/></svg>
                  </span>
                  <span className="pd-txt">
                    <b>{e.n}. {e.title}</b>
                    <i>{e.dur}{show.episodeVideos?.[ix] ? ' · source ready' : ''}</i>
                    <em>{e.syn}</em>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
      )}
    </div>
  )
}
