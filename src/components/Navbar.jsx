import { useEffect, useRef, useState } from 'react'
import Logo from './Logo.jsx'

const LINKS = [
  ['home', 'Home'],
  ['series', 'TV Shows'],
  ['films', 'Movies'],
  ['fresh', 'New & Popular'],
  ['live', 'Network Status'],
  ['mylist', 'My List']
]

const NOTIFS = [
  { tag: 'New Season Arrival', text: 'NEON DISTRICT — Season 3 is now streaming', time: 'Today', c: ['#071a45', '#0e3aa0'] },
  { tag: 'Because you watched Iron Harbor', text: 'THE UNDERTOW — “a slow-burn masterpiece”', time: '3 days ago', c: ['#03151c', '#11557a'] },
  { tag: 'Reminder', text: 'RED HORIZON premieres this November', time: '1 week ago', c: ['#170607', '#e50914'] }
]

function Avatar ({ profile }) {
  return (
    <span className="nav-avatar" style={{ '--c1': profile.c1, '--c2': profile.c2 }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="33" cy="42" r="6" fill="#05060a" />
        <circle cx="67" cy="42" r="6" fill="#05060a" />
        <path d="M32 60 Q50 78 68 60" stroke="#05060a" strokeWidth="7" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export default function Navbar ({ tab, onTab, profile, onSwitchProfile, onKidsSettings, onUpload, onInstall, user, onAuth, onSignOut, query, onQuery, searchOpen, onToggleSearch }) {
  const [solid, setSolid] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [browseOpen, setBrowseOpen] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { if (searchOpen && inputRef.current) inputRef.current.focus() }, [searchOpen])

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest('.nav-cluster')) { setMenuOpen(false); setBellOpen(false) }
      if (!e.target.closest('.nav-browse-wrap')) setBrowseOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const onSearchKey = (e) => {
    if (e.key === 'Escape') { onQuery(''); onToggleSearch(false) }
  }

  return (
    <header className={`nav${solid || searchOpen ? ' solid' : ''}`}>
      <div className="nav-left">
        <button className="nav-logo" onClick={() => { onQuery(''); onToggleSearch(false); onTab('home') }} aria-label="Series Hub home">
          <Logo />
        </button>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map(([k, label]) => (
            <button key={k} className={`nav-link${tab === k && !searchOpen ? ' active' : ''}`}
              onClick={() => { onQuery(''); onToggleSearch(false); onTab(k) }}>{label}</button>
          ))}
        </nav>
        <div className="nav-browse-wrap">
          <button className="nav-browse" onClick={() => setBrowseOpen((v) => !v)}>
            Browse <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M6 9l6 6 6-6"/></svg>
          </button>
          {browseOpen && (
            <div className="nav-browse-dd" role="menu">
              <span className="dd-caret" />
              {LINKS.map(([k, label]) => (
                <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setBrowseOpen(false); onQuery(''); onToggleSearch(false); onTab(k) }}>{label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="nav-right">
        {!user && (
          <button className="nav-signin" onClick={() => onAuth?.()}>
            Sign In
          </button>
        )}
        <div className={`nav-search${searchOpen ? ' open' : ''}`}>
          <button className="nav-icon" aria-label="Search" onClick={() => onToggleSearch(!searchOpen)}>
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/></svg>
          </button>
          {searchOpen && (
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              onKeyDown={onSearchKey}
              placeholder="Titles, people, genres"
              aria-label="Search titles"
            />
          )}
        </div>

        <div className="nav-cluster">
          <button className="nav-icon" aria-label="Notifications" onClick={() => { setBellOpen((v) => !v); setMenuOpen(false) }}>
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 22a2.4 2.4 0 0 0 2.4-2.4H9.6A2.4 2.4 0 0 0 12 22zm7-6v-5c0-3.1-1.6-5.6-4.5-6.3V3.6a2.5 2.5 0 1 0-5 0v1.1C6.6 5.4 5 7.9 5 11v5l-2 2v1h18v-1l-2-2z"/></svg>
            <span className="nav-dot" aria-hidden="true">{NOTIFS.length}</span>
          </button>
          {bellOpen && (
            <div className="nav-dd notif" role="menu">
              <span className="dd-caret" />
              {NOTIFS.map((n, i) => (
                <button key={i} className="notif-item" onClick={() => setBellOpen(false)}>
                  <span className="notif-art" style={{ '--c1': n.c[0], '--c2': n.c[1] }}><Logo compact /></span>
                  <span className="notif-txt">
                    <em>{n.tag}</em>
                    <b>{n.text}</b>
                    <i>{n.time}</i>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="nav-cluster">
          <button className="nav-profile" onClick={() => { setMenuOpen((v) => !v); setBellOpen(false) }} aria-label="Account">
            <Avatar profile={profile} />
            <span className={`nav-caret${menuOpen ? ' flip' : ''}`} aria-hidden="true" />
          </button>
          {menuOpen && (
            <div className="nav-dd acct" role="menu">
              <span className="dd-caret" />
              {profile.kids ? (
                <>
                  <div className="acct-row">
                    <Avatar profile={profile} />
                    <span>
                      <b>{profile.name}</b>
                      <i className="acct-kids">Kids profile · maturity lock on</i>
                    </span>
                  </div>
                  <hr />
                  <button className="acct-item center" onClick={() => { setMenuOpen(false); onSwitchProfile() }}>
                    Exit Kids profile 🔒
                  </button>
                </>
              ) : (
                <>
                  <div className="acct-row">
                    <Avatar profile={profile} />
                    <span>
                      <b>{profile.name}</b>
                      <button className="acct-link" onClick={() => { setMenuOpen(false); onSwitchProfile() }}>Switch profile</button>
                    </span>
                  </div>
                  <hr />
                  <button className="acct-item" onClick={() => { setMenuOpen(false); onSwitchProfile() }}>Manage Profiles</button>
                  <button className="acct-item" onClick={() => { setMenuOpen(false); onKidsSettings?.() }}>Kids Profile Lock (PIN)</button>
                  <button className="acct-item" onClick={() => { setMenuOpen(false); onUpload?.() }}>Upload Licensed Titles</button>
                  <button className="acct-item">Help Center</button>
                  {onInstall && (
                    <>
                      <hr />
                      <button className="acct-item" onClick={() => { setMenuOpen(false); onInstall() }}>Install Series Hub App</button>
                    </>
                  )}
                  <hr />
                  {user ? (
                    <>
                      <div className="acct-user">
                        <span className="led ok" aria-hidden="true" />
                        <span className="acct-user-txt">
                          <b>{user.user_metadata?.full_name || user.email || 'Signed in'}</b>
                          <i>{user.email ? `${user.email} · ` : ''}cloud sync on</i>
                        </span>
                      </div>
                      <button className="acct-item center" onClick={() => { setMenuOpen(false); onSignOut?.() }}>Sign out account</button>
                    </>
                  ) : (
                    <button className="acct-item center blue" onClick={() => { setMenuOpen(false); onAuth?.() }}>Sign in with Google / email</button>
                  )}
                  <button className="acct-item center" onClick={() => { setMenuOpen(false); onSwitchProfile() }}>Switch profile</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
