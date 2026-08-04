// Aggregation system design for the OTT content platform (Series Hub)
// Constraints: client-side React app + static build. No persistent backend server.

// DATA SOURCES INTEGRATED:
// 1. TMDB  (already in src/utils/tmdb.js) — posters, trailers, ratings, metadata
// 2. OMDB  (already in src/utils/omdb.js) — IMDb-based metadata (key: 7a414862)
// 3. TVDB  (template below) — requires TVDB API v4 key (user-provided)
// 4. Trakt (template below) — requires Trakt client ID/secret (user-provided)
// 5. JustWatch — no official public API; uses web scraping / regional endpoints (see src/utils/justwatch.js)

// ARCHITECTURE:
// Ingestion Layer  → scripts/aggregate.mjs (polls APIs, validates, merges)
// Storage Layer    → public/uploads/aggregated.json + localStorage `sh.custom`
// API Layer        → public/api/content.json (unified static endpoint)
// Front-end        → App.jsx reads aggregated data; TmdbModal + SearchPage use unified fields

// DATA FLOW:
// TMDB / OMDB / TVDB / Trakt → aggregate.mjs → public/uploads/aggregated.json
// Telegram bot uploads → public/uploads/telegram-library.json → merged by App.jsx
// JustWatch scraping (optional) → public/uploads/streaming-availability.json

// RATE LIMIT HANDLING:
// - TMDB: sessionStorage cache (10 min TTL) + debounce
// - OMDB: no explicit rate limit documented; uses basic fetch with error handling
// - TVDB: requires registered token + user PIN; use token refresh flow
// - Trakt: requires OAuth; use refresh token rotation
// - JustWatch: scraping only; no rate guarantees

// DATABASE (static):
// No SQL/Postgres server in this repo. Data is persisted as:
//   - JSON files in public/uploads/
//   - sessionStorage / localStorage in browser
// For production scale, migrate aggregated.json to a real DB (Postgres / Supabase) via the existing Supabase client (src/utils/supabase.js).
