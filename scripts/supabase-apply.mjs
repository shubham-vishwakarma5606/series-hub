// Applies supabase/schema.sql to YOUR Supabase database — one command:
//   SUPABASE_DB_URL="postgresql://postgres:****@db.<ref>.supabase.co:5432/postgres" npm run db:push
// or paste SUPABASE_DB_URL once into .env.local (gitignored).
//
// The DB connection string is a SERVER-SIDE secret. This script never prints
// it, never writes it anywhere, and this app itself only needs the public
// anon key in the browser.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function readDbUrl () {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL
  const envFile = join(root, '.env.local')
  if (existsSync(envFile)) {
    const line = readFileSync(envFile, 'utf8').split('\n').find((l) => l.trim().startsWith('SUPABASE_DB_URL='))
    const v = line?.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '')
    if (v) return v
  }
  return null
}

const url = readDbUrl()
if (!url) {
  console.error('✗ No SUPABASE_DB_URL found.\n  Pass it inline:  SUPABASE_DB_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" npm run db:push\n  or add that line to .env.local (gitignored).')
  process.exit(1)
}
if (!/^postgres(ql)?:\/\//.test(url)) {
  console.error('✗ SUPABASE_DB_URL must start with postgresql:// — copy it from Dashboard → Connect.')
  process.exit(1)
}

const schema = readFileSync(join(root, 'supabase', 'schema.sql'), 'utf8')
const host = (() => { try { return new URL(url).host } catch { return '(unparseable)' } })()
console.log(`→ Connecting to ${host} …`)

const client = new pg.Client({
  connectionString: url,
  connectionTimeoutMillis: 9000,
  ssl: { rejectUnauthorized: false } // Supabase direct connections require TLS
})

try {
  await client.connect()
  await client.query(schema)
  console.log('✓ schema.sql applied')

  const t = await client.query(`
    select column_name, data_type
    from information_schema.columns
    where table_schema = 'public' and table_name = 'user_data'
    order by ordinal_position`)
  console.log(`✓ table public.user_data — columns: ${t.rows.map((r) => `${r.column_name} (${r.data_type})`).join(', ') || 'NONE FOUND'}`)

  const p = await client.query(`
    select policyname, cmd from pg_policies
    where schemaname = 'public' and tablename = 'user_data' order by policyname`)
  for (const r of p.rows) console.log(`✓ RLS policy: ${r.policyname} [${r.cmd}]`)

  const rls = await client.query(`select relrowsecurity from pg_class where relname = 'user_data'`)
  console.log(`✓ row-level security enabled: ${rls.rows[0]?.relrowsecurity === true}`)
  console.log('\nDone — cloud sync table is live. Sign in on the site to start syncing.')
} catch (e) {
  const msg = String(e?.message || e)
  if (/ENOTFOUND|ECONNREFUSED|ENETUNREACH|EHOSTUNREACH|ETIMEDOUT|timeout|network/i.test(msg)) {
    console.error(`✗ Cannot reach the database (${msg}).\n  Run this from your own machine/network — sandboxes and some CI runners block outbound Postgres.`)
  } else if (/password authentication failed/i.test(msg)) {
    console.error('✗ Password rejected — if it contains special characters, percent-encode them in the connection string.')
  } else {
    console.error(`✗ Failed: ${msg}`)
  }
  process.exit(1)
} finally {
  await client.end().catch(() => {})
}
