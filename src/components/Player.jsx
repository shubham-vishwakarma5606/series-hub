import { useCallback, useEffect, useRef, useState } from 'react'
import { byId } from '../data/catalog.js'
import Logo from './Logo.jsx'

const fmt = (t) => {
  if (!Number.isFinite(t)) return '--:--'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const isHls = (u) => /\.m3u8($|\?)/i.test(u)

// Player with two modes:
//  • REAL — plays an actual MP4/WebM/HLS stream you are licensed to host
//           (configure videoUrl / episodeVideos in src/data/catalog.js)
//  • SIMULATED — cinematic animated showcase when no stream is configured
export default function Player ({ showId, epIdx = 0, onClose, onToast }) {
  const show = byId[showId]
  const isSeries = show.type === 'series'
  const [epN, setEpN] = useState(Math.min(epIdx, (show.episodes || []).length - 1))
  const ep = isSeries ? show.episodes[epN] : null

  const src = isSeries ? show.episodeVideos?.[epN] : show.videoUrl
  const real = Boolean(src)
  const fallbackDur = isSeries ? parseInt(ep.dur, 10) * 60 : (show.durMin || 100) * 60

  const [t, setT] = useState(0)
  const [dur, setDur] = useState(fallbackDur)
  const [bufPct, setBufPct] = useState(14)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(false)
  const [ctl, setCtl] = useState(true)
  const [drawer, setDrawer] = useState(false)
  const [endedReal, setEndedReal] = useState(false)
  const idle = useRef(null)
  const barRef = useRef(null)
  const videoRef = useRef(null)

  const duration = real ? dur : fallbackDur
  const ended = real ? endedReal : t >= duration

  const poke = useCallback(() => {
    setCtl(true)
    clearTimeout(idle.current)
    idle.current = setTimeout(() => setCtl(false), 2800)
  }, [])

  // page lock + control auto-hide
  useEffect(() => {
    poke()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev; clearTimeout(idle.current) }
  }, [poke])

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

  // ── REAL MODE: attach the stream (native or hls.js for .m3u8) ────────────
  useEffect(() => {
    if (!real) return
    const v = videoRef.current
    if (!v) return
    let hls = null
    let cancelled = false

    setT(0); setEndedReal(false); setBufPct(0); setPlaying(true)

    const start = () => { v.play().catch(() => setPlaying(false)) }

    if (isHls(src) && !v.canPlayType('application/vnd.apple.mpegurl')) {
      import('hls.js').then(({ default: Hls }) => {
        if (cancelled) return
        if (Hls.isSupported()) {
          hls = new Hls({ enableWorker: true })
          hls.loadSource(src)
          hls.attachMedia(v)
          hls.on(Hls.Events.MANIFEST_PARSED, start)
          hls.on(Hls.Events.ERROR, (_e, data) => {
            if (data?.fatal) onToast('Stream error — check the source URL / CORS headers')
          })
        } else {
          onToast('This browser cannot play HLS streams')
        }
      }).catch(() => onToast('Could not load the stream engine'))
    } else {
      v.src = src
      v.load()
      start()
    }
    return () => { cancelled = true; if (hls) hls.destroy() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, real])

  // ── SIMULATED MODE: fake playback clock ───────────────────────────────────
  useEffect(() => {
    if (real) return
    if (!playing || ended) return
    const id = setInterval(() => {
      setT((v) => Math.min(duration, v + 1))
      setBufPct((b) => Math.min(100, b + 0.5))
    }, 1000)
    return () => clearInterval(id)
  }, [real, playing, ended, duration])

  useEffect(() => { if (ended) { setPlaying(false); setCtl(true) } }, [ended])

  // ── control handlers (mode-aware) ─────────────────────────────────────────
  const togglePlay = () => {
    poke()
    if (real) {
      const v = videoRef.current
      if (!v) return
      if (ended) { v.currentTime = 0 }
      if (v.paused) v.play().catch(() => {})
      else v.pause()
    } else {
      if (ended) setT(0)
      setPlaying((p) => !p)
    }
  }

  const seekTo = (sec) => {
    const clamped = Math.min(Math.max(0, sec), duration || 0)
    if (real) { const v = videoRef.current; if (v) v.currentTime = clamped }
    else setT(clamped)
    poke()
  }
  const seekBy = (d) => seekTo((real ? videoRef.current?.currentTime || 0 : t) + d)

  const seekClick = (e) => {
    const r = barRef.current.getBoundingClientRect()
    const pct = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    if (real) { const v = videoRef.current; if (v && duration) v.currentTime = pct * duration }
    if (!real) setT(Math.floor(pct * duration))
    poke()
  }

  const pickEp = (ix) => {
    setEpN(ix); setT(0); setEndedReal(false); setPlaying(true); setDrawer(false)
    onToast(`Now playing S1:E${ix + 1} “${show.episodes[ix].title}”`)
  }

  const toggleMute = () => {
    setMuted((m) => !m)
    if (real && videoRef.current) videoRef.current.muted = !muted
    poke()
  }

  // ── video element event hooks (real mode) ────────────────────────────────
  const onVid = {
    onTimeUpdate: (e) => setT(e.currentTarget.currentTime),
    onLoadedMetadata: (e) => setDur(e.currentTarget.duration || fallbackDur),
    onPlay: () => { setPlaying(true); setEndedReal(false) },
    onPause: () => setPlaying(false),
    onEnded: () => setEndedReal(true),
    onProgress: (e) => {
      const v = e.currentTarget
      try {
        if (v.buffered.length && v.duration) setBufPct((v.buffered.end(v.buffered.length - 1) / v.duration) * 100)
      } catch { /* noop */ }
    },
    onError: () => onToast('Could not load this video — check the URL and licensing host')
  }

  const label = isSeries ? `S1:E${ep.n} “${ep.title}”` : show.title
  const shownT = real ? t : t

  return (
    <div className={`player${ctl ? ' showctl' : ''}`} onMouseMove={poke} onTouchStart={poke}>
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

      {/* top chrome */}
      <div className="p-top">
        <button className="p-back" onClick={onClose} aria-label="Back to browse">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20v-2z"/></svg>
        </button>
        <span className="p-brand"><Logo compact /></span>
        <span className="p-flag">{real ? 'HD · LIVE SOURCE' : '4K ULTRA HD · DOLBY VISION'}</span>
      </div>

      {/* bottom chrome */}
      <div className="p-bottom">
        <div className="p-seek" ref={barRef} onClick={seekClick} role="slider" aria-label="Seek"
          aria-valuenow={duration ? Math.round((shownT / duration) * 100) : 0} aria-valuemin={0} aria-valuemax={100}>
          <span className="p-buf" style={{ width: `${Math.min(100, duration ? (shownT / duration) * 100 : 0) + (duration ? Math.min(14, Math.max(0, bufPct - (shownT / duration) * 100)) : 0)}%` }} />
          <span className="p-fill" style={{ width: `${duration ? (shownT / duration) * 100 : 0}%` }}>
            <i className="p-knob" />
          </span>
        </div>
        <span className="p-time">-{fmt(Math.max(0, duration - shownT))}</span>

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
            <button onClick={() => onToast('Subtitles: English (CC), हिन्दी, Español')} aria-label="Audio and subtitles">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM6 16H4.5v-1.5H6V16zm0-3.5H4.5V11H6v1.5zm3.5 3.5H8v-1.5h1.5V16zm0-3.5H8V11h1.5v1.5zM19 16h-8v-1.5h8V16zm0-3.5h-8V11h8v1.5z"/></svg>
            </button>
            <button onClick={() => onToast(real ? 'Quality: source default' : 'Already at the best quality: 4K HDR')} aria-label="Settings">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19.4 13a7.5 7.5 0 0 0 .1-1 7.5 7.5 0 0 0-.1-1l2.1-1.6a.5.5 0 0 0 .1-.7l-2-3.4a.5.5 0 0 0-.7-.2l-2.5 1a7.4 7.4 0 0 0-1.7-1L14.5 2.7a.5.5 0 0 0-.5-.4h-4a.5.5 0 0 0-.5.4l-.3 2.7a7.4 7.4 0 0 0-1.7 1l-2.5-1a.5.5 0 0 0-.7.2l-2 3.4a.5.5 0 0 0 .1.7L4.5 11a7.5 7.5 0 0 0-.1 1 7.5 7.5 0 0 0 .1 1l-2.1 1.6a.5.5 0 0 0-.1.7l2 3.4c.1.3.4.4.7.3l2.5-1a7.4 7.4 0 0 0 1.7 1l.3 2.7c0 .2.2.4.5.4h4c.3 0 .5-.2.5-.4l.3-2.7a7.4 7.4 0 0 0 1.7-1l2.5 1c.3.1.6 0 .7-.2l2-3.4a.5.5 0 0 0-.1-.7L19.4 13zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>
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
