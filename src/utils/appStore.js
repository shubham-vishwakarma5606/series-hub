// Android app store metadata — drives the "Get the App" modal, the footer
// badges and the smart banner. The website reads /downloads/android.json (a
// static file next to the built site) so shipping an APK never requires a
// code change: drop the signed APK into public/downloads/, flip `available`
// to true, redeploy — the download button lights up automatically.

export const APK_INFO_URL = '/downloads/android.json'

export const APK_FALLBACK = {
  available: false,
  version: '1.0.0',
  sizeBytes: null,
  updated: '2026-08-04',
  minAndroid: '8.0',
  package: 'com.serieshub.app',
  url: '/downloads/series-hub.apk',
  notes: 'Direct APK · also available as an installable web app (PWA) in any browser.'
}

const isHttp = (u) => /^https?:\/\//i.test(u) || u.startsWith('/')

export async function fetchApkInfo () {
  try {
    const r = await fetch(`${APK_INFO_URL}?v=${Date.now()}`, { cache: 'no-store' })
    if (!r.ok) return { ...APK_FALLBACK }
    const j = await r.json()
    const info = { ...APK_FALLBACK, ...j }
    if (typeof info.url !== 'string' || !isHttp(info.url)) info.url = APK_FALLBACK.url
    info.available = Boolean(info.available && info.url)
    return info
  } catch {
    return { ...APK_FALLBACK }
  }
}

export function fmtBytes (n) {
  if (!n || n <= 0) return null
  const units = ['B', 'KB', 'MB', 'GB']
  let v = n; let i = 0
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
  return `${v.toFixed(v >= 100 ? 0 : 1)} ${units[i]}`
}
