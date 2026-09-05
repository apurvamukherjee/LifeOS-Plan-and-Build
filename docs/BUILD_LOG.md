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

## 2026-09-05 — Stage 2: Wishlist, Notes, Expenses, Food, Medication, Gym (all 6 remaining modules)

- **Schema**: extended `ModuleKey` to `'water'|'supplements'|'tasks'|'expenses'|'food'|'gym'|'medication'`
  (Notes/Wishlist excluded — no streak, per their own `docs/modules/*.md`). Added 12 new Dexie
  tables via a proper `db.version(2).stores({...})` bump (full schema restated per Dexie's
  versioning model, not just the delta) and the matching 12 tables + RLS + triggers appended to
  `supabase/schema.sql` (generated via a one-off script to keep the repetitive trigger/policy
  boilerplate consistent across all of them, then reviewed before appending).
- **Refactor**: pulled `isScheduledOn` and `isLowStock` out of `modules/supplements/cycleLogic.ts`
  into shared `engine/scheduling/scheduleRule.ts` and `engine/inventory/stock.ts`, since
  Medication needed identical logic — `cycleLogic.ts` re-exports both so existing Supplements
  imports didn't need to change.
- **Wishlist**: `totals.ts` (running total, per-category subtotals — pure, unit-tested), repo,
  add/list UI with want/need level and an archive/purchased flow instead of hard delete. No
  streak/reminder engine involvement, per its own spec.
- **Notes**: debounced (500ms) auto-save quick-capture textarea that creates-then-updates a
  single draft note as you type (no explicit save button, per docs/modules/notes.md), tags/color/
  pin editable after the fact. No streak, per its own spec.
- **Expenses**: `summary.ts` (net total, spend-by-category, local-month filtering, budget
  remaining — pure, unit-tested, including a DST/timezone-boundary case) — "Money In / Money Out"
  two-button entry per the Pocket Clear pattern in the original research; streak = "logged a
  transaction today."
- **Food**: tiered input per docs/modules/food.md — quick-add (name + calories, macros behind a
  "more detail" disclosure) always creates a `Food` row so daily totals can join on it; a
  "save as meal" checkbox makes it reappear in a one-tap saved-meals quick-log row. Barcode scan
  and AI photo/voice logging deliberately NOT built (explicitly out of scope in the spec — highest
  implementation cost, requires external APIs). `nutrition.ts` (macro totals via foodId join,
  pure, unit-tested).
