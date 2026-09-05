# LifeOS Roadmap

Source spec: the original full product research doc (9 modules, glassmorphic design system,
market research) is preserved in [`docs/ORIGINAL_SPEC.md`](./ORIGINAL_SPEC.md). Everything below
is the scoping decision made on top of it.

## At a glance: what's done, what's left

**Done.** All 9 modules (Water, Supplements, Tasks, Medication, Food, Gym, Expenses, Wishlist,
Notes) on one shared engine — streaks with grace-days, atomic logging, Dexie↔Supabase sync, a
weekly cross-module coaching summary, goal-completion celebrations, and a mood-reactive companion.
Fully offline-first and installable as a PWA (verified working with the network disabled). A real
native Android app with **real OS-level reminders** — `@capacitor/local-notifications` wired up
and verified end-to-end on a real emulator: a scheduled reminder fires as an actual system
notification with the app fully closed, not just an in-app poll (full verification story,
including two separate Android permission gates that had to be granted, in `docs/CAPACITOR.md`).
Starting a workout from a saved template, and expenses auto-generated from recurring bills, both
now have full UI flows, not just data-layer support. Home's 8 secondary dashboard cards mount
(and start their live queries) only once scrolled near-visible, not all at once on load. A new
cross-module correlations card surfaces genuine patterns (e.g. "Gym and Water tend to go
together") when there's enough history to trust one — silent otherwise, never a fabricated
"insight." Denied Android reminder permissions now surface an in-app "Fix" banner that routes to
the right Settings screen, verified live by denying each permission on a real emulator and
confirming the fix flow resolves it. Wishlist is priced in ₹ (India-only usage). Every icon in the
app is a proper icon (Lucide), not emoji; typography is self-hosted Satoshi. Public-facing
`README.md` with real screenshots, and a hardened `.gitignore`. 120 unit tests passing, clean
type-check, clean production build. A debug APK is exported to `~/Desktop/LifeOS-APK/` for
installation.

**Left — and why, not just "not done yet":**
- **Home-screen widgets** — needs native plugin work beyond the base WebView shell; not a
  Capacitor-specific limitation, a general one.
- **iOS build** — needs Xcode, which is macOS-only; this project has been built entirely on
  Windows, so iOS has never been attempted, not merely deprioritized.
- **Illustrated companion character** — the companion is a simple animated SVG blob face, not a
  Finch-style illustrated character with art assets. Swapping in real illustration is a
  visual-design investment, not an engineering one, and was explicitly scoped down for that
  reason (see "Companion/avatar" below).
- Cloud sync requires the user to create and configure their own Supabase project — this is
  by design (local-first, zero required setup), not an oversight, but it means sync is inert
  until someone does that one manual step.
- **Correlation insight quality is data-limited, not algorithm-limited** — the phi-coefficient
  math and its noise thresholds are unit-tested and correct, but a real household will need
  weeks of varied logging before two modules produce a trustworthy pattern; this can't be
  meaningfully verified live without backdated data the app's action functions don't support
  writing (same limitation noted for the companion's `thriving` state in Stage 3).

## Stage 1 — MVP (complete)

Shared engine + 3 highest-frequency, lowest-friction modules. See
[`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) for the technical design.

| Piece | Status |
|---|---|
| Dexie schema + base repo | 🟩 |
| Streak engine (freeze/grace-day, DST-safe) | 🟩 |
| Logging service (atomic log + streak update) | 🟩 |
| Water module | 🟩 |
| Glass UI shell (GlassCard, ProgressRing, StatCard, AppShell) | 🟩 |
| Supplements module (incl. creatine saturation %, cycling) | 🟩 |
| Tasks module (incl. recurrence) | 🟩 |
| Reminder service (in-app + push scaffold) | 🟩 |
| Supabase schema + auth | 🟩 |
| Sync engine (Dexie ↔ Supabase, last-write-wins) | 🟩 |
| PWA wiring (manifest, offline fallback, installable) | 🟩 |
| Polish (empty states, streak-at-risk UI, seed data) | 🟩 |

End-to-end verified in a real browser (Playwright, 2026-09-05): logging water/a supplement
dose/completing a task all update progress rings, streaks, and the home dashboard correctly,
with zero console errors, backed by real IndexedDB. The production build's service worker was
verified to serve the app (including previously-logged data) with the network fully disabled.

## Stage 2 — Expand trackers (complete)

All 6 remaining modules from the original spec, built on the same shared engine (streaks,
logging, reminders, sync) as Stage 1 — no shared-engine changes were needed beyond adding new
`ModuleKey` values and Dexie/Supabase tables.

| Module | Status | Notes |
|---|---|---|
| [Wishlist](./modules/wishlist.md) | 🟩 | Running total, category subtotals, want/need level. No streak (by design). |
| [Notes](./modules/notes.md) | 🟩 | Debounced auto-save quick capture, tags, color, pin. No streak (by design). |
| [Expenses](./modules/expenses.md) | 🟩 | Money In/Out, monthly overview, category budgets. Streak = "logged a transaction today." |
| [Food & Nutrition](./modules/food.md) | 🟩 | Quick-add + saved meals (barcode/photo/voice deliberately out of scope). Streak = "logged a meal today." |
| [Medication](./modules/medication.md) | 🟩 | Mirrors Supplements' ScheduleRule; shame-free adherence %; in-app-only reminders (see caveat below). |
| [Gym & Workouts](./modules/gym.md) | 🟩 | Active workout session, rest timer, plate calculator, PR detection, previous-performance lookup. Streak = "completed a workout today." |

End-to-end verified in a real browser (Playwright, 2026-09-05): added/logged an item in every
module (wishlist item, note, expense, meal, medication dose, a full gym workout with a set that
correctly triggered a PR celebration), confirmed the home dashboard's bento grid reflects every
module's live state (including streaks), zero console errors throughout.

Not built from the original Stage 2 wish-list: home-screen widgets and Lottie celebration
animations. Both addressed in Stage 3 below — celebrations via a lighter Framer Motion
substitute, widgets ruled out as infeasible for a plain PWA rather than merely deferred.

## Stage 3 — Retention & polish (complete)

Every item below is either built or definitively resolved (not merely postponed) — see each
row's note for which.

| Item | Status | Notes |
|---|---|---|
| Route-level code-splitting | 🟩 | Every detail page now lazy-loads; see `docs/BUILD_LOG.md`. |
| Weekly cross-module coaching summary | 🟩 | Reuses every module's existing `GoalEvaluator` — see below. |
| Goal-completion celebration | 🟩 | Framer Motion particle burst, not Lottie — see below. |
| Optional gentle gamification (companion/avatar) | 🟩 | Simple SVG blob face, not an illustrated character — see below. |
| Home-screen widgets | ⬜ not feasible on Android app shell alone | Needs native plugin work beyond the base wrapper — see below. |
| Capacitor native wrapper (Android) | 🟩 | Real debug APK, installed and verified. iOS not attempted (needs a Mac). |
| Native local notifications (Android) | 🟩 | `@capacitor/local-notifications`, verified firing with the app closed — see below. |

**Weekly coaching summary, not fabricated correlations.** The original spec's "Bearable-style
correlations" (e.g. mood vs. sleep) assume tracking data LifeOS doesn't collect — there's no
mood/symptom tracker here. Instead, `src/modules/insights/` builds a genuinely Whoop-style
"data-as-coaching" summary from data the app actually has: every streak-bearing module already
exposes a `GoalEvaluator.isGoalMet(localDate, timeZone)` (see `docs/ARCHITECTURE.md`), and
because that's a pure historical read (not dependent on today's mutable streak state), the same
evaluators can be replayed over the last 7 days with zero new per-module bookkeeping. A "This
week" card on Home shows an X/7 chip per module plus a one-line, shame-free coaching headline
(strongest area / room to grow) generated from that data.

**Celebration, not Lottie.** Stage 2 deferred Lottie as pure visual polish; for Stage 3 the
actual "delight on goal completion" moment was worth building, but a full Lottie player + JSON
asset is meaningfully heavier than a burst of Framer-Motion-animated particles (already a
dependency) that achieves the same moment. `engine/celebration/celebrationBus.ts` is a tiny
pub/sub (same pattern as `engine/sync/syncBus.ts`); `logEvent` now reports `goalNewlyMet` (true
only on the crossing edge — the goal was unmet before this exact write and met after), and every
module's log action fires the celebration only on that edge, never on a repeat log the same day.

**Companion/avatar — built, but scoped down from "illustrated character."** A full Finch-style
illustrated companion with hand-drawn mood states is a real visual-design/art investment this
project has no assets for. What got built instead: `modules/companion/` derives a mood
(`thriving`/`content`/`resting`) from the exact same weekly stats the coaching summary already
computes — zero new data collection — and renders it as a simple animated SVG blob face
(`CompanionFace.tsx`, gentle breathing animation, eyes/mouth that change by mood) embedded in the
Weekly Overview card, with a short encouraging message underneath. `resting` (no activity at all
this week) is deliberately framed as sleepy/waiting, never sad — "Taking a quiet moment — say hi
anytime," not "you're falling behind." This delivers the Finch-style *spirit* (non-judgmental,
never punishes a quiet week) without needing illustration work; a fuller illustrated character
remains a possible future upgrade to the same mood/message logic, not a rebuild of it.

**Capacitor wrapper — built for Android, on explicit request, threshold now actually met.** The
original threshold ("only if in-app + Web Push reminders prove unreliable enough to hurt the
medication use case") had not been triggered by any usage data when the wrapper itself was first
built — flagged explicitly at the time, and the user chose to scaffold Android anyway. It has
since gone well past scaffolding: `./gradlew assembleDebug` produces a real debug APK, installed
and launched on an emulator, with touch input and client-side routing confirmed working inside
the native WebView. iOS was **not** attempted: it requires Xcode, which only runs on macOS, and
this environment is Windows — a hard tooling constraint, not a scope choice. **The original
reminder-reliability motivation is now concretely solved**: `@capacitor/local-notifications` is
wired up (`engine/reminders/nativeNotifications.ts`), and a scheduled reminder was verified,
end-to-end on a real emulator, to fire as a genuine OS notification with the app fully closed —
not just the in-app-only poll the browser and earlier native build were limited to. Getting there
surfaced two separate Android permission gates (standard notification permission, plus a distinct
Android 12+ "Alarms & reminders" exact-alarm permission that can only be granted via a system
Settings screen, which the plugin deep-links to automatically) — full story in
`docs/CAPACITOR.md`.

**Home-screen widgets — still not feasible.** OS-level home-screen widgets require native
plugin/platform work (WidgetKit on iOS, App Widgets on Android) beyond what even a Capacitor
WebView shell with local notifications provides. Revisit only if there's real appetite for
platform-specific widget code on top of what's already built.

## Stage 4 — Visual identity & public presentation (complete)

Not a functional stage — no new modules or engine work — but a deliberate pass on how the app
*presents* itself, prompted directly by user request.

| Item | Status | Notes |
|---|---|---|
| Icon system | 🟩 | Every emoji in the app (nav, streak flames, checkmarks, celebrations, pin/delete/undo actions) replaced with [Lucide](https://lucide.dev) icons. |
| Typography | 🟩 | Self-hosted [Satoshi](https://www.fontshare.com/fonts/satoshi) (Fontshare, free for commercial use) replacing the system-font stack, applied globally via the existing `--font-sans` design token. |
| Public README | 🟩 | Rewritten as a product showcase (not a technical doc) — real screenshots, a features table, design philosophy, no implementation details. |
| `.gitignore` | 🟩 | Hardened: explicit `.env`/`.env.local` patterns, `*.tsbuildinfo`, OS cruft (`Thumbs.db`). |

**Icons.** All nine emoji-as-icon usages found via a full-codebase Unicode-range search (bottom
nav, `StreakBadge`, `CelebrationOverlay`'s particle burst, the note pin toggle, the gym PR
celebration, "Taken" checkmarks, the recurring-task marker, the error boundary's crash face) were
replaced with `lucide-react` components. Scope was extended slightly beyond a literal
find-and-replace to cover the app's other icon-shaped glyphs for visual consistency: every
"+ Add" button's literal `+` character became a real `Plus` icon (via a new shared
`AddToggleButton` component, since the same "+ Add / Close" pattern was duplicated across 4
pages), and every plain-text "remove"/"undo"/"delete" action link picked up a matching
`Trash2`/`Undo2` icon.

**Font.** Fetched directly from Fontshare's CDN and self-hosted under `public/fonts/` (rather
than loaded from Fontshare's CDN at runtime) specifically to keep font loading offline-first,
consistent with the rest of this PWA — an external font CDN would silently fail to load with no
network, which is exactly the scenario this app is built to handle gracefully. Only the weights
actually used were kept (400, 500, 700 — no static 600/SemiBold cut exists for Satoshi, but the
browser's own font-weight matching correctly substitutes 700 for Tailwind's `font-semibold`
without any faux-bold synthesis, so nothing extra was needed there). License basis and exact
source files are documented in `public/fonts/LICENSE.md`.

**README.** Deliberately excludes any mention of the tech stack, code, or how it was built —
written the way a product's own marketing page would describe it, aimed at someone evaluating
the *app*, not the implementation.

## Stage 5 — Permission recovery, cross-module insight, dashboard laziness (complete)

User picked three of the open items from the "what's left" list to close out together — chosen
directly, not inferred.

| Item | Status | Notes |
|---|---|---|
| Native permission-recovery UX | 🟩 | In-app "Fix" banner for denied Android reminder permissions — see below. |
| Cross-module correlations | 🟩 | Phi-coefficient pattern detection, silent below a noise threshold — see below. |
| Dashboard data-fetch laziness | 🟩 | Secondary cards now mount (and query) only near-visible, not all at load. |

**Permission recovery.** The two Android permission gates discovered while verifying native
notifications in the prior stage (standard notification permission, plus the separate "Alarms &
reminders" exact-alarm permission) can each independently silently block a reminder from ever
firing, with zero in-app indication anything's wrong. `engine/reminders/permissionStatus.ts`
holds the pure decision logic (`evaluateReminderHealth`, 6 unit tests) — kept separate from the
actual plugin calls in `nativeNotifications.ts` (`checkNotificationPermission`,
`checkExactAlarmPermission`, `openExactAlarmSettings`, all from the plugin's existing public API)
so the logic is testable without mocking Capacitor. `NativeReminderPermissionBanner` shows on
Home only when there's a real problem *and* the user has actually set a reminder — no point
warning about a feature they aren't using. Verified live on a real emulator: denied the
notification permission, confirmed the correctly-worded banner appeared; used the banner's "Fix"
button to deep-link to the exact-alarm Settings screen, granted it, and confirmed the banner
disappeared afterward. Caught one real bug during that pass — the banner initially prioritized
the exact-alarm message when both permissions were unhealthy, but exact-alarm-denied alone still
*shows* a notification (just not necessarily on time), while notification-denied is a complete
blocker; fixed the priority so the more severe issue always wins the message. The existing
browser-only `NotificationPermissionBanner` is now gated to non-native platforms — it was
promoting the in-app foreground poll, which doesn't even run on native anymore.

**Cross-module correlations, not fabricated ones.** `modules/insights/correlations.ts` computes
a phi coefficient (the binary-variable form of Pearson correlation) between every pair of
streak-bearing modules' daily goal-met series over a trailing 30-day window (longer than the
7-day weekly-summary window, since correlation needs more history to be trustworthy than a
single week's headline does). Two thresholds keep this honest: a module must have actually been
goal-met on enough days to rule out chance alignment from a barely-used module
(`minActiveDays`), and the correlation itself must clear a minimum strength
(`minStrength`) — below either, nothing is shown, not a low-confidence guess. 11 unit tests
cover the math (perfect positive/negative, zero-variance-returns-null, a hand-computed partial
correlation) and the filtering. `CorrelationsCard` on Home renders nothing at all when the list
is empty — consistent with the project's existing "quiet unless genuinely useful" pattern (the
same choice made for the companion's resting state). Verified live that it correctly stays silent
on a fresh install; verifying it actually surfacing a real pattern would require weeks of varied
backdated history that the app's action functions don't support writing (the same limitation
already noted for the companion's `thriving` branch in Stage 3) — left to unit tests, which do
cover it directly.

**Dashboard data-fetch laziness.** The Stage 3 code-splitting pass made each dashboard card's
*code* lazy but not its *data* — since `React.lazy` only defers the module import, all 8
secondary cards' live-query subscriptions still fired together the moment Home rendered, just
after an async tick. `components/ui/LazyOnVisible.tsx` wraps each card in an `IntersectionObserver`
gate (falls back to mounting immediately if `IntersectionObserver` is unavailable) that defers
mounting — and therefore both the chunk import and the live query — until the card scrolls near
the viewport; once visible it stays mounted permanently (a mount-once gate, not virtualization,
so a card's data doesn't reset on scroll-away). Water stays eager since it's the hero card,
always visible on load. Verified live: scrolling Home correctly brought every lazy card's real
content in with zero console errors.

**Final verification**: `npx tsc -b` clean, `npx vitest run` — 20 files, 120/120 tests passing.
Rebuilt the web bundle and Android APK; the permission-recovery flow specifically was verified
end-to-end on a real emulator (not just compiled), including catching and fixing the message-
priority bug above through that live pass. Debug APK re-exported to
`~/Desktop/LifeOS-APK/LifeOS-debug.apk`.

## Decision thresholds (carried over from the original spec)

- If users find the all-in-one app overwhelming: cut default-visible modules, make everything
  opt-in with progressive disclosure. (The bottom nav already stays at 4 tabs — Home, Water,
  Supplements, Tasks — rather than growing to 9; the other 6 modules are reachable only from
  Home's bento grid, a deliberate choice to avoid nav-bar overcrowding.)
- If on-time reminders prove unreliable for anything safety-relevant (medication): prioritize
  the Capacitor wrapper immediately, don't ship a bare-PWA promise for that use case.
