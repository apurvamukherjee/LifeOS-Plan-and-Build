# Module: Expenses / Micro-Finance (Stage 2 — not built)

## Design principle

Simplicity over completeness — young-adult users abandon complex budgeting apps (average 3-4
tried before one sticks). Model: Pocket Clear's "two buttons: Money In, Money Out" plus a
Goodbudget-style simple category budget. Skip bank-sync entirely; the goal is *awareness*
("$400 on delivery this month"), not a zero-based budget.

## Feature spec

- Fast manual entry: amount, direction (in/out), category, optional note.
- Simple per-category monthly budgets (not full envelope accounting).
- Monthly spend overview by category — this is the retention hook (seeing the number changes
  behavior more than the logging itself).
- Optional recurring bills (fixed amount, fixed day of month) that auto-generate a pending
  entry to confirm/adjust rather than a full transaction scheduler.

## Data model sketch

- `expenses`: `amount: number, direction: 'in'|'out', category: string, note: string, occurredAt`
- `budgets`: `category: string, monthlyLimit: number`
- `recurringBills`: `label, amount, dayOfMonth: number, category`
- Reuses `streaks` (`moduleKey: 'expenses'`, goal = "logged at least one transaction today" or
  "reviewed this week's spend" — decide at build time). Reminders are lower priority for this
  module; a weekly "review your spending" nudge is more useful than a daily one.
