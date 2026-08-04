// Cookie & storage consent. Series Hub stores data in localStorage (not
// third-party cookies): auth session, profiles, list, progress. Consent lets
// the viewer opt out of OPTIONAL preference storage (likes / taste profile)
// and cloud sync — essentials (auth session, my list) keep the app working.

const KEY = 'sh.consent'

function safeGet () {
  try { return typeof window !== 'undefined' ? window.localStorage?.getItem(KEY) : null } catch { return null }
}
function safeSet (v) {
  try { if (typeof window !== 'undefined') window.localStorage?.setItem(KEY, v) } catch {}
}

export function getConsent () {
  try {
    const raw = safeGet()
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function setConsent (analytics) {
  const rec = { v: 1, analytics: Boolean(analytics), ts: Date.now() }
  safeSet(JSON.stringify(rec))
  return rec
}

// Non-essential persistence allowed? (defaults to true only after "Accept all")
export function canPersonalize (consent) {
  return consent?.analytics === true
}
