// Cookie & storage consent. Series Hub stores data in localStorage (not
// third-party cookies): auth session, profiles, list, progress. Consent lets
// the viewer opt out of OPTIONAL preference storage (likes / taste profile)
// and cloud sync — essentials (auth session, my list) keep the app working.

const KEY = 'sh.consent'

export function getConsent () {
  try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
}

export function setConsent (analytics) {
  const rec = { v: 1, analytics: Boolean(analytics), ts: Date.now() }
  try { localStorage.setItem(KEY, JSON.stringify(rec)) } catch {}
  return rec
}

// Non-essential persistence allowed? (defaults to true only after "Accept all")
export function canPersonalize (consent) {
  return consent?.analytics === true
}