- **Medication**: near-identical structure to Supplements (reusing the shared scheduling/stock
  helpers) but defaults `goalMode` to `'all-scheduled'` rather than Supplements' `'any'`, since
  adherence-to-every-dose is the headline metric here. `adherence.ts` returns 100% with no
  history (shame-free — a brand-new medication doesn't render as an immediate failure) rather
  than 0%. The page carries an explicit in-app disclaimer that reminders are in-app-only, per the
  reminder-reliability caveat in docs/modules/medication.md.
- **Gym** (the most complex module): `plateCalculator.ts` and `personalRecords.ts` (both pure,
  unit-tested — greedy plate breakdown; PR detection; "most recent set for this exercise,
  excluding the current workout" for the progressive-overload inline comparison). An active
  workout session tracks sets via live Dexie queries rather than local component state; the rest
  timer is a self-contained local countdown (per the spec, deliberately NOT routed through the
  shared reminders table — it only needs to fire while the screen is open). `finishWorkout` is
  the only action wrapped in `logEvent` — individual set logs don't touch the streak engine,
  only completing the workout does, which is what "goal met today" means for this module.
  Workout templates got a data layer (CRUD repo functions) but no "start from template" UI flow
  yet — starting a workout always begins blank; noted as a gap in `docs/DATA_MODEL.md`.
- **Integration**: `router.tsx` gained 6 routes; `pages/Home.tsx` became a 2-column bento grid
  (Water full-width up top, everything else in a 2-column grid) instead of Stage 1's single
  column, since 9 module cards no longer fit comfortably as one vertical stack. The bottom nav
  deliberately stayed at 4 tabs (Home, Water, Supplements, Tasks) rather than growing to 9 — the
  other 6 modules are reachable only via Home's grid, to avoid nav-bar overcrowding (a design
  principle carried over from the original spec's "fight complexity" lesson).
  `useAppForegroundEffects`'s streak-settling loop now covers all 7 streak-bearing modules.
- **Final verification**: `npx tsc -b` clean, `npx vitest run` — 11 files, 71/71 tests passing,
  `npm run build` succeeds (bundle now ~550KB, still just a warning). Full browser pass
  (Playwright): added/logged something in every one of the 6 new modules — including a complete
  Gym workout (start → add exercise → log a PR-triggering set → finish, verified the PR
  celebration text appeared and the workout showed up in history with the correct set count) —
  and confirmed the new Home bento grid reflects every module's live state correctly. Zero
  console errors across the entire pass.

### Known deferred items (not blocking, noted for later)

- Production bundle grew to ~550KB — the code-splitting item from Stage 1's build log is now
  more worth doing, still not urgent.
- No "start workout from template" UI flow (data layer exists, UI doesn't yet).
- `recurringBills` has no auto-generation UI (CRUD-only in the repo layer).
- Lottie celebrations and home-screen widgets from the original spec remain unbuilt — see
  `docs/ROADMAP.md` Stage 3.

## 2026-09-05 — Stage 3 (part 1): weekly coaching summary, celebrations, code-splitting

Scoped Stage 3 deliberately: built the three items that were concretely buildable without
fabricating data the app doesn't collect or building speculatively against an unmet threshold
(reasoning for each skip is in `docs/ROADMAP.md`'s Stage 3 table, not repeated here).

- **`logEvent` now reports `goalNewlyMet`**: changed its return type from `T` to
  `{ result: T; goalNewlyMet: boolean }`, computed by checking whether the streak's
  `lastCompletedLocalDate` was already today *before* `recordGoalMet` runs — true only on the
  exact crossing edge, so a repeat log the same day (goal already met) doesn't re-report it.
  Updated all 8 call sites across the 7 action-function files to destructure the new shape.
  2 new unit tests (`engine/logging/logEvent.test.ts`) cover the crossing-edge case explicitly
  (log below goal → false, log that crosses it → true, log again after → false) plus the
  never-met case.
- **Celebration system**: `engine/celebration/celebrationBus.ts` (pub/sub, same pattern as
  `engine/sync/syncBus.ts`) + `components/ui/CelebrationOverlay.tsx` (mounted once in `App.tsx`,
  subscribes and renders a Framer Motion particle burst). Deliberately NOT Lottie — Framer
  Motion is already a dependency and delivers the same "delight on completion" moment without a
  player + JSON asset. Every module's log-action function now fires `triggerCelebration()` when
  `goalNewlyMet` is true.
  - Bug caught by browser testing, not unit tests: the particles' `exit` transition was
    inheriting the ~1.5s flight-animation duration from a shared `transition` prop, so the
    (already-invisible) DOM nodes lingered for another 1.5s after `setParticles(null)` — a
    second log shortly after the first showed a false "repeat celebration" in a Playwright check
    that was actually just the first burst's stale nodes. Fixed by nesting an explicit fast
    `transition: { duration: 0.15 }` inside the `exit` target specifically, decoupled from the
    `animate` target's own nested transition.
- **Weekly coaching summary** (`modules/insights/`): reinterpreted the spec's "Bearable-style
  correlations" for data LifeOS actually has (no mood/symptom tracker exists to correlate
  against). Key reuse: every streak-bearing module's `GoalEvaluator` is a pure historical read,
  so replaying it over the last 7 local dates (`dateRange.getLastNLocalDates` +
  `countGoalMetDays`) needed zero new per-module bookkeeping — just a registry
  (`moduleRegistry.ts`) listing each module's existing evaluator. `generateCoachingHeadline`
  picks the strongest/weakest module and frames it shame-free ("room to grow," never "failed").
  Surfaced as a new "This week" card at the top of Home. 7 new unit tests across
  `dateRange.test.ts` (incl. a fake-timers test for date-range correctness) and
  `weeklySummary.test.ts` (headline branching logic).
- **Route-level code-splitting**: every detail page in `router.tsx` is now `React.lazy` behind
  one `Suspense` boundary; `Home` stays eager since it already needs every module's dashboard
  card. Production build's single ~550KB bundle is now a ~263KB main chunk + a ~228KB
  `dexie-react-hooks` chunk + a `streakEngine` chunk (~28KB, shared across every goal evaluator)
  + one small (2-7KB) chunk per page — the chunk-size warning is gone. Total bytes for a
  Home-only visit didn't drop dramatically (Home's dashboard cards still pull in most shared
  code), but incremental navigation cost and the ceiling on future-module growth both did.
- **Final verification**: `npx tsc -b` clean, `npx vitest run` — 14 files, 80/80 tests passing,
  `npm run build` succeeds with no chunk-size warning. Full browser pass (Playwright): confirmed
  the empty-state coaching headline, crossed the water goal and watched the celebration fire
  (confirmed via the exit-transition bugfix above), confirmed a second log the same day did NOT
  re-trigger it, confirmed the weekly card updated to reflect the new streak, and exercised two
  lazy-loaded routes (Gym, Notes) to confirm code-splitting introduced no loading regressions.
  Zero console errors throughout.

### Remaining for a future Stage 3 pass

- Capacitor wrapper and home-screen widgets — not built; both gated on conditions/constraints
  documented in `docs/ROADMAP.md`, not simply left undone.
- The Home page itself is still the single biggest chunk of shared code (every dashboard card's
  live-query hook loads eagerly); further bundle wins would mean making Home's cards themselves
  lazier (e.g. an aggregate summary query instead of one hook per module), which is a bigger
  change than this pass's scope.

## 2026-09-05 — Stage 3 (part 2): companion/avatar gamification

- **`modules/companion/mood.ts`**: `getCompanionMood(stats)` derives `'thriving' | 'content' |
  'resting'` from the exact same `ModuleWeeklyStat[]` array `insights/weeklySummary.ts` already
  computes (total days met / total possible days across every streak module, `thriving` at
  ≥60%, `resting` only when literally nothing was met all week) — zero new queries.
  `pickCompanionMessage(mood, seed)` is deterministic (day-of-month modulo message-array length),
  not `Math.random()`, so the message doesn't flicker between different text on every re-render
  as live queries refresh. 7 unit tests (`mood.test.ts`).
- **`components/CompanionFace.tsx`**: a small animated SVG blob (~70px) — a circle body in a
  mood-tinted brand color (streak green / water blue / mind lavender for resting), with
  eyes+mouth paths that change per mood (closed sleepy eyes for resting, plain smile for
  content, bigger eyes + wide smile for thriving), plus a continuous gentle "breathing"
  scale animation via Framer Motion. Explicitly not an illustrated character — this project has
  no art assets, and per docs/ROADMAP.md a full Finch-style companion is a visual-design
  investment, not something to improvise into engineering time.
- **Integration**: embedded directly into `insights/components/WeeklyOverviewCard.tsx` (face +
  message at the top, coaching headline below, per-module chips below that) rather than given
  its own separate card — keeps mood/data/detail in one place, the same 3-tier disclosure
  pattern used by `StatCard` elsewhere.
- **Verification quirk worth recording**: an early browser-verification pass logged only a
  partial (150ml) water amount and expected the companion to shift moods — it didn't, and this
  was correctly NOT a bug: `daysMet` counts *goal-met* days (the same evaluators the streak
  engine already uses), not "any activity happened," so a sub-goal log correctly doesn't move
  the needle. Re-verified by actually crossing the water goal (2000ml), which correctly flipped
  the companion from the resting/lavender/sleepy state to content/blue/smiling in sync with the
  coaching headline updating — this is the intended behavior, not a workaround.
- **Final verification**: `npx tsc -b` clean, `npx vitest run` — 15 files, 87/87 tests passing.
  Full browser pass confirmed both the resting state (fresh DB, correct sleepy message) and the
  content state (after crossing one module's daily goal, correct smiling face + updated
  headline + updated per-module chip) render correctly with zero console errors. The `thriving`
  branch is covered by unit tests only — reaching it live would require backdating several
  days of logs across multiple modules, which the current action functions don't support (they
  always timestamp `new Date()`), so it wasn't worth a bespoke seeding path just for this
  screenshot.

This closes every buildable item in the Stage 3 table. The two remaining rows (Capacitor
wrapper, home-screen widgets) stay unbuilt on purpose — see `docs/ROADMAP.md` for why each is
gated rather than simply unfinished.

## 2026-09-05 — Stage 3 (part 3): Capacitor Android wrapper, on explicit request

User asked to complete Stage 3 "full." Flagged before proceeding: the Capacitor threshold
("only if reminders prove unreliable") hadn't been met by real usage data, and this is a Windows
dev machine (iOS is impossible here regardless — Xcode is macOS-only). Asked how to proceed;
user chose "scaffold Android only."

- Installed `@capacitor/core`, `@capacitor/android`, `@capacitor/cli` (dev). Added
  `capacitor.config.ts` (`appId: 'com.lifeos.app'` — placeholder, documented as needing to
  change before any real Play Store publish). `npx cap add android` generated `android/`;
  `npx cap sync android` copied the built `dist/` into it.
- **Went beyond scaffolding to a real verified build**, since this machine turned out to already
  have a working Android SDK (platforms, build-tools, an emulator AVD) and a JDK — not assumed
  going in. `./gradlew assembleDebug` initially failed (`invalid source release: 21` — the
  default `JAVA_HOME` pointed at a JDK 17 install, but `capacitor-android` targets Java 21, and a
  JDK can only compile *up to* its own version). Fixed by pointing `JAVA_HOME` at a JDK 25
  install already present on the machine, just for the Gradle invocation. Second attempt: **BUILD
  SUCCESSFUL**, producing a real ~4.4MB debug APK.
- Booted the existing emulator AVD, installed the APK via `adb install`, launched it
  (`adb shell am start`), and screenshotted it: the actual LifeOS home screen rendered correctly
  inside the native WebView — companion, weekly overview, all 9 module cards, pixel-identical to
  the browser version, Android status bar visible. Then sent a real touch event
  (`adb shell input tap`) and confirmed it navigated to the Medication page via React Router,
  rendering that page's real content (disclaimer text, empty state) with the bottom nav's active
  tab updating correctly. This is proof of working touch input + client-side routing +
  IndexedDB/React inside the native shell, not just "the Gradle build didn't fail."
  - Minor tooling snag along the way: `adb shell` paths starting with `/` (e.g.
    `/sdcard/screenshot.png`) were being mangled by Git Bash's MSYS path conversion into a
    bogus Windows path. Fixed with `MSYS_NO_PATHCONV=1` for those specific commands.
- Documented the full setup/build/verify/update workflow in the new `docs/CAPACITOR.md`,
  including the explicit callout that **this does not yet solve the original reminder-reliability
  motivation** — no native notification plugin is wired up, so in-native-app reminders still
  behave exactly like the browser (in-app-only) until `@capacitor/local-notifications` is added
  and integrated, which is recorded as the concrete next step if this gets picked up further.
- `android/` is committed (standard practice for native projects) via its own generated
  `.gitignore`, which already correctly excludes `local.properties` (machine-specific SDK path),
  `build/`, `.gradle/`, `*.apk`, and the copied web assets — verified via `git add -n` that only
  ~50 genuine source/config files would be tracked, no build output.
- `npm audit` flags a moderate `uuid` advisory via `@capacitor/cli`'s `xcode` dependency (iOS
  tooling that isn't even used here, since only Android was installed) — a dev-only build-time
  dependency, never shipped to end users. Not force-fixed, since that would mean a breaking
  `@capacitor/cli` major-version bump to address a package this project doesn't exercise.

Stage 3 is now complete: every item in the roadmap table is either built or has a definitive,
documented reason it isn't (hard platform constraint for widgets' remaining gap, Mac-only
tooling for iOS).

