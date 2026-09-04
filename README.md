# LifeOS

An offline-first, glassmorphic lifestyle-tracker PWA. All 9 modules from the original spec are
built: **Water, Supplements, Tasks, Medication, Food, Gym, Expenses, Wishlist, Notes** — sharing
one logging/streak/reminder engine, a weekly cross-module coaching summary on Home, and a
particle-burst celebration on goal completion. See [`docs/ROADMAP.md`](docs/ROADMAP.md) for
what's left in Stage 3 and why a few items there are deliberately not built.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. No account or configuration is required — everything runs fully
offline against local IndexedDB storage. The bottom nav covers the 4 daily-habit trackers (Home,
Water, Supplements, Tasks); the other 5 modules are reachable from the cards on Home.

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

Reminders are **in-app only** — they fire via the Notification API while the tab is open and
foregrounded. Web Push (for reminders while the app/tab is closed) is scaffolded on the client
(`src/engine/reminders/pushSubscription.ts`, `public/push-handler.js`) but not wired to a
server, since no backend exists yet to send push payloads. This is a deliberate, honest scoping
decision — see `docs/ARCHITECTURE.md` ("Reminder service"). It matters most for the Medication
module (its page carries an in-app disclaimer about this): don't treat in-app-only reminders as
reliable enough for anything safety-relevant without either a server-side Web Push sender or a
Capacitor native wrapper (see `docs/ROADMAP.md`, Stage 3).

## Documentation

- [`docs/ROADMAP.md`](docs/ROADMAP.md) — Stage 1/2/3 plan and module status
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — technical design (streak engine, sync engine,
  reminder service, glass design system)
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) / [`docs/SYNC_DESIGN.md`](docs/SYNC_DESIGN.md) —
  schema and sync algorithm detail
- [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md) — dated log of what's actually been built
- [`docs/modules/`](docs/modules) — the original per-module specs (all now built; kept as
  design-rationale reference)
- [`docs/ORIGINAL_SPEC.md`](docs/ORIGINAL_SPEC.md) — the full original product research
