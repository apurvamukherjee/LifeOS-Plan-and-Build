# LifeOS

An offline-first, glassmorphic lifestyle-tracker PWA. This is the Stage 1 MVP: a shared
logging/streak/reminder engine plus three modules — **Water**, **Supplements**, **Tasks**.
Six more modules (Medication, Food, Gym, Expenses, Wishlist, Notes) are documented but not yet
built — see [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. No account or configuration is required — everything runs fully
offline against local IndexedDB storage.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production (`dist/`)
- `npm run preview` — serve the production build locally (useful for testing offline/PWA behavior)
- `npm run test` — run the unit test suite once
- `npm run test:watch` — run tests in watch mode
- `npm run lint` — run oxlint

In dev mode, run `__lifeosSeed()` in the browser devtools console to populate sample data
(see `src/dev/seed.ts`).

## Optional: cloud sync via Supabase

The app is local-first — Dexie/IndexedDB is the only thing the UI ever reads from, and it works
with zero configuration. If you want your data to sync/back up across devices, follow
[`supabase/README.md`](supabase/README.md) to create a free Supabase project, apply
`supabase/schema.sql`, and set `.env.local` from `.env.example`. Without that, the app runs in
pure local-only mode and a sign-in screen never even appears.

## Known limitation: reminders

Reminders are **in-app only** in this MVP — they fire via the Notification API while the tab is
open and foregrounded. Web Push (for reminders while the app/tab is closed) is scaffolded on the
client (`src/engine/reminders/pushSubscription.ts`, `public/push-handler.js`) but not wired to a
server, since no backend exists yet to send push payloads. This is a deliberate, honest scoping
decision — see `docs/ARCHITECTURE.md` ("Reminder service") — and matters most if a future
Medication module is built: don't treat this as reliable enough for anything safety-relevant
without either a server-side Web Push sender or a Capacitor native wrapper (see
`docs/ROADMAP.md`, Stage 3).

## Documentation

- [`docs/ROADMAP.md`](docs/ROADMAP.md) — Stage 1/2/3 plan and module status
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — technical design (streak engine, sync engine,
  reminder service, glass design system)
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) / [`docs/SYNC_DESIGN.md`](docs/SYNC_DESIGN.md) —
  schema and sync algorithm detail
- [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md) — dated log of what's actually been built
- [`docs/modules/`](docs/modules) — condensed specs for the deferred Stage 2 modules
- [`docs/ORIGINAL_SPEC.md`](docs/ORIGINAL_SPEC.md) — the full original product research
