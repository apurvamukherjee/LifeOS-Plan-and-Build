# LifeOS Architecture

## Stack

React 19 + TypeScript + Vite 8, Tailwind CSS v4 (CSS-first config via `@theme`, no
`tailwind.config.js`), `motion` (Framer Motion) for animation, `dexie` + `dexie-react-hooks` for
local-first storage, `@supabase/supabase-js` for auth + sync, `react-router-dom`, `date-fns` /
`date-fns-tz` for timezone-safe date math, `vite-plugin-pwa` for the service worker/manifest,
`vitest` + `fake-indexeddb` for testing.

## Layering

```
UI components (dumb, presentational)
    ↑ reads via
module hooks (useWaterToday, useSupplements, useTasks, ...)   — live queries
    ↑ reads/writes via
repositories (waterRepo, supplementsRepo, tasksRepo, ...)      — Dexie CRUD + id/timestamp/syncStatus stamping
    ↑ used by
engine/
  logging/logEvent.ts   — atomic "log + update streak" transaction
  streak/streakEngine.ts — pure, framework-free state machine
  sync/syncEngine.ts     — Dexie ↔ Supabase background sync (best-effort, never blocks UI)
  reminders/             — in-app scheduling + push-subscription scaffold
    ↓ persists to
db/index.ts (Dexie)  ⇄ (best-effort background sync) ⇄  Supabase (Postgres + Auth)
```

Data flows one direction into components: `db → repo → hook → component`. Components never
touch Dexie or Supabase directly.

## Local-first, not local-only

Dexie/IndexedDB is the **only** thing the UI reads from — every read is a local Dexie live
query. Supabase is a sync target the app pushes to / pulls from in the background; the app must
work with zero network and zero Supabase configuration. If `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY` are absent, `supabaseClient.ts` exports `null` and every sync-engine
function no-ops immediately (returns `{skipped: true}`), never throwing.

**Manual setup step:** create a free project at supabase.com, apply `supabase/schema.sql` to it
(via the Supabase SQL editor or the `supabase` CLI), then copy its URL + anon key into
`.env.local` (see `.env.example`). Until that's done, the app is fully functional in
local-only mode — this is by design.

## Streak engine

See [`docs/DATA_MODEL.md`](./DATA_MODEL.md) for the `streaks` table shape. Full design:

- **Timezone safety:** a UTC instant is converted to a local `YYYY-MM-DD` string exactly once
  (`toLocalDateString`, via `date-fns-tz`, reading the device's *current* IANA zone at
  evaluation time — never cached). Every other computation (gaps, milestones) works on that
  date string via UTC-anchored `Date.UTC` arithmetic, which has no DST, so DST bugs are
  structurally avoided. Travelling to a new timezone "just works" — the next evaluation uses
  the new zone's "today," and any resulting gap is handled by the ordinary freeze/reset rules.
- **`recordGoalMet(state, localDate, config)`** — call after a log write once today's goal is
  met. Idempotent same-day. Contiguous day → `currentStreak += 1`. Gap of `missedDays` ≤
  `freezesAvailable` → bridge the gap (consume that many freezes, record the dates). Gap
  exceeding available freezes → reset `currentStreak` to 1 (`longestStreak` preserved). Every 7
  days of streak → regenerate 1 freeze, capped at 2 banked.
- **`settleToDate(state, todayLocalDate, config)`** — call on app foreground/interval to detect
  a streak that already died from an uncovered gap, without a new success event. Never consumes
  freezes (only `recordGoalMet` does, only at the moment a gap is actually bridged) — this is
  what prevents double-spending a freeze between the two functions.
- **Atomicity:** `logEvent()` wraps the log-row insert and the streak read/write in one
  `db.transaction('rw', [logTable, streaksTable], ...)`, so a UI action never leaves the log
  written with a stale streak.
- **`goalNewlyMet`:** `logEvent()` returns `{ result, goalNewlyMet }` — `goalNewlyMet` is true
  only on the crossing edge (the goal was unmet immediately before this write and is met
  immediately after), computed by comparing the streak's `lastCompletedLocalDate` to today
  *before* calling `recordGoalMet`. Every module's action function checks this and fires
  `engine/celebration/celebrationBus.triggerCelebration()` when true — see "Celebration system"
  below. This is what stops a celebration from re-firing on every repeat log once a goal is
  already met for the day.

## Sync engine

Guiding rule: **local writes always succeed first; sync is best-effort and must never throw to
the caller or block the UI.**

- **ID strategy:** `crypto.randomUUID()` generated client-side, reused verbatim as the Postgres
  primary key — `upsert(rows, {onConflict:'id'})` means there is no server-side id remapping and
  no collision handling needed.
- **Cursor:** each Postgres table has a trigger-maintained `server_updated_at timestamptz
  default now()` — the server's own clock, immune to client clock skew. `syncMeta` (Dexie,
  never synced) stores the max `server_updated_at` seen per table; pulls query
  `server_updated_at > cursor`, and the cursor is persisted after every page (not just at the
  end) so an interrupted backfill resumes near where it stopped.
- **Merge:** last-write-wins on the client's own `updatedAt` field (a business timestamp,
  deliberately separate from the sync cursor). `deleted` is an ordinary synced boolean, merged
  by the same rule — no tombstone special-casing. Soft-deleted rows are retained indefinitely
  (acceptable storage cost at personal-use data volumes).
- **First login / backfill:** `syncMeta` cursor defaults to epoch, so a fresh device's first
  pull gets full history. On sign-in, `pushPending()` runs *before* the first `pullRemote()` so
  any rows created locally pre-login get stamped with the now-known `auth.uid()` and pushed up
  first — ordinary id-match/LWW handles the merge, no bespoke first-login branch.
