# LifeOS Roadmap

Source spec: the original full product research doc (9 modules, glassmorphic design system,
market research) is preserved in [`docs/ORIGINAL_SPEC.md`](./ORIGINAL_SPEC.md). Everything below
is the scoping decision made on top of it.

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

## Stage 3 — Retention & polish (in progress)

| Item | Status | Notes |
|---|---|---|
| Route-level code-splitting | 🟩 | Every detail page now lazy-loads; see `docs/BUILD_LOG.md`. |
| Weekly cross-module coaching summary | 🟩 | Reuses every module's existing `GoalEvaluator` — see below. |
| Goal-completion celebration | 🟩 | Framer Motion particle burst, not Lottie — see below. |
| Optional gentle gamification (companion/avatar) | 🟩 | Simple SVG blob face, not an illustrated character — see below. |
| Home-screen widgets | ⬜ not feasible | Requires native platform APIs a plain PWA can't reach. |
| Capacitor native wrapper | ⬜ threshold not met | See reasoning below — do not build speculatively. |

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

**Capacitor wrapper — deliberately not built.** The threshold for this was always conditional:
"only if in-app + Web Push reminders prove unreliable enough to hurt the medication use case."
There is no usage data yet suggesting that's true — building it now would be speculative
engineering against a condition that hasn't been observed. Keep the Medication page's in-app
disclaimer as the honest interim state; revisit only if real reminder-reliability complaints
surface. See the "Reminder Service" section of `docs/ARCHITECTURE.md`.

**Home-screen widgets — not feasible as scoped.** OS-level home-screen widgets require native
platform APIs (WidgetKit on iOS, App Widgets on Android) that a plain PWA cannot reach at all,
with or without more engineering effort — this isn't a prioritization choice, it's a hard
platform constraint. It would only become possible after (and because of) the Capacitor wrapper
above, so it's gated on that same unmet threshold.

## Decision thresholds (carried over from the original spec)

- If users find the all-in-one app overwhelming: cut default-visible modules, make everything
  opt-in with progressive disclosure. (The bottom nav already stays at 4 tabs — Home, Water,
  Supplements, Tasks — rather than growing to 9; the other 6 modules are reachable only from
  Home's bento grid, a deliberate choice to avoid nav-bar overcrowding.)
- If on-time reminders prove unreliable for anything safety-relevant (medication): prioritize
  the Capacitor wrapper immediately, don't ship a bare-PWA promise for that use case.
