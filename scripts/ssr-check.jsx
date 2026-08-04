// SSR smoke test — renders every screen/component to string without a browser.
// Build with:  npm run check:ssr
import React from 'react'
import { renderToString } from 'react-dom/server'

import Boot from '../src/components/Boot.jsx'
import Profiles, { PROFILES } from '../src/components/Profiles.jsx'
import Navbar from '../src/components/Navbar.jsx'
import Hero from '../src/components/Hero.jsx'
import Row from '../src/components/Row.jsx'
import Card from '../src/components/Card.jsx'
import Modal from '../src/components/Modal.jsx'
import Player from '../src/components/Player.jsx'
import SearchPage from '../src/components/SearchPage.jsx'
import Footer from '../src/components/Footer.jsx'
import TmdbShelves from '../src/components/TmdbShelf.jsx'
import TmdbModal from '../src/components/TmdbModal.jsx'
import KidsPin from '../src/components/KidsPin.jsx'
import LibraryManager from '../src/components/LibraryManager.jsx'
import MobileNav from '../src/components/MobileNav.jsx'
import { GetAppModal, AppBanner } from '../src/components/GetApp.jsx'
import AuthModal from '../src/components/AuthModal.jsx'
import CookieConsent from '../src/components/CookieConsent.jsx'
import Channels from '../src/components/Channels.jsx'
import { ROWS, FEATURED, byId } from '../src/data/catalog.js'

const noop = () => {}
const handlers = {
  onOpen: noop, onPlay: noop, onToggleList: noop, onRemind: noop,
  inList: () => false, reminded: () => false, onLike: noop, liked: () => false
}

const cases = {
  Boot: <Boot onDone={noop} />,
  Profiles: <Profiles onPick={noop} />,
  Navbar: <Navbar tab="home" onTab={noop} profile={PROFILES[0]} onSwitchProfile={noop}
            query="" onQuery={noop} searchOpen={true} onToggleSearch={noop} />,
  NavbarUser: <Navbar tab="live" onTab={noop} profile={PROFILES[0]} onSwitchProfile={noop}
            user={{ email: 'radhe@example.com', user_metadata: {} }} onAuth={noop} onSignOut={noop}
            query="" onQuery={noop} searchOpen={false} onToggleSearch={noop} />,
  Hero: <Hero items={FEATURED} onPlay={noop} onInfo={noop} />,
  Row: <Row title={ROWS.home[0].title} items={ROWS.home[0].items} variant="land" {...handlers} />,
  RowTop10: <Row title={ROWS.home[3].title} items={ROWS.home[3].items} variant="top10" {...handlers} />,
  RowOriginals: <Row title={ROWS.home[2].title} items={ROWS.home[2].items} variant="original" {...handlers} />,
  Card: <Card show={byId['neon-district']} variant="land" {...handlers} />,
  CardSoon: <Card show={byId['red-horizon']} variant="land" {...handlers} />,
  ModalSeries: <Modal showId="neon-district" onClose={noop} onPlay={noop} hasInList={() => true}
            onToggleList={noop} onPick={noop} onToast={noop} allowed={() => true} likes={{}} onToggleLike={noop} />,
  ModalFilm: <Modal showId="vermillion" onClose={noop} onPlay={noop} hasInList={() => false}
            onToggleList={noop} onPick={noop} onToast={noop} allowed={() => true} likes={{}} onToggleLike={noop} />,
  Player: <Player showId="iron-harbor" epIdx={0} startAt={120} partyJoin={null} onClose={noop} onToast={noop} onProgress={noop} />,
  PlayerReal: <Player showId="big-buck-bunny" epIdx={0} startAt={0} partyJoin={null} onClose={noop} onToast={noop} onProgress={noop} />,
  TmdbShelves: <TmdbShelves tab="home" onOpen={noop} />,        // renders null when no API key — expected
  TmdbModal: <TmdbModal sel={{ type: 'movie', id: 27205, trailer: false }} onClose={noop} onPick={noop} />,
  KidsPin: <KidsPin mode="verify" expected={null} title="Kids profile is locked" onClose={noop} onDone={noop} />,
  LibraryManager: <LibraryManager existingCount={0} onClose={noop} onSaved={noop} onToast={noop} />,
  MobileNav: <MobileNav tab="home" onTab={noop} searchOpen={false} onSearch={noop} onGetApp={noop} />,
  GetAppModal: <GetAppModal onClose={noop} installEvt={null} onInstall={noop} onToast={noop} />,
  AppBannerHidden: <AppBanner onGetApp={noop} />,               // renders '' in SSR (no Android UA)
  AuthModalGuest: <AuthModal onClose={noop} onToast={noop} />,  // guest mode (no Supabase env in CI)
  CookieConsent: <CookieConsent onDone={noop} />,
  Channels: <Channels live={{}} onPlay={noop} onToast={noop} />,
  ChannelsLive: <Channels live={{ 'ch-1': { state: 'slow', detail: 'buffering…', at: Date.now() } }} onPlay={noop} onToast={noop} />,
  SearchPage: <SearchPage query="neon" onQuery={noop} handlers={handlers} />,
  SearchEmpty: <SearchPage query="zzz nothing" onQuery={noop} handlers={handlers} />,
  SearchBlank: <SearchPage query="" onQuery={noop} handlers={handlers} />,
  Footer: <Footer onGetApp={noop} />
}

let fail = 0
for (const [name, el] of Object.entries(cases)) {
  try {
    const html = renderToString(el)
    if (html == null) throw new Error('render returned null/undefined')
    console.log(`ok   ${name.padEnd(14)} ${String(html.length).padStart(6)} bytes`)
  } catch (e) {
    fail++
    console.error(`FAIL ${name}: ${e.message}`)
  }
}
if (fail) { console.error(`${fail} case(s) failed`); process.exit(1) }
console.log('All SSR render checks passed.')
