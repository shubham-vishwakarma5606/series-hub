# 🎬 Series Hub

A fully client-side, Netflix-style OTT streaming experience — rebuilt with a **blue · black · red** identity. React 18 + Vite, zero backend, all catalogue data is fictional and generated locally.

![boot](https://img.shields.io/badge/brand-blue%20%F0%9F%94%B5%20black%20%E2%9A%AB%20red%20%F0%9F%94%B4-e50914)

---

## ✨ What's inside

### 🥁 Boot animation
- Power-on splash with rotating blue/red light rays, per-letter logo slam (red `SERIES` / blue `HUB`), light sheen sweep, white flash and a portal-zoom exit
- A synthesized **"ta-dum"** power-on sound (WebAudio — no audio files needed; plays when the browser allows it)
- Click anywhere (or the **Skip Intro** button) to skip

### 👤 Profile gate
- Netflix-style **"Who's watching?"** screen with animated avatar tiles, Kids profile, Add Profile, and a working **Manage Profiles** mode
- Picking a profile triggers the zoom-into-avatar transition + chime
- Profile choice persists in `localStorage`

### 🏠 Browse (the Netflix look)
- Sticky glass navbar that turns solid on scroll — logo, Home / TV Shows / Movies / New & Popular / My List, search, bell with real notification drawer, account dropdown, **Browse** menu on mobile
- **Rotating hero billboard** with three AI-generated cinematic backdrops (blue/red graded), per-letter title animation, match %, maturity box, Play / More Info
- Rows with hover arrows and **Explore All**: Trending Now, **Only on Series Hub** (portrait originals with SH ribbon), **Top 10** with giant outlined numbers, dramas, action, sci-fi, comedy, horror, new releases…
- **Hover expansion cards**: scale-up, light sheen, play / My List / like / more-info buttons, match %, age chip, genres
- Procedural poster art (palette gradients × 9 pattern treatments × 4 display fonts) for 52 fictional titles

### 🔍 Search
- Netflix-style inline navbar search → full results page with "Explore titles related to" chips, graceful empty state

### 🍿 Details modal
- Backdrop hero, metadata column, cast/creator/genres, maturity row
- Tabs: **Episodes** (season selector, thumbnails, hover play), **More Like This** (switch titles instantly), **Trailers & More**

### ▶️ Player — real video playback
- Plays **actual video** (MP4 / WebM / HLS `.m3u8` via hls.js) from any source you are licensed to host — your files, your CDN, or open-license/public-domain streams
- Ships with a **“Playable Now · Free & Open Cinema”** row wired to verified-live, legally streamable Blender Foundation open movies (Big Buck Bunny, Tears of Steel, Elephants Dream — CC-BY 3.0) so Play genuinely works out of the box
- Titles without a source fall back to a marked **simulated preview** (ken-burns footage, rotating light beams, film grain)
- Auto-hiding chrome, seek bar with red knob + buffered track, ±10s, volume, subtitles/quality, **Next Episode**, episode drawer, ended state with Watch Again — plus keyboard shortcuts (`Space` / `←` `→` / `Esc`)
- **Make any title playable**: set `videoUrl` (films) or `episodeVideos: [...]` (series) in `src/data/catalog.js` — see `public/videos/README.txt`. Remote URLs and `.m3u8` streams work; HLS requires CORS-enabled hosting.
- Note: this project does **not** and will not integrate pirated embed providers. Use licensed or open-content sources only.

### 🌐 Live TMDB enrichment (optional, legal)
- Set `VITE_TMDB_API_KEY` (see `.env.example`) and the browse pages gain **live worldwide shelves** — Trending Films/TV, Popular, In Cinemas Now, On The Air — with **real posters, backdrops, metadata and cast** from [TMDB](https://www.themoviedb.org/)
- Their cards open a real-details modal with an **official YouTube trailer player** (youtube-nocookie embed), taglines, cast and TMDB-powered "More Like This"
- 10-minute session cache; entire feature auto-disables when no key is set

### 🔑 Sign in — Supabase (Google / any provider) + cloud sync
- A red **Sign In** pill in the navbar (and the account menu) opens the auth modal: **Continue with Google** / **GitHub** one-tap OAuth — any provider you enable in the Supabase dashboard works with zero code changes — plus passwordless **email magic link**
- Signed-in viewers get **cloud sync**: My List, likes, reminders and Continue Watching pull on login and push (debounced) on change — resume on any device
- **Graceful guest mode**: without keys everything works locally and the modal shows the setup steps
- The Supabase client **lazy-loads as its own chunk** (only when auth is used), like hls.js

**🔗 Linking your own project (2 min, on your machine):**
1. **Create the sync table** — either paste `supabase/schema.sql` into the Dashboard SQL Editor, or run:
   ```bash
   SUPABASE_DB_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" npm run db:push
   ```
   (`scripts/supabase-apply.mjs` applies the schema + verifies the table, the 3 RLS policies and the trigger. The DB connection string is server-only — never commit it; `.env.local` is gitignored.)
2. **Auth providers**: Dashboard → Authentication → Providers → enable **Google** (needs OAuth client credentials from Google Cloud Console — Supabase shows the exact redirect URL to paste) and/or **GitHub**, **email link**, etc. Set *URL Configuration → Site URL* to your app's origin.
3. **Browser keys**: copy `.env.example` → `.env.local`, set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (Dashboard → Settings → API → *anon public* — safe for the browser, RLS does the guarding), restart `npm run dev`.
4. Row-level security means the anon key can only read/write the signed-in user's own row — see `supabase/schema.sql`.

### 🍪 Cookie & storage consent
- One-time consent bar — **Accept all** / **Essential only**. Series Hub stores in localStorage, never ad trackers; essentials = auth session, profile, list. "Essential only" keeps likes/taste session-only and pauses cloud sync

### 📡 Network Status — channel traffic lights
- New **Network Status** screen (navbar link · mobile **Status** tab): every stream source is a channel — built-in open-license channels, your uploaded licensed titles, and channels from your streaming API
- Two lights per channel: **availability** (byte-range ping every 25 s with latency in ms) and **playback** (fed live by the player: smooth / buffering / error). The player chrome carries the same LED — 🟢 ok · 🟡 degraded · 🔴 down
- Link your own licensed streaming API via `VITE_STREAM_API_URL` (GET JSON `[{"name","url","cat","showId"}]`). Validated for direct media URLs only (.m3u8/.mpd/.mp4/.webm) — **embed/iframe providers are rejected**; endpoint health (connected in N ms / error) is shown at the top

### ⏯️ Continue Watching + recommendations
- Playback position (real streams *and* simulated previews) is saved per title/episode and surfaces as a **"Continue Watching for {profile}"** row with red progress bars — click play to **resume where you left off**
- Finishing a title (97%+) auto-clears it; a **"Because you watched …"** row recomputes from your most recent watch
- The player exposes real **subtitle / audio-track / quality menus** when the HLS stream carries them (try *Elephants Dream*), plus **Picture-in-Picture**

### 🧒 Kids profile lock
- The **Kids** profile only surfaces TV-PG/PG-13 titles (rows, hero, search, My List, "More Like This"); TMDB shelves and locked-play are hidden/blocked with toasts
- Adults can set a **household PIN** (account menu → *Kids Profile Lock*) — after that, exiting the Kids profile requires the 4-digit PIN pad

### ⏭️ Skip Intro / Skip Recap
- Original series carry per-episode `markers` in `src/data/catalog.js`; during playback the matching **Skip Intro / Skip Recap** pill appears (and broadcasts over Watch Party)

### 🧠 Taste profiling
- 👍 on any card/modal feeds a genre taste-graph (likes × 2, list adds × 0.6, watch history × 0.5)
- Home gets a **"Top Picks for {name}"** shelf and generic shelves reorder by your taste; Top 10 / Originals rows keep editorial order

### 📱 Every device, every ratio
- **Phones** (portrait/landscape): thumb-reachable **bottom app navigation** (Home · New & Hot · Search · Status · My List · Get App), compact heroes, swipe-snapping shelves with no hover arrows, wrap-around player chrome
- **Touch gestures**: tap = show controls, **double-tap left/right = ±10s** with seek flash, scroll-snap cards, `touch-action: manipulation` everywhere (no double-tap zoom lag)
- **Tablets / iPad** (4:3 portrait): resized card grid & hero; **TVs & ultrawide** (≥1900px/≥2500px): wider gutters, larger cards, taller billboard
- **Safe areas**: notch/rounded-corner/gesture-bar insets (`env(safe-area-inset-*)`) across navbar, player, toasts, modals, skip pills; `100dvh` for mobile URL bars; `viewport-fit=cover`
- **Fullscreen button** on any device (+ best-effort landscape lock on phones when entering)
- Installed-app mode (PWA/Capacitor) gets status-bar padding and overscroll containment

### 📦 Mobile app — download link on the website
The site ships its own **download hub** for the Android app, in three places:
- **Footer** — *Get it on Android · APK* and *Instant install · Web App* badges
- **Mobile nav** — a **Get App** tab (Android robot icon)
- **Smart banner** — auto-appears on Android phones browsing the web version (dismissible, remembers the choice)

All three open the **Get the App modal**: APK download button (lights up automatically when an APK is published), instant PWA install, a **QR code** to hand off from desktop to phone, package/version/size metadata, and sideloading instructions.

**Publishing the APK** (no code change needed): drop the signed `series-hub.apk` into `public/downloads/` and flip `"available": true` in `public/downloads/android.json` (or point `url` at a GitHub Releases asset). Full walkthrough in `public/downloads/README.txt`.

Three ways to install:
1. **Android/desktop — one tap**: account menu → *Install Series Hub App* (native `beforeinstallprompt`)
2. **iPhone/iPad**: automatic guidance (“Share → Add to Home Screen”) — standalone mode with custom theme bar + icons
3. **Native store builds**: Capacitor is preconfigured (`capacitor.config.json`, hardened webview flags) —
   ```bash
   npm run cap:android   # adds android/ project (needs Android Studio SDK)
   npm run cap:ios       # adds ios/ project (needs macOS + Xcode)
   npm run cap:sync      # rebuild web assets + copy into native projects
   ```

### 🔐 Security
- **Content Security Policy** injected into production builds (`script-src 'self'`, no iframes except youtube-nocookie, `object-src 'none'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`) — dev mode stays HMR-friendly
- Household **PINs stored salted + SHA-256 hashed** (WebCrypto), legacy plaintext auto-upgrades; trailer iframes run in a **`sandbox`**
- **Cookie/storage consent** gates non-essential persistence; Supabase sync rows are protected by **row-level security** (see `supabase/schema.sql`); OAuth tokens never touch app code — handled by Supabase Auth in its own storage namespace
- `referrer: strict-origin-when-cross-origin`, `noreferrer` on external links, no secrets in the repo (TMDB/Supabase keys live in gitignored `.env.local`)


### 🎉 Watch Party
- Player people-icon → start a room (4-letter code) or paste a code; **play / pause / seek / episode changes sync live** across tabs, with invite-link copy and presence count
- Transport is `BroadcastChannel` (works across tabs of one browser — open the invite link in a second tab to try); swap `src/utils/party.js` for a WebSocket/WebRTC adapter to go multi-device without touching app code

### 📺 Chromecast / AirPlay
- Real streams get a **Cast button** via the Remote Playback API when a device is in range; chrome shows *PLAYING ON TV* while connected

### 🗃️ Bring-your-own catalogue
- Account menu → **Upload Licensed Titles**: paste/upload a JSON manifest of content you own/are licensed to host (schema + validator built in, per-entry error report) — valid titles merge into the catalogue, TMDB-style card, playable player, plus a **"Your Licensed Library"** shelf; removals supported


### 📌 My List + Reminders + Toasts
- Add/remove titles from card hovers, modal and "More Like This" — persisted in `localStorage`
- Coming-soon titles get a **Remind Me** bell; every action confirms with a toast

---

## 🚀 Quickstart

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build:

```bash
npm run build
npm run preview    # http://localhost:4173
```

> Boot animation runs once per visit. Sign out (account menu → *Sign out of Series Hub*) to re-see the profile gate; clear `localStorage` keys `sh.*` for a clean first run.

## 🧪 Checks

```bash
npm run check:data   # catalogue integrity (ids, rows, featured lineup)
npm run check:ssr    # server-renders every screen/component and asserts output
npm run db:push      # (on your machine) apply supabase/schema.sql to your database
```

## 🎨 Brand tokens

Defined once in `src/styles/main.css`:

| Token | Value | Use |
|---|---|---|
| `--red` | `#e50914` | primary brand / CTAs / seek bar / badges |
| `--blue` | `#2e93ff` | accents, focus rings, "add" states, notifications |
| `--bg` | `#05060a` | page black |
| `--panel` | `#0d111a` | surfaces |
| `--green` | `#46d369` | "97% Match" indicator |

## 🗂️ Project structure

```
public/
  backdrops/               AI-generated hero backdrops
  icons/                   app/PWA icons
  videos/                  drop-in folder for self-hosted licensed MP4s
  downloads/               Android APK drop-in — android.json switches the website link on
  manifest.webmanifest     installable-app metadata
  sw.js                    offline precache (artwork, fonts)
src/
  data/catalog.js          55 titles + row curation + search/more-like-this
  data/streams.js          channel registry + streaming-API adapter (legal/direct only)
  utils/                   sound · tmdb · ratings · pin · party · library · appStore
                           supabase (auth+sync) · cookies (consent) · health (probes)
  components/
    Boot.jsx               power-on splash
    Profiles.jsx           who's watching gate
    Navbar.jsx             glass navbar, search, bell, account, Sign In
    Hero.jsx               rotating billboard
    Row.jsx / Card.jsx     shelves + hover-expansion poster cards
    Modal.jsx              title details (episodes / similar / trailers)
    Player.jsx             real MP4/HLS playback + live health LED
    AuthModal.jsx          Google/GitHub/email sign-in (Supabase, guest fallback)
    Channels.jsx           Network Status — channel traffic lights
    CookieConsent.jsx      storage consent bar
    GetApp.jsx             Android download hub: modal (APK + PWA + QR) + smart banner
    MobileNav.jsx          thumb-reachable bottom app navigation
    SearchPage.jsx         RESULTS grid + related chips
    Footer.jsx             badges, links, TMDB attribution
  styles/main.css          full design system
scripts/                   data + SSR checks
supabase/schema.sql        cloud-sync table with row-level security
capacitor.config.json      native shell config (com.serieshub.app)
```

## ➕ Add a title

Append one object to `RAW` in `src/data/catalog.js` (id, title, type, year, age, genres, palette, pattern, font, synopsis) and reference its id in `ROWS`. Match %, episodes, cast and advisories are generated deterministically — `npm run check:data` verifies everything.

---

*Series Hub is a design study. All titles, artwork and people are fictional.*