## 2026-09-05 — Stage 4: icon system, Satoshi typography, public README, .gitignore

User asked to replace every emoji with real icons from an icon pack, apply a "cooler" font
(Satoshi, or a good alternative) app-wide, write a portfolio-style public README with
screenshots (explicitly no mention of code/implementation/AI), and harden `.gitignore`.

- **Icons**: installed `lucide-react`. Found every emoji-as-icon usage via a Unicode-range grep
  across `src/` (not a manual eyeball search) to make sure nothing was missed: bottom nav
  (🏠💧💊✅), `StreakBadge` (🔥⚠), `CelebrationOverlay`'s particle burst (🎉✨🔥💪 →
  `PartyPopper`/`Sparkles`/`Flame`/`Dumbbell`, each tinted with an existing brand accent color),
  the water page's inline streak flame, the note pin toggle (📌📍 → `Pin`/`PinOff`), the gym PR
  celebration (🎉 → `Trophy`), "Taken" checkmarks in Supplements/Medication (→ `Check`), the
  recurring-task marker (↻ → `Repeat`), and the error boundary's crash face (😵 → `Frown`).
  Extended slightly beyond the literal ask for consistency: every page's "+ Add" button used a
  literal `+` character as a pseudo-icon — replaced with a real `Plus`/`X` icon via a new shared
  `AddToggleButton` component (the exact "+ Add / Close" toggle was duplicated identically across
  4 pages, so this was also a small dedup). Plain-text "remove"/"undo"/"delete" action links
  across 7 list-item components picked up matching `Trash2`/`Undo2` icons for consistency with
  the now-iconified primary actions sitting right next to them.
  - Caught and fixed a real mistake while doing this: initially used a Tailwind `text-base`
    utility class hoping it would apply the app's `--color-base` (near-black) token as a text
    color for a checkmark icon rendered on a colored background. It doesn't reliably — Tailwind
    v4 also defines a built-in `--text-base` font-size token (1rem) in a different theme
    namespace, and the two collide on the same class name. Fixed with an explicit
    `style={{ color: 'var(--color-base)' }}` instead of relying on the ambiguous utility class.
