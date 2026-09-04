# LifeOS Roadmap

Source spec: the original full product research doc (9 modules, glassmorphic design system,
market research) is preserved in [`docs/ORIGINAL_SPEC.md`](./ORIGINAL_SPEC.md). Everything below
is the scoping decision made on top of it.

## Stage 1 — MVP (in progress)

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

**Stage 1 MVP is complete.** End-to-end verified in a real browser (Playwright, 2026-09-05):
logging water/a supplement dose/completing a task all update progress rings, streaks, and the
home dashboard correctly, with zero console errors, backed by real IndexedDB. The production
build's service worker was verified to serve the app (including previously-logged data) with
the network fully disabled. See `docs/BUILD_LOG.md` for the full detail behind each phase.

Update this table (⬜ → 🟩) as phases land — see [`docs/BUILD_LOG.md`](./BUILD_LOG.md) for the
dated detail behind each change.

## Stage 2 — Expand trackers (not started)

Each module below has a condensed spec + data-model sketch ready in `docs/modules/`, extracted
from the original research so this stage can start without re-deriving requirements:

- [Medication](./modules/medication.md) — adherence tracking, inventory/refills, caregiver profiles
- [Food & Nutrition](./modules/food.md) — tiered logging (quick-add/barcode/saved meals/photo-voice)
- [Gym & Workouts](./modules/gym.md) — set-by-set logging, rest timer, templates, PRs
- [Expenses](./modules/expenses.md) — Money-In/Money-Out simplicity, category budgets
- [Wishlist](./modules/wishlist.md) — running total, want/need level, category subtotals
- [Notes](./modules/notes.md) — quick-capture inbox, tags, share-target

Also planned for this stage: home-screen widgets, Lottie celebration moments on goal completion.

## Stage 3 — Retention & polish (not started)

- Insights/correlations across modules (Bearable-style "what improves my streaks")
- Whoop-style data-as-coaching summaries
- Optional gentle gamification (companion/avatar, à la Finch)
- **Capacitor native wrapper** — only if in-app + Web Push reminders prove unreliable enough to
  hurt the (future) medication use case; do not treat PWA scheduling as reliable for anything
  safety-relevant. See the "Reminder Service" section of `docs/ARCHITECTURE.md`.

## Decision thresholds (carried over from the original spec)

- If users find the all-in-one app overwhelming: cut default-visible modules, make everything
  opt-in with progressive disclosure.
- If on-time reminders prove unreliable for anything safety-relevant (medication): prioritize
  the Capacitor wrapper immediately, don't ship a bare-PWA promise for that use case.
