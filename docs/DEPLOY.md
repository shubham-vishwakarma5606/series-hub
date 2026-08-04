# 🚀 Go live — Series Hub on GitHub Pages (3 steps, ~3 minutes)

Every push to `main` (or the arena branch) will rebuild, re-run the checks, and
redeploy automatically. Every build is **gated**: `check:data` → `check:ssr` →
`build` — a broken build never reaches your visitors.

Live URL once enabled: **https://shubham-vishwakarma5606.github.io/series-hub/**

---

## Step 1 — Add the deploy workflow *(one paste)*

The CI workflow lives in [`DEPLOY-PAGES.yml`](./DEPLOY-PAGES.yml). GitHub treats
workflow files specially, so drop it in via the web UI:

1. Open **github.com/shubham-vishwakarma5606/series-hub** → **Add file → Create new file**
2. As the name, type: `.github/workflows/deploy.yml`
3. Paste the entire contents of `docs/DEPLOY-PAGES.yml` into the editor
4. **Commit changes** (directly to your branch)

## Step 2 — Turn on Pages

1. Repo → **Settings → Pages**
2. **Source: GitHub Actions** *(not "Deploy from branch")*

## Step 3 — Watch it deploy

**Actions** tab → "Deploy Series Hub → GitHub Pages" runs on push (or use
**Run workflow** anytime). ~90 seconds later the green deployment shows the
live URL: `https://shubham-vishwakarma5606.github.io/series-hub/`

---

## Optional — sign-in & extras on the live site

The build reads these **repo secrets** (Settings → Secrets and variables → Actions →
New repository secret). They're the same values as your local `.env.local`:

| Secret | Needed for |
|---|---|
| `VITE_SUPABASE_URL` | Sign-in + cloud sync on the live site |
| `VITE_SUPABASE_ANON_KEY` | Sign-in + cloud sync (anon key is browser-safe; RLS guards data) |
| `VITE_TMDB_API_KEY` | Worldwide trending shelves |
| `VITE_STREAM_API_URL` | Your licensed streaming-API channels |

Without them the live site runs in guest mode — fully browsable, sign-in hidden-setup.

> Then add the Pages origin in Supabase → Authentication → URL Configuration →
> Redirect URLs: `https://shubham-vishwakarma5606.github.io/**` so OAuth/magic
> links are allowed back to the site.

## Why a workflow instead of "Deploy from branch"?

- The checks gate every deployment (data integrity + 29 SSR renders).
- Builds with the correct sub-path base (`VITE_BASE=/series-hub/`) — assets,
  backdrops, icons, manifest and service worker are all base-aware via `src/utils/pub.js`.
- Secrets are injected at build time, never committed.

## Custom domain later?

Settings → Pages → Custom domain, then remove `VITE_BASE` in the workflow (or set
it to `/`) and add a `public/CNAME` file. Everything already adapts.