- **Typography**: fetched Satoshi directly from Fontshare's CDN (`api.fontshare.com/v2/css`) and
  self-hosted the woff2 files under `public/fonts/` rather than linking Fontshare's CDN at
  runtime — an external font host is exactly the kind of dependency this offline-first PWA is
  built to avoid. Verified via Fontshare's own API (`license_type: itf_ffl`) that the license
  covers free commercial self-hosted use with no attribution required. Only fetched/kept the
  weights actually used in the app (400, 500, 700 — checked via a grep for every
  `font-{weight}` Tailwind utility in use first, rather than guessing); confirmed Satoshi has no
  static 600/SemiBold cut, but the browser's standard font-weight matching correctly substitutes
  700 for Tailwind's `font-semibold` without faux-bold synthesis, so nothing extra was needed.
  Wired in via the existing `--font-sans` design token, so no per-component changes were needed
  for it to apply everywhere. Verified in a live browser via `document.fonts.check()` that both
  weights actually loaded and applied, not just that the CSS was present.
- **README**: full rewrite as a product showcase rather than a technical readme — hero
  screenshot, a "why this app exists" pitch, a full module feature table, a design-philosophy
  section (shame-free streaks, the companion, the color system), and a platforms section
  (offline PWA + native Android). Deliberately contains no mention of the tech stack, code, or
  how the app was built. Backed by 5 freshly-captured screenshots (not reused stale ones) in the
  new `docs/screenshots/`: a richly-seeded home dashboard (all 9 modules populated via real UI
  interactions, not fixture data), a goal-completion celebration mid-animation, an active gym
  session with a PR firing, the wishlist running total, and the app running natively on a
  rebuilt-and-reinstalled Android APK (confirming the icon/font work applies there too, not just
  on the web).
