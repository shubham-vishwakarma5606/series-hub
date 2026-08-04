# 🔑 Supabase — step-by-step setup guide

Everything below is a one-time, ~10-minute setup. The app works in guest mode until you finish it — nothing breaks in between.

Project used by this repo: **jhemzkvgobchadjmqdhu** (`https://jhemzkvgobchadjmqdhu.supabase.co`)

---

## Step 1 — Create the cloud-sync table

Pick **one**:

**A. One command (recommended)** — from this repo, on your own machine/network:

```bash
SUPABASE_DB_URL="postgresql://postgres:<YOUR-DB-PASSWORD>@db.jhemzkvgobchadjmqdhu.supabase.co:5432/postgres" npm run db:push
```

> The DB connection string is at Dashboard → **Connect** → Direct connection. Percent-encode special characters in the password (`$` → `%24`, `@` → `%40`).
> The script verifies the table, the 3 RLS policies and the trigger afterwards.

**B. SQL Editor** — Dashboard → SQL → New query → paste the whole contents of [`supabase/schema.sql`](../supabase/schema.sql) → **Run**.

Expected result: table `public.user_data` (user_id, payload, updated_at) + RLS enabled with
*read own row · insert own row · update own row*.

## Step 2 — Browser keys

`.env.local` in the repo root (already created, gitignored):

```env
VITE_SUPABASE_URL=https://jhemzkvgobchadjmqdhu.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key from Dashboard → Settings → API>
```

The **anon key is safe for the browser** — every read/write goes through the RLS policies from Step 1 (users can only touch their own row). Never use the `service_role` key here.

## Step 3 — Sign-in providers

Dashboard → **Authentication → Providers**:

| Provider | What to do |
|---|---|
| **Email magic link** | Enabled by default — nothing else needed |
| **Google** | Enable → paste *Client ID + Secret* from Google Cloud Console → APIs & Services → Credentials → *Create OAuth client ID* (Web). Google asks for an **Authorized redirect URI** — use the callback URL shown in the Supabase panel: `https://jhemzkvgobchadjmqdhu.supabase.co/auth/v1/callback` |
| **GitHub** | Enable → *Client ID + Secret* from GitHub → Settings → Developer settings → OAuth Apps (same callback URL) |
| Apple / Facebook / phone OTP… | Any provider enabled in the dashboard works with **zero code changes** |

## Step 4 — URLs

Dashboard → **Authentication → URL Configuration**:

- **Site URL**: your main app origin — `http://localhost:5173` in dev, your deployed domain in prod.
- **Redirect URLs**: add every origin the app runs on (one per line): `http://localhost:5173/**`, your production domain, and any preview URL.

OAuth and magic links land back on these origins; if an origin is missing you'll see `redirect_to is not allowed` in the browser console.

## Step 5 — Restart & test

```bash
npm run dev        # or: npm run build && npm run preview
```

1. Click the red **Sign In** pill (navbar) → *Continue with Google* → approve.
2. The account menu now shows your name/email with a green light — **cloud sync on**.
3. Add a title to My List, like something, start playing → open the site on another browser/device, sign in → everything is there.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Toast: *"Cloud sync needs one setup step"* | Step 1 wasn't applied — run `npm run db:push` / the SQL |
| Sign-in redirects to an error | Step 4 — add the origin to Redirect URLs |
| Google button errors instantly | Step 3 — Client ID/Secret wrong, or Google redirect URI doesn't match the callback URL |
| `db:push` says ENETUNREACH/timeout | You're in a network that blocks Postgres (sandbox/CI) — run it locally |
| *password authentication failed* | Percent-encode `$`, `@`, `#`, `%` in the password inside the connection string |

## Security notes

- Never commit `service_role` keys or the `postgresql://postgres:…` string anywhere — `.env.local` is gitignored, keep it that way.
- RLS (not secrecy of the anon key) is what protects user data — `supabase/schema.sql` already restricts every row to its owner.
