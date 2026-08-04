import { useEffect, useState } from 'react'
import { fetchApkInfo, fmtBytes, APK_FALLBACK } from '../utils/appStore.js'

// "Get the Android app" — the download hub of the site. Three surfaces:
//   GetAppModal — APK download + PWA install + QR hand-off to phone
//   AppBanner   — dismissible smart banner shown on Android phones (web)
//   Platform helpers below for banner/modal copy decisions.

export const ANDROID_ICON = 'M17.6 9.48l1.84-3.18a.38.38 0 0 0-.66-.38l-1.86 3.22a11.66 11.66 0 0 0-9.84 0L5.22 5.92a.38.38 0 0 0-.66.38L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52zM7 15.25a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm10 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1z'

const DISMISS_KEY = 'sh.appdismiss'

export const isAndroidDevice = () =>
  typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent || '')

const isIOSDevice = () =>
  typeof navigator !== 'undefined' &&
  (/iP(hone|ad|od)/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

const isStandaloneMode = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true)

async function makeQr (text) {
  const mod = await import('qrcode')
  const toDataURL = mod.toDataURL || mod.default?.toDataURL
  return toDataURL(text, {
    width: 420,
    margin: 2,
    color: { dark: '#05060a', light: '#ffffff' },
    errorCorrectionLevel: 'M'
  })
}

function apkLabel (info) {
  const size = fmtBytes(info.sizeBytes)
  return `v${info.version}${size ? ` · ${size}` : ''}`
}

// ── Modal ───────────────────────────────────────────────────────────────────
export function GetAppModal ({ onClose, installEvt, onInstall, onToast }) {
  const [info, setInfo] = useState({ ...APK_FALLBACK, _loading: true })
  const [qr, setQr] = useState(null)

  useEffect(() => {
    let alive = true
    fetchApkInfo().then((d) => { if (alive) setInfo(d) })
    const url = window.location.origin
    makeQr(url).then((d) => { if (alive) setQr(d) }).catch(() => {})
    return () => { alive = false }
  }, [])

  const ios = isIOSDevice()
  const standalone = isStandaloneMode()

  const installCopy = installEvt
    ? 'Install via your browser — free, tiny, and updates itself automatically.'
    : ios
      ? 'In Safari: tap the Share button → “Add to Home Screen”.'
      : 'In Chrome/Edge: open the ⋮ menu → “Install app” / “Add to Home screen”.'

  return (
    <div className="m-wrap" role="dialog" aria-modal="true" aria-label="Get the Series Hub Android app" onClick={onClose}>
      <div className="modal getapp" onClick={(e) => e.stopPropagation()}>
        <button className="m-close" aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>
        </button>
        <div className="ga-body">
          <div className="ga-head">
            <img className="ga-icon" src="/icons/icon-192.png" alt="Series Hub app icon" width="64" height="64" />
            <div>
              <h2 className="ga-title">Series Hub for Android</h2>
              <span className={`ga-badge ${info.available ? 'ok' : 'soon'}`}>
                {info._loading ? 'Checking APK…' : info.available ? `APK ready — ${apkLabel(info)}` : 'Native APK coming soon'}
              </span>
            </div>
          </div>

          <div className="ga-actions">
            {info.available ? (
              <a
                className="btn-play ga-dl"
                href={info.url}
                download="series-hub.apk"
                onClick={() => onToast?.(`Downloading Series Hub ${apkLabel(info)}…`)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d={ANDROID_ICON}/></svg>
                <span>Download APK · {apkLabel(info)}</span>
              </a>
            ) : (
              <button className="btn-play ga-dl" disabled title="The signed APK ships with the next native build — install the app below in the meantime">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d={ANDROID_ICON}/></svg>
                <span>APK — coming soon</span>
              </button>
            )}

            {!standalone && (
              <button
                className="btn-info"
                onClick={() => {
                  if (installEvt || ios) onInstall?.()
                  else onToast?.('Use your browser menu → “Install app” / “Add to Home screen”')
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3l4.2 4.2-1.4 1.4-1.8-1.8V14h-2V6.8L9.2 8.6 7.8 7.2zM5 19h14v2H5z"/></svg>
                <span>Install app — no download needed</span>
              </button>
            )}
          </div>
          <p className="ga-note">{standalone ? 'You’re running the installed app — thanks!' : installCopy}</p>

          {qr && (
            <div className="ga-qrrow">
              <div className="ga-qr"><img src={qr} alt="QR code opening Series Hub" /></div>
              <p className="ga-qrtxt">Point your Android phone’s camera at the code to open Series Hub on it, then tap <b>Install app</b> (or download the APK once it ships).</p>
            </div>
          )}

          <ul className="ga-meta">
            <li>Package · <b>{info.package}</b></li>
            <li>Requires · <b>Android {info.minAndroid}+</b></li>
            <li>Updated · <b>{info.updated}</b></li>
          </ul>

          <p className="ga-steps">
            Sideloading the APK? On your phone allow <b>Install unknown apps</b> for your browser, open the downloaded file, and you’re in.
          </p>
          <p className="ga-legal">Distributed directly by Series Hub — no store account needed. {typeof info.notes === 'string' ? info.notes : ''}</p>
        </div>
      </div>
    </div>
  )
}

// ── Smart banner (Android phones, browser mode only) ────────────────────────
export function AppBanner ({ onGetApp }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return true }
  })
  if (dismissed || !isAndroidDevice() || isStandaloneMode()) return null
  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
    setDismissed(true)
  }
  return (
    <div className="appbanner" role="region" aria-label="Series Hub Android app">
      <img src="/icons/icon-192.png" alt="" width="40" height="40" />
      <div className="ab-txt">
        <b>Series Hub — Android app</b>
        <i>One tap install · free</i>
      </div>
      <button className="ab-get" onClick={onGetApp}>Get app</button>
      <button className="ab-x" aria-label="Dismiss" onClick={dismiss}>
        <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>
      </button>
    </div>
  )
}
