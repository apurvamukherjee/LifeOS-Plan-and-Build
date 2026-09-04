# Supabase setup (optional)

LifeOS runs fully offline with zero Supabase configuration — this is only needed if you want
data to sync/back up across devices. See `docs/ARCHITECTURE.md` ("Local-first, not local-only").

## Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the SQL Editor in your project dashboard, paste the contents of `schema.sql`, and run
   it. (Or, with the `supabase` CLI installed and linked to your project: `supabase db push`.)
   It's safe to re-run — every statement guards against re-creating existing objects.
3. In your Supabase project settings, find the Project URL and the `anon` public API key.
4. Copy `.env.example` to `.env.local` in the repo root and fill in:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Restart `npm run dev`. A sign-in screen will now appear on launch (with a "continue without
   an account" option that keeps the app fully usable, unsynced).

## What this schema does

Mirrors every syncable Dexie table (see `docs/DATA_MODEL.md`) with Row-Level Security scoped to
`user_id = auth.uid()`, and a trigger-maintained `server_updated_at` column used as the sync
cursor (see `docs/SYNC_DESIGN.md` — deliberately separate from the client's own `updated_at`,
which drives last-write-wins merges instead).

Email/password auth is enabled by default in a new Supabase project — no extra configuration
needed for the sign-in screen to work.