- **`.gitignore`**: added explicit `.env`/`.env.local`/`.env.*.local` patterns (previously only
  covered by a blanket `*.local`), `*.tsbuildinfo`, and `Thumbs.db`; reorganized with clearer
  section comments.
- **Process note**: partway through this work the user began committing and pushing changes
  themselves directly (outside this session's tool calls) — a remote (`origin`, pointing at their
  own GitHub repo) appeared, the default branch was renamed `master` → `main`, and a commit
  capturing the icon/font source changes landed on it. Per explicit instruction, no `git commit`
  or `git push` has been run from within this session since — the README, `.gitignore`, and
  `docs/screenshots/` from this entry were left as uncommitted working-tree changes for the user
  to review and commit on their own.
- **Verification**: `npx tsc -b` clean, full Unicode-range re-grep confirmed zero emoji remain in
  `src/`, `npx vitest run` — 87/87 tests still passing (no engine/logic code was touched this
  pass). Full browser click-through across Home and 5 module pages confirmed the new icons/font
  render correctly with zero console errors.

## 2026-09-05 — Stage 4 (continued): native notifications, recurring bills, workout templates

User asked to close out the three remaining named gaps from the prior session's summary (native
notifications, start-workout-from-template, recurring-bill auto-generation) plus lazier Home
dashboard cards, then generate an installable APK.

