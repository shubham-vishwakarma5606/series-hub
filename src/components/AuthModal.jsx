import { useState } from 'react'
import Logo from './Logo.jsx'
import { SUPABASE_READY, signInOAuth, signInEmailOtp } from '../utils/supabase.js'

// Sign in / sign up — Supabase Auth. Google & GitHub one-tap OAuth (or any
// provider enabled in the Supabase dashboard) + passwordless email link.
// Without env keys the app works as guest and this modal shows setup steps.

const GOOGLE_G = 'M21.35 11.1H12v2.9h5.35c-.5 2.4-2.55 3.9-5.35 3.9a5.9 5.9 0 1 1 0-11.8c1.5 0 2.85.55 3.9 1.45l2.2-2.2A8.9 8.9 0 1 0 12 20.9c4.45 0 8.6-3.2 8.6-8.9 0-.3-.03-.6-.08-.9z'
const GITHUB = 'M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.05.78 2.13v3.16c0 .31.2.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z'

export default function AuthModal ({ onClose, onToast }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')

  const go = async (fn, tag) => {
    setBusy(tag); setErr('')
    const r = await fn()
    setBusy('')
    if (r?.error) setErr(r.error)
    return r
  }

  return (
    <div className="m-wrap" role="dialog" aria-modal="true" aria-label="Sign in to Series Hub" onClick={onClose}>
      <div className="modal auth" onClick={(e) => e.stopPropagation()}>
        <button className="m-close" aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>
        </button>
        <div className="auth-body">
          <Logo />
          <h2 className="auth-h">Sign in to Series Hub</h2>
          <p className="auth-sub">Sync My List, progress and likes across every device.</p>

          {SUPABASE_READY ? (
            <>
              <button className="auth-btn google" disabled={Boolean(busy)}
                onClick={() => go(() => signInOAuth('google'), 'google').then((r) => { if (!r?.error) onToast?.('Redirecting to Google…') })}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d={GOOGLE_G}/></svg>
                <span>{busy === 'google' ? 'Opening Google…' : 'Continue with Google'}</span>
              </button>
              <button className="auth-btn github" disabled={Boolean(busy)}
                onClick={() => go(() => signInOAuth('github'), 'github').then((r) => { if (!r?.error) onToast?.('Redirecting to GitHub…') })}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d={GITHUB}/></svg>
                <span>{busy === 'github' ? 'Opening GitHub…' : 'Continue with GitHub'}</span>
              </button>

              <div className="auth-div"><span>or email me a magic link</span></div>

              {sent ? (
                <p className="auth-sent">✉️ Link sent to <b>{email}</b> — open it on this device to finish signing in.</p>
              ) : (
                <form className="auth-form" onSubmit={(e) => {
                  e.preventDefault()
                  if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('Enter a valid email address'); return }
                  go(() => signInEmailOtp(email), 'email').then((r) => { if (!r?.error) setSent(true) })
                }}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" aria-label="Email address" autoComplete="email" />
                  <button className="auth-btn email" type="submit" disabled={Boolean(busy)}>
                    {busy === 'email' ? 'Sending…' : 'Email me a sign-in link'}
                  </button>
                </form>
              )}
              {err && <p className="auth-err" role="alert">{err}</p>}
              <p className="auth-legal">Any other provider (Apple, Facebook, phone OTP…) can be switched on in the Supabase dashboard — no code change needed.</p>
            </>
          ) : (
            <div className="auth-config">
              <p><b>Auth backend not linked yet.</b> To turn on Google sign-in:</p>
              <ol>
                <li>Create a free project at <code>supabase.com</code></li>
                <li>Enable providers in <code>Authentication → Providers</code> (Google, GitHub…)</li>
                <li>Run <code>supabase/schema.sql</code> from this repo</li>
                <li>Copy <code>.env.example</code> → <code>.env.local</code> and paste your URL + anon key</li>
              </ol>
              <button className="btn-info" onClick={onClose}><span>Continue as guest</span></button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