- **Triggers:** app load (post-auth-resolve), the browser `online` event, a visibility-gated
  ~60s interval, and a ~3s debounce after each local write. An in-flight guard collapses
  overlapping triggers to "one running + at most one queued."
- **`syncStatus: 'conflict'`** is schema-reserved but unused by this MVP's LWW logic — a Stage 2
  hook for real conflict detection if multi-device simultaneous-offline editing ever matters.

## Reminder service

MVP scope is honest about PWA background-execution limits: **in-app reminders only** — a
foreground interval + Page Visibility API + the Notification API fire reminders while the app
is open/foregrounded. Web Push (VAPID) is **not** wired end-to-end — no server function exists
yet to send pushes — but the client plumbing is scaffolded so a Stage 2 server piece (e.g. a
Supabase Edge Function) plugs in without rework: `pushSubscription.ts` captures/stores a push
subscription (no-ops if `VITE_VAPID_PUBLIC_KEY` is absent), and `public/push-handler.js` is a
static `self.addEventListener('push', ...)` stub wired into the Workbox-generated service
worker via `VitePWA({ workbox: { importScripts: ['push-handler.js'] } })` — this keeps
`generateSW` (no need for `injectManifest`) while still allowing custom push-event code.

**Do not treat this as reliable for anything safety-relevant** (e.g. a future Medication
module). If reminder timeliness ever matters that much, see the Capacitor note in
`docs/ROADMAP.md` Stage 3.

## Celebration system

`engine/celebration/celebrationBus.ts` is a tiny pub/sub (same shape as `engine/sync/syncBus.ts`)
so any module's action function can fire a celebration without importing the UI layer.
`components/ui/CelebrationOverlay.tsx` is mounted once near the app root (`App.tsx`) and
subscribes; on trigger it renders a burst of Framer-Motion-animated emoji particles. This is a
deliberate substitute for the original spec's "Lottie confetti" — Framer Motion is already a
dependency, so a particle burst delivers the same "delight on completion" moment without a
Lottie player + JSON asset. Gotcha worth knowing if you touch this: give the particles' `exit`
transition its own short explicit duration (nested inside the `exit` target object, not the
shared `transition` prop) — otherwise exit inherits the multi-second flight-animation duration
even though the particle is already invisible by then, and the (invisible) DOM nodes linger far
longer than intended.

## Insights (weekly coaching summary)

`modules/insights/` builds a Whoop-style "data-as-coaching" summary from data the app actually
collects — deliberately not the original spec's "Bearable-style correlations" (mood/sleep, etc.),
since LifeOS has no mood or symptom tracker to correlate against. The key structural insight:
every streak-bearing module already exposes a `GoalEvaluator.isGoalMet(localDate, timeZone)`
(see "Streak engine" above), and because that's a pure historical read over that date's logs —
not dependent on today's mutable streak row — the same evaluators can be replayed over any past
date. `moduleRegistry.ts` lists every streak-bearing module's evaluator; `weeklySummary.ts`
replays each over the last 7 local dates (`dateRange.getLastNLocalDates`) to produce an X/7 count
per module with zero new per-module bookkeeping, plus a one-line shame-free coaching headline
(strongest area / room to grow — never "you failed").

## Companion (gentle gamification)

`modules/companion/mood.ts` derives one of three moods (`thriving`/`content`/`resting`) from the
exact `ModuleWeeklyStat[]` the insights module already computes — no new data collection, no
new queries. `resting` covers total inactivity across every module for the whole week and is
deliberately framed as sleepy/waiting ("taking a quiet moment"), never sad or failing, matching
the shame-free tone used throughout (streak-at-risk badges, medication adherence %, etc.).
`components/CompanionFace.tsx` renders this as a small animated SVG blob (a gentle breathing
scale animation via Framer Motion, eyes/mouth that change shape per mood) — not an illustrated
character, since this project has no art assets and a real Finch-style companion is a
visual-design investment, not an engineering one. It's embedded directly in
`insights/components/WeeklyOverviewCard.tsx` rather than given its own card, so mood, coaching
headline, and per-module detail live in one place (the same 3-tier disclosure pattern as
`StatCard`).

## Glass design system

Dark-mode-first tokens defined as CSS custom properties + a Tailwind v4 `@theme` block in
`src/styles/index.css`: deep indigo/near-black base; functional accents — serene blue (water),
fern green (supplements/streaks/success), sunset coral (primary actions/tasks). Glass surfaces:
layered translucent gradient + `backdrop-filter: blur(12px) saturate(180%)` with `-webkit-`
prefix and an `@supports not (backdrop-filter: blur(1px))` opaque fallback; `@media
(prefers-reduced-transparency: reduce)` also forces the opaque fallback; `@media
(prefers-reduced-motion: reduce)` disables spring/entrance animation. Used strategically (nav
bar, cards, modals) — never on large flat backgrounds.

## Performance: route-level code-splitting

`router.tsx` wraps every detail page (everything except `Home`) in `React.lazy` + a single
`Suspense` boundary. `Home` stays eagerly bundled since it's the landing page and already needs
every module's `*DashboardCard` component; each page's fuller UI (forms, lists, module-specific
logic) only loads on navigation. This is what keeps a 10th module from growing the initial
bundle — added after Stage 2 pushed the single bundle to ~550KB and tripped Vite's chunk-size
warning; per-page chunks are now a few KB each and the warning is gone.

## Testing

`vitest` + `fake-indexeddb` (registered in `src/test/setup.ts`) for repository/engine tests that
touch Dexie; pure engine tests (streak, cycle logic, recurrence) need no Dexie at all.
