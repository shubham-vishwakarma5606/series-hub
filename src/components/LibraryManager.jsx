import { useRef, useState } from 'react'
import { validateLibraryJSON, LIBRARY_SAMPLE } from '../utils/library.js'
import Logo from './Logo.jsx'

// Library Manager — paste/upload a JSON manifest of titles you are licensed to
// stream; valid entries are merged into the catalogue ("Your Licensed Library").
export default function LibraryManager ({ existingCount, onClose, onSaved, onToast }) {
  const [text, setText] = useState('')
  const [report, setReport] = useState(null)
  const fileRef = useRef(null)

  const validate = () => setReport(validateLibraryJSON(text))

  const save = () => {
    const r = report || validateLibraryJSON(text)
    if (!r.ok.length) { setReport(r); onToast('Nothing valid to save yet'); return }
    try {
      if (typeof window !== 'undefined') window.localStorage?.setItem('sh.custom', JSON.stringify(r.ok))
      onToast(r.errors.length
        ? `Saved ${r.ok.length} title(s) — skipped ${r.errors.length} invalid. Reloading…`
        : `Saved ${r.ok.length} title(s). Reloading…`)
      onSaved?.()
      setTimeout(() => window.location.reload(), 1300)
    } catch {
      onToast('Could not write to localStorage')
    }
  }

  const clearAll = () => {
    try { if (typeof window !== 'undefined') window.localStorage?.removeItem('sh.custom') } catch {}
    onToast('Uploads removed. Reloading…')
    setTimeout(() => window.location.reload(), 1100)
  }

  const loadFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const rd = new FileReader()
    rd.onload = () => { setText(String(rd.result || '')); setReport(null) }
    rd.readAsText(f)
  }

  return (
    <div className="m-wrap" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal lib" role="dialog" aria-modal="true" aria-label="Upload licensed titles">
        <button className="m-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3z" transform="translate(1 1) scale(0.92)" /></svg>
        </button>

        <div className="lib-body">
          <span className="m-eyebrow"><Logo compact /><i>L I B R A R Y</i></span>
          <h2 className="lib-h">Upload Licensed Titles</h2>
          <p className="lib-sub">
            Paste a JSON manifest (or drop a <code>.json</code> file) describing titles you own or are licensed
            to host — films via <code>videoUrl</code>, series via <code>episodeVideos</code>. Streams can be
            MP4/WebM or HLS <code>.m3u8</code> (CORS-enabled). Only legal, licensed sources please.
          </p>

          <textarea
            className="lib-input"
            placeholder={JSON.stringify(LIBRARY_SAMPLE, null, 2)}
            value={text}
            onChange={(e) => { setText(e.target.value); setReport(null) }}
            spellCheck={false}
            aria-label="Library JSON"
          />

          <div className="lib-actions">
            <input ref={fileRef} type="file" accept=".json,application/json" onChange={loadFile} hidden />
            <button className="btn-info" onClick={() => fileRef.current?.click()}><span>Choose .json file</span></button>
            <button className="btn-info" onClick={() => { setText(JSON.stringify([LIBRARY_SAMPLE], null, 2)); setReport(null) }}><span>Insert sample</span></button>
            <button className="btn-info" onClick={validate}><span>Validate</span></button>
            <button className="btn-play" onClick={save}><span>Save &amp; Apply</span></button>
            {existingCount > 0 && (
              <button className="btn-info lib-danger" onClick={clearAll}><span>Remove {existingCount} upload(s)</span></button>
            )}
          </div>

          {report && (
            <div className="lib-report" role="status">
              {report.ok.length > 0 && <p className="ok">✓ {report.ok.length} title(s) valid: {report.ok.map((j) => j.id).join(', ')}</p>}
              {report.errors.map((e, i) => <p className="err" key={i}>✗ {e}</p>)}
              {report.ok.length > 0 && report.errors.length === 0 && <p className="ok">All clear — hit “Save &amp; Apply”.</p>}
            </div>
          )}

          <details className="lib-schema">
            <summary>Manifest schema</summary>
            <pre>{`[{
  "id": "kebab-id",            // required, unique
  "type": "film" | "series",   // default "film"
  "title": "My Title",         // required
  "year": 2026, "age": "TV-14",
  "durMin": 96,                // films (fallback length display)
  "seasons": 1,                // series
  "genres": ["Drama"],
  "syn": "Short description.",
  "videoUrl": "https://…/film.mp4 | master.m3u8",       // films
  "episodeVideos": ["https://…/s1e1.m3u8", "…"]           // series, per-episode
}]`}</pre>
          </details>
        </div>
      </div>
    </div>
  )
}