- **Home dashboard code-splitting**: all 9 `*DashboardCard` imports in `pages/Home.tsx` converted
  to `React.lazy` behind individual `Suspense` fallbacks (a pulsing glass placeholder), so Home's
  landing bundle no longer eagerly pulls in every module's card-specific code.
- **Recurring bill auto-generation** (`modules/expenses/recurringBills.ts`): pure
  `isBillDueByLocalDate` (clamps `dayOfMonth` to the actual last day of shorter months) and
  `hasBeenGeneratedForMonth`; `generateDueRecurringBills` runs from the existing foreground-effects
  hook. A real bug surfaced by React 18 StrictMode's double-invoked effects in dev: two
  near-simultaneous calls both saw "not generated yet" and both wrote an expense (observed as
  double the correct amount in a live screenshot) — fixed with a module-level in-flight guard,
  the same pattern already used by the sync engine. Re-verified after the fix: correct single
  amount.
- **Start workout from template** (`modules/gym/templates.ts`, `ActiveWorkoutSession.tsx`,
  new `TemplatePicker.tsx`): `resolveTemplateExercises` maps a template's saved exercise-id order
  to live `Exercise` records, silently dropping any that no longer resolve. Starting from a
  template surfaces its exercises as clickable chips; finishing an ad-hoc (non-template) workout
  with at least one set offers "save as template." Full save → start → chips-appear round trip
  verified live in-browser.
