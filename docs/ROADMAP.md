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
animations (OS/browser-level widgets aren't feasible for a plain PWA without a native wrapper;
Lottie was deferred as pure visual polish — the Gym module's text-based PR celebration covers
the "delight on achievement" moment for now). Revisit both in Stage 3 if it's worth the added
dependency weight.

## Stage 3 — Retention & polish (not started)

- Insights/correlations across modules (Bearable-style "what improves my streaks")
- Whoop-style data-as-coaching summaries
- Optional gentle gamification (companion/avatar, à la Finch)
- Lottie celebration animations; home-screen widgets (likely requires the Capacitor wrapper below)
- **Capacitor native wrapper** — only if in-app + Web Push reminders prove unreliable enough to
  hurt the medication use case; do not treat PWA scheduling as reliable for anything
  safety-relevant. See the "Reminder Service" section of `docs/ARCHITECTURE.md`. The Medication
  module's page carries an explicit in-app disclaimer about this until it's resolved.
- Revisit the ~550KB production bundle (route-level code-splitting) now that all 9 modules exist
  — flagged in `docs/BUILD_LOG.md`, not urgent but worth addressing before it grows further.

## Decision thresholds (carried over from the original spec)

- If users find the all-in-one app overwhelming: cut default-visible modules, make everything
  opt-in with progressive disclosure. (The bottom nav already stays at 4 tabs — Home, Water,
  Supplements, Tasks — rather than growing to 9; the other 6 modules are reachable only from
  Home's bento grid, a deliberate choice to avoid nav-bar overcrowding.)
- If on-time reminders prove unreliable for anything safety-relevant (medication): prioritize
  the Capacitor wrapper immediately, don't ship a bare-PWA promise for that use case.
