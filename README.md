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

### ⏯️ Continue Watching + recommendations
- Playback position (real streams *and* simulated previews) is saved per title/episode and surfaces as a **"Continue Watching for {profile}"** row with red progress bars — click play to **resume where you left off**
- Finishing a title (97%+) auto-clears it; a **"Because you watched …"** row recomputes from your most recent watch
- The player exposes real **subtitle / audio-track / quality menus** when the HLS stream carries them (try *Elephants Dream*), plus **Picture-in-Picture**

### 💡 Roadmap ideas
Kids-mode maturity lock per profile · Skip-Intro markers · thumbs-based taste profiling that reorders shelves · watch-party sync (WebRTC) · PWA install + offline caching of artwork · Chromecast/AirPlay via Remote Playback API · i18n (EN/HI) · downloads queue · per-title user ratings · A/B row ordering analytics

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
public/backdrops/          AI-generated hero backdrops
src/
  data/catalog.js          52 fictional titles + row curation + search/more-like-this
  utils/sound.js           WebAudio "ta-dum" + chime
  components/
    Boot.jsx               power-on splash
    Profiles.jsx           who's watching gate
    Navbar.jsx             glass navbar, search, bell, account
    Hero.jsx               rotating billboard
    Row.jsx / Card.jsx     shelves + hover-expansion poster cards
    Modal.jsx              title details (episodes / similar / trailers)
    Player.jsx             simulated playback
    SearchPage.jsx        _RESULTS grid + related chips
    Footer.jsx
  styles/main.css          full design system
scripts/                   data + SSR checks
```

## ➕ Add a title

Append one object to `RAW` in `src/data/catalog.js` (id, title, type, year, age, genres, palette, pattern, font, synopsis) and reference its id in `ROWS`. Match %, episodes, cast and advisories are generated deterministically — `npm run check:data` verifies everything.

---

*Series Hub is a design study. All titles, artwork and people are fictional.*
