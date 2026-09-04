# LifeOS Build Log

Append-only, dated. One entry per build phase (see `docs/ROADMAP.md` for the phase table).

## 2026-09-04 — Phase 0: Planning

- Full product research spec received from user, condensed and preserved at
  `docs/ORIGINAL_SPEC.md`.
- Scope decision: MVP = shared engine + Water + Supplements + Tasks modules only. Medication,
  Food, Gym, Expenses, Wishlist, Notes deferred to Stage 2 with specs written to `docs/modules/`.
- Data layer decision: local-first Dexie (IndexedDB) as the only thing the UI reads from, with
  Supabase layered in as a best-effort background sync target (not a hard dependency).
- Plan cross-checked with a Plan sub-agent specifically on streak-engine DST/timezone/freeze
  correctness and the Dexie↔Supabase sync algorithm (cursor/conflict/id/delete semantics).
  Full plan saved at the session's plan file and reproduced across `docs/ARCHITECTURE.md`,
  `docs/DATA_MODEL.md`, `docs/SYNC_DESIGN.md`.

## 2026-09-04 — Phase 1: Scaffold

- `npm create vite@latest . -- --template react-ts` — scaffolded with React 19.2, Vite 8.2,
  TypeScript 6.0 (newer majors than the original plan assumed; API-compatible for our purposes).
  Template ships `oxlint` instead of ESLint by default — kept as-is rather than adding a
  redundant ESLint setup.
- Installed runtime deps: `react-router-dom dexie dexie-react-hooks motion
  @supabase/supabase-js date-fns date-fns-tz clsx`.
- Installed dev deps: `vite-plugin-pwa tailwindcss @tailwindcss/postcss postcss autoprefixer
  vitest jsdom fake-indexeddb @testing-library/react @testing-library/jest-dom
  @testing-library/user-event prettier`. Tailwind resolved to v4.3.3 — CSS-first config (no
  `tailwind.config.js`; tokens defined via `@theme` in `src/styles/index.css`), configured via
  `@tailwindcss/postcss` in `postcss.config.js`.
- Wrote `docs/` stubs (this file, ROADMAP, ARCHITECTURE, DATA_MODEL, SYNC_DESIGN,
  ORIGINAL_SPEC, and 6 `docs/modules/*.md` deferred-module specs) and `.env.example`.

## 2026-09-05 — Phases 2-8: Core engine + all 3 MVP modules

- **Dexie schema + baseRepo** (`src/db/schema.ts`, `src/db/index.ts`,
  `src/db/repositories/baseRepo.ts`): all 9 tables from docs/DATA_MODEL.md. `baseRepo` stamps
  id/timestamps/syncStatus on every create/update/soft-delete and notifies a small pub/sub
  (`src/engine/sync/syncBus.ts`) so the not-yet-built sync engine has a hook point to subscribe
  to later without baseRepo depending on it directly.
  - TS note: Dexie's `EntityTable<T,'id'>` resisted being used as a shared generic parameter
    type across repo helper functions — its `InsertType`/`IDType` machinery breaks structural
    assignability once genericized. Fixed by (a) declaring a minimal local `WritableTable<T>`
    interface with only the `add`/`update` methods baseRepo actually calls, and (b) always
    passing an explicit type argument at call sites (e.g. `insertRecord<Supplement>(...)`) since
    TypeScript cannot infer `T` from an argument shaped `Omit<T, keyof BaseRecord>`.
- **Streak engine** (`src/engine/streak/`): `dateUtils.ts` (UTC-instant → local-date-string
  conversion, calendar-day diff, day-of-week), `streakEngine.ts` (`recordGoalMet`,
  `settleToDate`), 22 unit tests, all passing.
- **Logging service** (`src/engine/logging/logEvent.ts`): wraps a module's log write and its
  streak update in one Dexie transaction.
- **Water module**: repo, goal (`sum(amountMl today) >= goal`), actions, hooks, quick-add +
  detail UI.
- **Glass UI shell**: design tokens (`src/styles/index.css`, Tailwind v4 `@theme`), `GlassCard`,
  `ProgressRing`, `StatCard`, `Button`, `AppShell`, `BottomNav`, routing (`router.tsx`), bento
  home dashboard (`pages/Home.tsx`).
- **Supplements module**: `cycleLogic.ts` (schedule matching, on/off cycling, creatine-style
  saturation %, low-stock check) with 12 unit tests; repo, goal (`any`/`all-scheduled` modes),
  actions, add-supplement form, list UI with saturation/low-stock badges.
- **Tasks module**: `recurrence.ts` (daily/weekly-with-specific-days/monthly next-due-date
  computation) with 5 unit tests; repo, goal, actions, add-task form, list UI.
  - Design note: completing a recurring task creates a **new** task row for the next occurrence
    rather than resetting the same row's `completedAt` in place — the latter would erase, within
    the same atomic `logEvent` transaction, the exact evidence `tasksGoalEvaluator` needs to see
    "a task was completed today."
