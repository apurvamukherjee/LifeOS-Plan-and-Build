# Module: Medication (Stage 2 — not built)

## Why it's separate from Supplements

Medication is safety-relevant (missed/late doses matter) where Supplements are not — this is
why the reminder-reliability caveat in `docs/ROADMAP.md` Stage 3 (Capacitor wrapper) applies to
this module specifically, not to Supplements.

## Feature spec

- Card-based dashboard, centered pop-up reminder at dose time; tone is "supportive companion,"
  not clinical.
- Progress ring confirming each logged dose; adherence percentage visible but shame-free (no
  guilt-tripping copy, no red/failure styling for a missed dose).
- Pill inventory / refill counting — user enters current pill count, app counts down and warns
  before running out.
- Customizable per-medication schedule (specific times, sound/vibration/voice reminder style).
- Built-in medicine identity library (shape/color) to help distinguish pills at a glance.
- Multiple profiles (for a caregiver managing meds for someone else) — out of scope for a
  single-user MVP extension; note if this becomes relevant.
- Local-first privacy is a stated differentiator versus competitors — reinforces the existing
  Dexie-first architecture, no extra work needed there.
- Adherence history view (calendar or list of taken/missed/skipped).

## Data model sketch (extends the existing pattern in `docs/DATA_MODEL.md`)

- `medications`: `name, dosage: string, shape, color, instructions: string, scheduleRule (JSON,
  reuse Supplements' ScheduleRule shape), currentStock: number, lowStockThreshold: number`
- `medicationLogs`: `medicationId (FK), scheduledAt, takenAt: string | null, status:
  'taken'|'missed'|'skipped'`
- Reuses the existing `reminders` table (`entityType: 'medication'`) and the existing
  `streaks` table (`moduleKey: 'medication'`) — no new shared-engine work needed, this module is
  additive on top of Stage 1's engine.

## Reminder-reliability note

Do not ship this module's reminders as a bare-PWA promise if adherence timing matters to the
user. Revisit the Capacitor native-wrapper decision (`docs/ROADMAP.md` Stage 3) before or
alongside building this module.
