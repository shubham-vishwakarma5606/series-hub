import { useCallback, useEffect, useRef, useState } from 'react'
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
import { ROWS, FEATURED, byId } from './data/catalog.js'

const read = (k, fb) => {
  try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb } catch { return fb }
}

export default function App () {
  const [screen, setScreen] = useState('boot') // boot -> profiles -> app
  const [profile, setProfile] = useState(() => read('sh.profile', null))
  const [myList, setMyList] = useState(() => new Set(read('sh.mylist', [])))
  const [reminded, setReminded] = useState(() => new Set(read('sh.remind', [])))
  const [tab, setTab] = useState('home')
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [modalId, setModalId] = useState(null)
  const [player, setPlayer] = useState(null) // { showId, epIdx }
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

  const openModal = useCallback((show) => setModalId(show.id), [])
  const play = useCallback((show, epIdx = 0) => setPlayer({ showId: show.id, epIdx }), [])

  useEffect(() => { window.scrollTo({ top: 0 }) }, [tab, searchOpen])

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

  const handlers = {
    onOpen: openModal,
    onPlay: play,
    inList: hasInList,
    onToggleList: toggleList,
    onRemind: toggleRemind,
    reminded: (s) => reminded.has(s.id)
  }

  const rows = ROWS[tab] || ROWS.home

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
            onSwitchProfile={switchProfile}
            query={query}
            onQuery={setQuery}
            searchOpen={searchOpen}
            onToggleSearch={setSearchOpen}
          />

          {searchOpen ? (
            <SearchPage query={query} onQuery={setQuery} handlers={handlers} />
          ) : tab === 'mylist' ? (
            <main className="mylist">
              <h1 className="mylist-h">My List</h1>
              {myList.size === 0 ? (
                <div className="mylist-empty">
                  <Logo muted />
                  <p>You haven’t added any titles to your list yet.</p>
                  <button className="btn-info" onClick={() => setTab('home')}><span>Browse titles</span></button>
                </div>
              ) : (
                <div className="sp-grid">
                  {[...myList].map((id) => byId[id]).filter(Boolean).map((s) => (
                    <Card key={s.id} show={s} variant="land" {...handlers} />
                  ))}
                </div>
              )}
            </main>
          ) : (
            <main className="browse">
              <Hero items={FEATURED} onPlay={(s) => play(s)} onInfo={openModal} />
              <div className="rows">
                {rows.map((r) => (
                  <Row
                    key={r.key + (myList.size ? '' : '')}
                    title={r.title}
                    items={r.items}
                    variant={r.variant}
                    {...handlers}
                  />
                ))}
              </div>
            </main>
          )}

          <Footer />
        </div>
      )}

      {modalId && (
        <Modal
          showId={modalId}
          onClose={() => setModalId(null)}
          onPlay={(s, i) => { setModalId(null); play(s, i) }}
          hasInList={hasInList}
          onToggleList={toggleList}
          onPick={(id) => setModalId(id)}
          onToast={say}
        />
      )}

      {player && (
        <Player
          showId={player.showId}
          epIdx={player.epIdx}
          onClose={() => setPlayer(null)}
          onToast={say}
        />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  )
}