- **Native local notifications** (`@capacitor/local-notifications`, `engine/reminders/
  nativeNotifications.ts`, `reminderActions.ts`): `setDailyReminder`/`removeDailyReminder` now
  write the Dexie reminder row and register a real OS notification together; the existing
  in-app foreground poll (`reminderScheduler.ts`) now no-ops entirely on native platforms rather
  than running redundantly alongside the OS notification. Added a `ReminderToggle` control (bell
  icon + time, or a time picker) to Medication and Task rows.
  - **JDK/Gradle rebuild snag**: adding the plugin and re-running `cap sync` forced a fresh Gradle
    resolution that failed under the JDK 25 install used for the previous Capacitor build —
    `Unsupported class file major version 69`. Root cause: Gradle 8.14.3's own Groovy engine can
    only be *hosted on* JDKs up to Java 24, a separate constraint from what it can *compile
    against* (Java 21, which is what `capacitor-android` targets). Fixed by building with Android
    Studio's own bundled JDK (`C:\Program Files\Android\Android Studio\jbr`, a JBR-flavored
    OpenJDK 21) instead of the newest JDK on the machine — new enough to compile the target, old
    enough for Gradle to run on. Full story recorded in `docs/CAPACITOR.md` so it doesn't need
    re-discovering.
  - **End-to-end verification on a real emulator, not just a compile check**: drove the actual
    native app via a raw CDP WebSocket client (Playwright's `connectOverCDP` doesn't work against
    Android WebView — its devtools implementation doesn't support browser-context management) to
    add a medication and set a reminder through the real UI. First attempt appeared to hang, which
    turned out to be a real (if expected) system permission dialog — "Allow LifeOS to send you
    notifications?" — blocking the JS promise until answered; granted it via `adb shell input
    tap`. Second attempt scheduled the OS alarm but it never fired; `adb shell dumpsys alarm`
    showed nothing at all for the package, which traced to a *second*, separate Android 12+
    permission gate — "Alarms & reminders" (`SCHEDULE_EXACT_ALARM`) — that can't be requested via
    a runtime dialog at all; `@capacitor/local-notifications` itself detects this and deep-links
    to that system Settings screen the first time it's needed. Granted it once via the emulator's
    Settings UI; every reminder set after that point worked correctly. After granting both
    permissions, force-stopping the app to simulate "closed" turned out to be the wrong test —
    `am force-stop` puts an app into a system "stopped" state where Android intentionally
    suppresses its scheduled alarms until the user manually relaunches it (confirmed via `dumpsys
    package` showing `stopped=true` and the previously-scheduled alarm gone from `dumpsys alarm`).
    Redone correctly (just backgrounding via the Home button, `stopped=false`): `dumpsys alarm`
    showed a real `RTC_WAKEUP` entry (`TimedNotificationPublisher`) at the exact scheduled time,
    and at that time a real Android notification — "LifeOS reminder" / "A medication dose is
    due." — appeared in the system notification shade with the app fully backgrounded, confirmed
    both via `dumpsys notification` and a screenshot of the expanded shade. This is the concrete,
    verified fix for the reminder-reliability gap the whole Capacitor wrapper was originally
    motivated by.
  - Updated the in-app Medication disclaimer to be platform-aware (`isNativePlatform()`) — it
    still correctly warns "in-app only" in the browser, but now says reminders fire even when
    LifeOS is closed on native, since that stale copy would otherwise now be actively wrong.
  - All of the above (permission-dialog handling, exact-alarm Settings redirect, force-stop vs.
    background distinction) documented in `docs/CAPACITOR.md` so this doesn't need re-discovering.
- **Wishlist currency**: switched from `$` to `₹` across the wishlist row, dashboard card, page
  total/subtotals, and the price input placeholder — the app targets India-only usage.
- **Final verification**: `npx tsc -b` clean, `npx vitest run` — 18 files, 101/101 tests passing.
  Rebuilt the web bundle and Android APK with all of the above; confirmed on a clean
  uninstall/reinstall that the rebuilt APK actually reflects both the new Wishlist ₹ formatting
  and the platform-aware Medication copy (a stale-service-worker artifact from repeatedly
  reinstalling the same content-hash-changing build during testing briefly showed the app's
  existing chunk-load error boundary instead — resolved by a clean install, not a real bug).
  Debug APK copied to `~/Desktop/LifeOS-APK/LifeOS-debug.apk` for installation.

### Known deferred items (not blocking, noted for later)

- No in-app messaging yet for what to do if a user declines either the notification permission or
  the exact-alarm Settings toggle — the reminder row is still created either way, it just won't
  visibly fire.
- Cloud sync still requires the user to create their own Supabase project — unchanged, by design
  (see Stage 1 of this log).

## 2026-09-05 — Stage 5: permission recovery, cross-module correlations, dashboard laziness

User asked to start "the next phase." Since every roadmap stage was already marked complete and
nothing was queued as a defined next stage, asked which of the open, heterogeneous "left" items
to tackle rather than guessing — user picked three: native permission-recovery UX, deeper
cross-module insights, and a bundle/performance pass on Home's dashboard.

- **Permission-recovery UX**: `engine/reminders/permissionStatus.ts`'s `evaluateReminderHealth`
  is pure decision logic (6 unit tests) fed by three new thin wrappers in `nativeNotifications.ts`
  around the `@capacitor/local-notifications` plugin's existing `checkPermissions`,
  `checkExactNotificationSetting`, and `changeExactNotificationSetting` methods (confirmed these
  exist and match the assumed shape by reading the installed plugin's own `.d.ts` before writing
  any code against them). `hooks/useNativeReminderHealth.ts` re-checks on every
  `visibilitychange` (not just on mount), since the only way to actually fix a denied permission
  is a round trip through system Settings and back. `NativeReminderPermissionBanner` shows on
  Home only when there's a real problem *and* the user has at least one active reminder.
  - **Live-verified on a real emulator, and it caught a real bug.** Did a clean uninstall to get
    a genuinely unpermissioned app, denied the notification-permission dialog when setting a
    reminder (confirmed via `checkPermissions()` queried directly through
    `window.Capacitor.Plugins` that a single denial reports `'prompt-with-rationale'`, not
    `'denied'` — Android doesn't hard-block until a second denial or "don't ask again"), and
    separately confirmed the exact-alarm permission was genuinely `'denied'` the same way. The
    banner correctly showed the exact-alarm message for that state — but the underlying priority
    logic was backwards: it checked `exactAlarmDenied` before `notificationDenied`, when
    notification-denied is actually the more severe case (nothing displays at all) and
    exact-alarm-denied alone is a lesser one (it still displays, just not necessarily on time).
    Fixed the priority, rebuilt, and re-verified: clicking the banner's "Fix" button correctly
    deep-linked to the system "Alarms & reminders" screen (screenshotted), granting it there and
    returning to the app made the banner disappear on the next visibility-change re-check.
  - The pre-existing browser-only `NotificationPermissionBanner` (for the in-app foreground poll)
    is now gated to `!isNativePlatform()` — it was promoting a poll that no longer even runs on
    native, so showing it there was actively misleading, not just redundant.
- **Cross-module correlations** (`modules/insights/correlations.ts`): a phi coefficient (binary
  Pearson correlation) between every pair of streak modules' daily goal-met series over a
  trailing 30 days (longer than the weekly summary's 7-day window on purpose — correlation needs
  more history to trust than a coaching headline does). Two noise guards: `minActiveDays` (a
  module must have actually been met on enough days — otherwise a barely-used module could
  spuriously "correlate" with another by chance) and `minStrength` (the correlation itself must
  clear a threshold). Below either, `computeModuleCorrelations` returns `[]`, not a guess. 11 unit
  tests cover the math (perfect positive/negative, zero-variance-returns-null since correlation
  is undefined not zero there, a hand-verified partial-correlation contingency table) and both
  filters. `CorrelationsCard` renders nothing when there's nothing to show — same "quiet unless
  genuinely useful" choice already made for the companion's resting state — verified live that it
  correctly stays silent on a fresh install. Surfacing an actual live correlation would need weeks
  of varied backdated history the app's action functions don't support writing (same limitation
  already hit and noted for the companion's `thriving` state in Stage 3); left to the unit tests.
- **Dashboard data-fetch laziness** (`components/ui/LazyOnVisible.tsx`): Stage 3's code-splitting
  only deferred each card's *code* — `React.lazy` doesn't defer a mounted component's hooks, so
  all 8 secondary cards' live-query subscriptions still fired together the instant Home rendered.
  `LazyOnVisible` wraps each one in an `IntersectionObserver` gate (falls back to mounting
  immediately if unavailable) so both the chunk import and the live query wait until the card
  scrolls near the viewport; a mount-once gate, not virtualization, so data doesn't reset on
  scroll-away. Water (the hero card) stays eager. Verified live via Playwright: nothing renders
  prematurely, and scrolling correctly brings in every lazy card's real content with zero console
  errors.
- **Final verification**: `npx tsc -b` clean, `npx vitest run` — 20 files, 120/120 tests passing.
  Rebuilt the web bundle and Android APK twice (once for the initial pass, once after the
  message-priority fix found during live testing); the permission-recovery flow was verified
  end-to-end on the real emulator, not just compiled. Debug APK re-exported to
  `~/Desktop/LifeOS-APK/LifeOS-debug.apk`.
