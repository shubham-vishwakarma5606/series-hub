// Supabase link — auth (Google / GitHub / email magic link) + optional cloud
// sync of the viewer's list, likes, reminders and progress.
//
// Configure two env vars (see .env.example):
//   VITE_SUPABASE_URL=https://<project>.supabase.co
//   VITE_SUPABASE_ANON_KEY=<anon public key>
// When they're missing everything degrades gracefully: the sign-in modal
// explains the setup and the app stays fully functional in guest mode.
//
// Cloud sync is optional and needs the tiny table in supabase/schema.sql
// (row-level security: everyone can only read/write their own row).

const URL = import.meta.env.VITE_SUPABASE_URL || ''
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
export const SUPABASE_READY = /^https:\/\/.+\.supabase\.co/.test(URL) && KEY.length > 20
export const SUPABASE_URL_DISPLAY = URL

let clientP = null
async function getClient () {
  if (!SUPABASE_READY) return null
  if (!clientP) {
    clientP = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(URL, KEY, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: 'sh.sb' }
      })
    ).catch(() => null)
  }
  return clientP
}

export async function getSessionUser () {
  const sb = await getClient()
  if (!sb) return null
  try {
    const { data } = await sb.auth.getSession()
    return data?.session?.user || null
  } catch { return null }
}

export async function onAuthChange (cb) {
  const sb = await getClient()
  if (!sb) return () => {}
  const { data } = sb.auth.onAuthStateChange((_event, session) => cb(session?.user || null))
  return () => { try { data?.subscription?.unsubscribe() } catch {} }
}

const redirectTo = () => {
  try { return window.location.origin + window.location.pathname } catch { return undefined }
}

export async function signInOAuth (provider) {
  const sb = await getClient()
  if (!sb) return { error: 'Supabase is not configured' }
  const { error } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo: redirectTo() } })
  return { error: error?.message || null }
}

export async function signInEmailOtp (email) {
  const sb = await getClient()
  if (!sb) return { error: 'Supabase is not configured' }
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } })
  return { error: error?.message || null }
}

export async function signOut () {
  const sb = await getClient()
  if (!sb) return
  try { await sb.auth.signOut() } catch {}
}

// ── cloud sync — one JSON row per user (supabase/schema.sql) ───────────────
export const SYNC_KEYS = ['sh.mylist', 'sh.remind', 'sh.likes', 'sh.progress']

function safeLSGet (k) {
  try { return typeof window !== 'undefined' ? window.localStorage?.getItem(k) : null } catch { return null }
}
export function collectLocalSyncPayload () {
  const payload = { at: Date.now() }
  for (const k of SYNC_KEYS) {
    try {
      const raw = safeLSGet(k)
      if (raw) payload[k] = JSON.parse(raw)
    } catch { /* skip */ }
  }
  return payload
}

export async function pullCloud (uid) {
  const sb = await getClient()
  if (!sb || !uid) return { ok: false }
  try {
    const { data, error } = await sb.from('user_data').select('payload').eq('user_id', uid).maybeSingle()
    if (error) return { ok: false, missing: /PGRST205|404|schema cache/i.test(error.message || ''), error: error.message }
    if (!data?.payload) return { ok: false, empty: true }
    return { ok: true, payload: data.payload }
  } catch (e) { return { ok: false, error: String(e?.message || e) } }
}

export async function pushCloud (uid, payload) {
  const sb = await getClient()
  if (!sb || !uid) return { ok: false }
  try {
    const { error } = await sb.from('user_data').upsert({ user_id: uid, payload, updated_at: new Date().toISOString() })
    if (error) return { ok: false, missing: /PGRST205|404|schema cache/i.test(error.message || ''), error: error.message }
    return { ok: true }
  } catch (e) { return { ok: false, error: String(e?.message || e) } }
}
