-- ═══════════════════════════════════════════════════════════════════════
-- Series Hub · Supabase setup
-- Run this once in: Supabase Dashboard → SQL Editor → New query → RUN.
-- Creates the cloud-sync table used for My List / likes / reminders /
-- Continue Watching. Row Level Security guarantees every account can
-- read and write ONLY its own row (the anon key can't spy on anyone).
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.user_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  payload    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

-- idempotent policies (drop first so re-running this file never errors)
drop policy if exists "read own row"   on public.user_data;
drop policy if exists "insert own row" on public.user_data;
drop policy if exists "update own row" on public.user_data;

create policy "read own row"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "insert own row"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "update own row"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- keep updated_at honest on every write
create or replace function public.touch_user_data_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_user_data_touch on public.user_data;
create trigger trg_user_data_touch
  before update on public.user_data
  for each row execute function public.touch_user_data_updated_at();

-- ── Auth providers ────────────────────────────────────────────────────
-- Google / GitHub / any OAuth provider: enable them in
-- Authentication → Providers. For Google you need OAuth client credentials
-- (Google Cloud Console) with the redirect URL shown in Supabase.
-- Set Authentication → URL Configuration → Site URL to your app's origin.
