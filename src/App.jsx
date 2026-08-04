import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Boot from './components/Boot.jsx'
import Profiles, { PROFILES } from './components/Profiles.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Row from './components/Row.jsx'
import Card from './components/Card.jsx'
import Modal from './components/Modal.jsx'
import Player from './components/Player.jsx'
import SearchPage from './components/SearchPage.jsx'
import Footer from './components/Footer.jsx'
import Logo from './components/Logo.jsx'
import TmdbShelves from './components/TmdbShelf.jsx'
import TmdbModal from './components/TmdbModal.jsx'
import KidsPin from './components/KidsPin.jsx'
import LibraryManager from './components/LibraryManager.jsx'
import MobileNav from './components/MobileNav.jsx'
import { GetAppModal, AppBanner } from './components/GetApp.jsx'
import AuthModal from './components/AuthModal.jsx'
import CookieConsent from './components/CookieConsent.jsx'
import Channels from './components/Channels.jsx'
import { ROWS, FEATURED, SHOWS, byId, moreLikeThis } from './data/catalog.js'
import { kidsAllowed } from './utils/ratings.js'
import { hashPin } from './utils/pin.js'
import { getConsent } from './utils/cookies.js'
import {
  SUPABASE_READY, getSessionUser, onAuthChange, signOut,
  SYNC_KEYS, collectLocalSyncPayload, pullCloud, pushCloud
} from './utils/supabase.js'

const read = (k, fb) => {
  try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb } catch { return fb }
}

const KEEP_RORDER = ['top10', 'originals', 'continue', 'playnow', 'custom', 'byw']

