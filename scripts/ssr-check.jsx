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
import { ROWS, FEATURED, byId } from '../src/data/catalog.js'

const noop = () => {}
const handlers = {
  onOpen: noop, onPlay: noop, onToggleList: noop, onRemind: noop,
  inList: () => false, reminded: () => false
}

const cases = {
  Boot: <Boot onDone={noop} />,
  Profiles: <Profiles onPick={noop} />,
  Navbar: <Navbar tab="home" onTab={noop} profile={PROFILES[0]} onSwitchProfile={noop}
            query="" onQuery={noop} searchOpen={true} onToggleSearch={noop} />,
  Hero: <Hero items={FEATURED} onPlay={noop} onInfo={noop} />,
  Row: <Row title={ROWS.home[0].title} items={ROWS.home[0].items} variant="land" {...handlers} />,
  RowTop10: <Row title={ROWS.home[2].title} items={ROWS.home[2].items} variant="top10" {...handlers} />,
  RowOriginals: <Row title={ROWS.home[1].title} items={ROWS.home[1].items} variant="original" {...handlers} />,
  Card: <Card show={byId['neon-district']} variant="land" {...handlers} />,
  CardSoon: <Card show={byId['red-horizon']} variant="land" {...handlers} />,
  ModalSeries: <Modal showId="neon-district" onClose={noop} onPlay={noop} hasInList={() => true}
            onToggleList={noop} onPick={noop} onToast={noop} />,
  ModalFilm: <Modal showId="vermillion" onClose={noop} onPlay={noop} hasInList={() => false}
            onToggleList={noop} onPick={noop} onToast={noop} />,
  Player: <Player showId="iron-harbor" epIdx={0} onClose={noop} onToast={noop} />,
  PlayerReal: <Player showId="big-buck-bunny" epIdx={0} onClose={noop} onToast={noop} />,
  SearchPage: <SearchPage query="neon" onQuery={noop} handlers={handlers} />,
  SearchEmpty: <SearchPage query="zzz nothing" onQuery={noop} handlers={handlers} />,
  SearchBlank: <SearchPage query="" onQuery={noop} handlers={handlers} />,
  Footer: <Footer />
}

let fail = 0
for (const [name, el] of Object.entries(cases)) {
  try {
    const html = renderToString(el)
    if (!html || html.length < 20) throw new Error('suspiciously small output')
    console.log(`ok   ${name.padEnd(14)} ${String(html.length).padStart(6)} bytes`)
  } catch (e) {
    fail++
    console.error(`FAIL ${name}: ${e.message}`)
  }
}
if (fail) { console.error(`${fail} case(s) failed`); process.exit(1) }
console.log('All SSR render checks passed.')
