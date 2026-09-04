# Module: Notes (Stage 2 — not built)

## Two distinct jobs (don't conflate them)

1. **Quick capture** — sub-second launch, an "inbox" for unsorted thoughts, share-sheet/voice
   input. This is the priority for LifeOS.
2. **Structured notebook** (folders, rich text, tables) — secondary, add only if quick capture
   alone proves insufficient. Avoid rebuilding a mini-Notion (Notion's own trap: users "waste
   hours rearranging digital furniture").

## Feature spec

- Instant quick-capture inbox — a single tap/shortcut from the home screen opens straight to a
  blank note, auto-saving as the user types (no explicit save action).
- Lightweight tags and color-coding (Google Keep model) applied after the fact, not required
  at creation time.
- Optional reminder attached to a note (reuses the shared `reminders` table,
  `entityType: 'note'`).
- Share-target registration (PWA `share_target` manifest entry) so content shared from other
  apps lands directly in the inbox — nice-to-have, not required for a first pass.

## Data model sketch

- `notes`: `title: string | null, body: string, tags: string[], color: string | null,
  isPinned: boolean`
- Reuses `reminders` and `streaks` (`moduleKey: 'notes'`, goal probably "captured at least one
  note today" — but notes may be too irregular a habit for a streak to make sense; consider
  omitting the streak for this module rather than forcing a metric it doesn't fit.