export default function App () {
  const [screen, setScreen] = useState('boot') // boot -> profiles -> app
  const [profile, setProfile] = useState(() => read('sh.profile', null))
  const [myList, setMyList] = useState(() => new Set(read('sh.mylist', [])))
  const [reminded, setReminded] = useState(() => new Set(read('sh.remind', [])))
  const [likes, setLikes] = useState(() => read('sh.likes', {}))
  const [tab, setTab] = useState('home')
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [modalId, setModalId] = useState(null)
  const [tmdbSel, setTmdbSel] = useState(null) // { type, id, trailer }
  const [player, setPlayer] = useState(null) // { showId, epIdx, startAt }
  const [progress, setProgress] = useState(() => read('sh.progress', {}))
  const [pinAsk, setPinAsk] = useState(null) // 'exit' | 'setup'
  const [libOpen, setLibOpen] = useState(false)
  const [installEvt, setInstallEvt] = useState(null)
  const [getAppOpen, setGetAppOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [consent, setConsent] = useState(() => getConsent())
  const [liveHealth, setLiveHealth] = useState({}) // channelId/url -> { state, detail, at }

  // optional-storage consent: likes/taste persist unless "Essential only"
  const allowTaste = consent?.analytics !== false
  const [partyCode] = useState(() => {
    try {
      const c = new URLSearchParams(window.location.search).get('party')
      if (c) window.history.replaceState({}, '', window.location.pathname)
      return c || null
    } catch { return null }
  })
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const say = useCallback((msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const persist = (k, set) => {
    try { localStorage.setItem(k, JSON.stringify([...set])) } catch {}
  }

  // ── profile / kids helpers ────────────────────────────────────────────────
  const storedPin = () => { try { return JSON.parse(localStorage.getItem('sh.pin')) } catch { return null } }
  const allowed = useCallback((s) => !profile?.kids || kidsAllowed(s), [profile])

  const pickProfile = (p) => {
    setProfile(p)
    try { localStorage.setItem('sh.profile', JSON.stringify(p)) } catch {}
    setScreen('app')
  }

  const switchProfile = () => {
    try { localStorage.removeItem('sh.profile') } catch {}
    setProfile(PROFILES[0])
    setScreen('profiles')
  }

  const guardedSwitch = () => {
    if (profile?.kids && storedPin()) setPinAsk('exit')
    else switchProfile()
  }

  // ── my list / remind / likes ──────────────────────────────────────────────
  const hasInList = useCallback((s) => myList.has(typeof s === 'string' ? s : s.id), [myList])

  const toggleList = useCallback((show) => {
    setMyList((prev) => {
      const next = new Set(prev)
      const id = show.id
      if (next.has(id)) { next.delete(id); say(`Removed “${show.title}” from My List`) }
      else { next.add(id); say(`Added “${show.title}” to My List`) }
      persist('sh.mylist', next)
      return next
    })
  }, [say])

  const toggleRemind = useCallback((show) => {
    setReminded((prev) => {
      const next = new Set(prev)
      if (next.has(show.id)) { next.delete(show.id); say('Reminder removed') }
      else { next.add(show.id); say(`We’ll remind you when “${show.title}” arrives`) }
      persist('sh.remind', next)
      return next
    })
  }, [say])

  const toggleLike = useCallback((show) => {
    const on = !likes[show.id]
    setLikes((prev) => {
      const next = { ...prev, [show.id]: on ? 1 : 0 }
      if (allowTaste) { try { localStorage.setItem('sh.likes', JSON.stringify(next)) } catch {} }
      return next
    })
    say(on
      ? `Liked “${show.title}” — more ${show.genres[0]} coming your way${allowTaste ? '' : ' (session only — cookie choice)'}`
      : 'Preference updated')
  }, [likes, say, allowTaste])

  // ── playback / progress ───────────────────────────────────────────────────
  const openModal = useCallback((show) => {
    if (profile?.kids && !kidsAllowed(show)) { say(`“${show.title}” isn’t available on the Kids profile`); return }
    setModalId(show.id)
  }, [profile, say])

  const play = useCallback((show, epIdx = 0, startAt = 0) => {
    if (profile?.kids && !kidsAllowed(show)) { say(`“${show.title}” isn’t available on the Kids profile`); return }
    setPlayer({ showId: show.id, epIdx, startAt })
  }, [profile, say])

  const openTmdb = useCallback((item, trailer = false) => setTmdbSel({ type: item.type, id: item.id, trailer }), [])

  const saveProgress = useCallback((rec) => {
    const pct = rec.dur ? rec.t / rec.dur : 0
    const key = `${rec.showId}:${rec.ep}`
    setProgress((prev) => {
      if (rec.t <= 25 && !prev[key]) return prev
      const next = { ...prev }
      if (pct >= 0.97) delete next[key]
      else if (rec.t > 25) next[key] = rec
      try { localStorage.setItem('sh.progress', JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  // ── derived shelves: continue watching / because you watched / top picks ──
  const continueItems = useMemo(() => Object.values(progress)
    .filter((r) => r.dur && r.t > 25 && r.t / r.dur < 0.97 && byId[r.showId])
    .sort((a, b) => b.at - a.at)
    .slice(0, 12)
    .map((r) => ({ ...byId[r.showId], _pct: r.t / r.dur, _ep: r.ep, _t: r.t })), [progress])

  const lastWatched = useMemo(() => Object.values(progress)
    .sort((a, b) => b.at - a.at)
    .map((r) => byId[r.showId])
    .find(Boolean), [progress])

  // taste graph: likes weigh most, then list adds, then watch history
  const taste = useMemo(() => {
    const g = {}
    for (const [id, v] of Object.entries(likes)) {
      if (v && byId[id]) byId[id].genres.forEach((x) => { g[x] = (g[x] || 0) + 2 })
    }
    for (const id of myList) byId[id]?.genres.forEach((x) => { g[x] = (g[x] || 0) + 0.6 })
    for (const r of Object.values(progress)) byId[r.showId]?.genres.forEach((x) => { g[x] = (g[x] || 0) + 0.5 })
    return g
  }, [likes, myList, progress])
  const hasTaste = Object.values(taste).some((v) => v >= 2)
  const scoreItem = useCallback((s) => s.genres.reduce((a, g) => a + (taste[g] || 0), 0), [taste])

  const customItems = useMemo(() => SHOWS.filter((s) => s.custom), [])

  const heroItems = useMemo(() => (
    profile?.kids ? SHOWS.filter(kidsAllowed).slice(0, 3) : FEATURED
  ), [profile])

  const rows = useMemo(() => {
    const dyn = []
    if (tab === 'home') {
      if (customItems.length && !profile?.kids) {
        dyn.push({ key: 'custom', title: 'Your Licensed Library', variant: 'land', items: customItems })
      }
      if (continueItems.length) {
        dyn.push({ key: 'continue', title: `Continue Watching for ${profile?.name || 'You'}`, variant: 'land', items: continueItems.filter(allowed) })
      }
      if (lastWatched) {
        dyn.push({ key: 'byw', title: `Because you watched “${lastWatched.title}”`, variant: 'land', items: moreLikeThis(lastWatched, 12) })
      }
      if (hasTaste) {
        dyn.push({
          key: 'picks', title: `Top Picks for ${profile?.name || 'You'}`, variant: 'land',
          items: [...SHOWS].filter((s) => !s.comingSoon).sort((a, b) => scoreItem(b) - scoreItem(a)).slice(0, 12)
        })
      }
    }
    let out = [...dyn, ...(ROWS[tab] || ROWS.home)]
    out = out.map((r) => ({ ...r, items: r.items.filter(allowed) })).filter((r) => r.items.length)
    if (hasTaste) {
      out = out.map((r) => KEEP_RORDER.includes(r.key) ? r : { ...r, items: [...r.items].sort((a, b) => scoreItem(b) - scoreItem(a)) })
    }
    return out
  }, [tab, customItems, continueItems, lastWatched, hasTaste, allowed, profile, scoreItem])

  // ── PWA install prompt (Chrome/Edge) + iOS guidance ──────────────────────
  useEffect(() => {
    const onBip = (e) => { e.preventDefault(); setInstallEvt(e) }
    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  const isIOS = typeof navigator !== 'undefined' &&
    (/iP(hone|ad|od)/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  const isStandalone = typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true)
  const installAvailable = Boolean(installEvt) || (isIOS && !isStandalone)

  const onInstall = useCallback(async () => {
    if (installEvt) {
      try {
        const r = await installEvt.prompt()
        say(r?.outcome === 'accepted' ? 'Installing Series Hub…' : 'Install dismissed')
      } catch { say('Install is not available right now') }
      setInstallEvt(null)
    } else if (isIOS) {
      say('iPhone/iPad: tap Share ⎋ → “Add to Home Screen”')
    }
  }, [installEvt, isIOS, say])

  // ── Supabase auth: restore session + react to OAuth/magic-link sign-ins ──
  useEffect(() => {
    if (!SUPABASE_READY) return undefined
    let mounted = true
    let off = () => {}
    getSessionUser().then((u) => { if (mounted) setUser(u) })
    onAuthChange((u) => { if (mounted) setUser(u) }).then((fn) => { off = fn || off })
    return () => { mounted = false; off() }
  }, [])

  // cloud sync — pull once per login, debounced push on local changes
  const fromCloud = useRef(false)
  const toldMissing = useRef(false)
  const userId = user?.id || null
  useEffect(() => {
    if (!userId) return undefined
    let on = true
    pullCloud(userId).then((r) => {
      if (!on || !r.ok) {
        if (r?.missing && !toldMissing.current) { toldMissing.current = true; say('Cloud sync needs one setup step — run supabase/schema.sql in your Supabase project') }
        return
      }
      fromCloud.current = true
      const p = r.payload || {}
      for (const k of SYNC_KEYS) if (p[k] != null) { try { localStorage.setItem(k, JSON.stringify(p[k])) } catch {} }
      setMyList(new Set(p['sh.mylist'] || []))
      setReminded(new Set(p['sh.remind'] || []))
      setLikes(p['sh.likes'] || {})
      setProgress(p['sh.progress'] || {})
      say('Signed in — My List, likes & progress synced from your account ☁️')
      setTimeout(() => { fromCloud.current = false }, 300)
    })
    return () => { on = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    if (!userId || consent?.analytics !== true || fromCloud.current) return undefined
    const id = setTimeout(() => {
      pushCloud(userId, collectLocalSyncPayload()).then((r) => {
        if (r?.missing && !toldMissing.current) { toldMissing.current = true; say('Cloud sync needs one setup step — run supabase/schema.sql in your Supabase project') }
      })
    }, 1500)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, myList, reminded, likes, progress, consent])

  const onSignOut = useCallback(async () => {
    await signOut()
    setUser(null)
    say('Signed out — your data stays on this device')
  }, [say])

  // live playback health from the player → Network Status dashboard lights
  const handleHealth = useCallback((id, rec) => {
    setLiveHealth((prev) => ({ ...prev, [id]: rec, ...(rec.url ? { [rec.url]: rec } : {}) }))
  }, [])

  useEffect(() => { window.scrollTo({ top: 0 }) }, [tab, searchOpen])

  const onPinDone = async (result) => {
    if (pinAsk === 'exit') {
      if (result?.upgraded) {
        try { localStorage.setItem('sh.pin', JSON.stringify(result.upgraded)) } catch {}
      }
      switchProfile()
    } else if (pinAsk === 'setup' && result?.pin) {
      const rec = await hashPin(result.pin)
      try { localStorage.setItem('sh.pin', JSON.stringify(rec)) } catch {}
      say('Kids profile lock PIN saved')
    }
    setPinAsk(null)
  }

  const myListItems = [...myList].map((id) => byId[id]).filter(Boolean).filter(allowed)

  return (
    <>
      {screen === 'boot' && <Boot onDone={() => setScreen(profile ? 'app' : 'profiles')} />}
      {screen === 'profiles' && <Profiles onPick={pickProfile} />}

      {screen === 'app' && (
        <div className="shell">
          <Navbar
            tab={tab}
            onTab={setTab}
            profile={profile}
            onSwitchProfile={guardedSwitch}
            onKidsSettings={() => setPinAsk('setup')}
            onUpload={() => setLibOpen(true)}
            onInstall={installAvailable ? onInstall : null}
            user={user}
            onAuth={() => setAuthOpen(true)}
            onSignOut={onSignOut}
            query={query}
            onQuery={setQuery}
            searchOpen={searchOpen}
            onToggleSearch={setSearchOpen}
          />

          {searchOpen ? (
            <SearchPage query={query} onQuery={setQuery} showFilter={profile?.kids ? allowed : null} handlers={{
              onOpen: openModal,
              onPlay: play,
              inList: hasInList,
              onToggleList: toggleList,
              onRemind: toggleRemind,
              reminded: (s) => reminded.has(s.id),
              onLike: toggleLike,
              liked: (s) => !!likes[s.id]
            }} />
          ) : tab === 'live' ? (
          <Channels
            live={liveHealth}
            onPlay={(id) => { const s = byId[id]; if (s) play(s) }}
            onToast={say}
          />
        ) : tab === 'mylist' ? (
            <main className="mylist">
              <h1 className="mylist-h">My List</h1>
              {myListItems.length === 0 ? (
                <div className="mylist-empty">
                  <Logo muted />
                  <p>You haven’t added any titles to your list yet.</p>
                  <div style={{ display: 'flex', gap: '.8rem' }}>
                    <button className="btn-info" onClick={() => setTab('home')}><span>Browse titles</span></button>
                    {!profile?.kids && <button className="btn-info" onClick={() => setLibOpen(true)}><span>Upload licensed titles</span></button>}
                  </div>
                </div>
              ) : (
                <div className="sp-grid">
                  {myListItems.map((s) => (
                    <Card key={s.id} show={s} variant="land"
                      onOpen={openModal} onPlay={play} inList={hasInList} onToggleList={toggleList}
                      onRemind={toggleRemind} reminded={(x) => reminded.has(x.id)} onLike={toggleLike} liked={(x) => !!likes[x.id]} />
                  ))}
                </div>
              )}
            </main>
          ) : (
            <main className="browse">
              <Hero items={heroItems} onPlay={(s) => play(s)} onInfo={openModal} />
              <div className="rows">
                {rows.map((r) => (
                  <Row
                    key={r.key}
                    title={r.title}
                    items={r.items}
                    variant={r.variant}
                    onOpen={openModal}
                    onPlay={play}
                    inList={hasInList}
                    onToggleList={toggleList}
                    onRemind={toggleRemind}
                    reminded={(s) => reminded.has(s.id)}
                    onLike={toggleLike}
                    liked={(s) => !!likes[s.id]}
                  />
                ))}
                {!profile?.kids && <TmdbShelves tab={tab} onOpen={openTmdb} />}
              </div>
            </main>
          )}

          <Footer onGetApp={() => setGetAppOpen(true)} />
          <MobileNav
            tab={tab}
            onTab={(k) => { setQuery(''); setSearchOpen(false); setTab(k) }}
            searchOpen={searchOpen}
            onSearch={() => setSearchOpen(true)}
            onGetApp={() => setGetAppOpen(true)}
          />
          <AppBanner onGetApp={() => setGetAppOpen(true)} />
        </div>
      )}

      {modalId && (
        <Modal
          showId={modalId}
          onClose={() => setModalId(null)}
          onPlay={(s, i) => { setModalId(null); play(s, i) }}
          hasInList={hasInList}
          onToggleList={toggleList}
          onPick={(id) => { const s = byId[id]; if (s) openModal(s) }}
          onToast={say}
          allowed={allowed}
          likes={likes}
          onToggleLike={toggleLike}
        />
      )}

      {player && (
        <Player
          showId={player.showId}
          epIdx={player.epIdx}
          startAt={player.startAt}
          partyJoin={partyCode}
          onClose={() => setPlayer(null)}
          onToast={say}
          onProgress={saveProgress}
          onHealth={handleHealth}
        />
      )}

      {tmdbSel && (
        <TmdbModal
          sel={tmdbSel}
          onClose={() => setTmdbSel(null)}
          onPick={(s) => setTmdbSel(s)}
        />
      )}

      {pinAsk && (
        <KidsPin
          mode={pinAsk === 'setup' ? 'setup' : 'verify'}
          expected={storedPin() || undefined}
          title="Kids profile is locked"
          subtitle="Enter the household PIN to leave Kids mode"
          onClose={() => setPinAsk(null)}
          onDone={onPinDone}
        />
      )}

      {libOpen && (
        <LibraryManager
          existingCount={customItems.length}
          onClose={() => setLibOpen(false)}
          onSaved={() => setLibOpen(false)}
          onToast={say}
        />
      )}

      {getAppOpen && (
        <GetAppModal
          onClose={() => setGetAppOpen(false)}
          installEvt={installEvt}
          onInstall={onInstall}
          onToast={say}
        />
      )}

      {authOpen && (
        <AuthModal onClose={() => setAuthOpen(false)} onToast={say} />
      )}

      {screen !== 'boot' && !consent && (
        <CookieConsent onDone={(rec) => { setConsent(rec); say(rec.analytics ? 'Preferences saved — thanks!' : 'Essential-only mode — likes stay session-only') }} />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  )
}