- **Verification**: `npx tsc -b` clean; `npx vitest run` — 4 files, 39/39 tests passing. Full
  browser smoke test via a scratch Playwright script against the Vite dev server: logged water,
  added + logged a supplement dose, added + completed a task — progress rings, streaks, and the
  home dashboard all updated correctly, zero console errors, backed by real IndexedDB.

## 2026-09-05 — Phases 9-13: Reminders, Supabase sync, PWA, polish (MVP complete)

- **Reminder service** (`src/engine/reminders/`): `reminderScheduler.ts` (foreground poll, gated
  on Page Visibility + the Notification API — honest about what a PWA can and can't guarantee),
  `pushSubscription.ts` (Web Push subscription capture, no-ops without `VITE_VAPID_PUBLIC_KEY`),
  `public/push-handler.js` (static SW push-event stub, wired in via `vite-plugin-pwa`'s
  `workbox.importScripts` so `generateSW` didn't need to become `injectManifest`). Wired into
  the app via `useAppForegroundEffects` (also settles each module's streak on foreground/visibility
  via `streaksRepo.settleStreak`) and a dismissible `NotificationPermissionBanner` on Home.
- **Supabase**: `supabase/schema.sql` (all 8 syncable tables, RLS scoped to `user_id =
  auth.uid()`, trigger-maintained `server_updated_at` cursor column) + `supabase/README.md`.
  `src/engine/sync/supabaseClient.ts` exports `null` when env vars are absent — verified the app
  still runs error-free with zero Supabase configuration. Auth: `AuthProvider`/`AuthGate`/
  `SignInScreen` (email/password, with a "continue without an account" skip that keeps the app
  fully usable unsynced) — the gate renders children unconditionally when Supabase isn't
  configured, so local-only users never see it.
- **Sync engine** (`src/engine/sync/`): `mappers.ts` (generic shallow camelCase<->snake_case
  field mapping, table-name mapping reuses the same case-converter), `syncMeta.ts` (per-table
  cursor), `syncEngine.ts` (`pushPending`, `pullRemote`, the 4 triggers from
  `docs/SYNC_DESIGN.md`, an in-flight run-or-queue guard). 5 unit tests against a mocked
  Supabase client (hoisted `vi.mock` on `./supabaseClient`) covering: skip-when-signed-out,
  successful push + synced flip, failed push stays pending, remote insert + cursor advance, and
  last-write-wins keeping a newer local row over an older incoming remote one.
- **PWA wiring**: generated branded app icons (192/512/maskable-512 PNG) from a new SVG source
  via a one-off `sharp` script (`public/icons/icon-source.svg`; `sharp` was removed again after
  generating them — it's a build-time tool, not a runtime dependency). Configured
  `vite-plugin-pwa` (manifest, `generateSW` + the push-handler `importScripts`). Verified via
  `npm run build` + `vite preview`: service worker registers and activates, and — with the
  browser context's network fully disabled and the page reloaded — the app shell and previously
  logged data still render correctly with zero console errors.
- **Polish**: `ErrorBoundary` (class component, wraps the app root, shows a reload fallback,
  reassures that local data is safe), `isStreakAtRisk` added to the streak engine (3 more unit
  tests) — true when a streak is active but hasn't been extended yet today, distinct from
  `settleToDate`'s job of detecting one that's already died from a past gap — surfaced via a
  shared `StreakBadge` component used by all three dashboard cards. Dev seed script
  (`src/dev/seed.ts`, exposed as `window.__lifeosSeed` in dev mode) for quickly populating
  realistic sample data (verified live: correctly showed a low-stock badge, a creatine loading-
  phase saturation percentage, and a completed recurring task correctly spawning its next
  instance).
- **Final verification**: `npx tsc -b` clean, `npx vitest run` — 5 files, 47/47 tests passing,
  `npm run build` succeeds. Full browser pass (seed data, all 3 modules, offline reload) — zero
  console errors throughout.

### Notable TS/tooling snags hit and fixed

- Tailwind resolved to v4 (CSS-first `@theme` config, no `tailwind.config.js`) rather than the
  v3 assumed when this was planned — adapted rather than pinning an older major.
- `tsconfig.app.json`'s `baseUrl` is deprecated in TypeScript 6; the `@/*` path alias works fine
  with just `paths` (baseUrl defaults to the tsconfig's own directory).
- `applicationServerKey` for `PushManager.subscribe` needed an explicit `as BufferSource` cast —
  a newer `lib.dom.d.ts` parametrizes `Uint8Array` by buffer type in a way that no longer
  structurally matches `BufferSource` without it.

### Known deferred items (not blocking, noted for later)

- Production bundle is ~511KB (mostly `motion` + `@supabase/supabase-js` + React + Dexie) —
  triggers Vite's chunk-size warning. Worth revisiting with route-level code-splitting in Stage 2
  once more modules (and more bundle weight) are added.
- Light theme, Lottie celebrations, and home-screen widgets from the original design spec are
  intentionally not part of this MVP pass — see `docs/ROADMAP.md` Stage 2/3.
