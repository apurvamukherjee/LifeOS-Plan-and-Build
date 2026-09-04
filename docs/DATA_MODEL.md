# LifeOS Data Model (Stage 1 + Stage 2)

Every table shares these fields (defined once as `BaseRecord` in `src/db/schema.ts`):

| Field | Type | Notes |
|---|---|---|
| `id` | `string` (uuid) | `crypto.randomUUID()`, doubles as the Postgres PK |
| `createdAt` | `string` (ISO UTC) | set once at creation |
| `updatedAt` | `string` (ISO UTC) | bumped on every mutation incl. soft-delete; the LWW merge key |
| `syncStatus` | `'synced' \| 'pending' \| 'conflict'` | `'conflict'` reserved, unused in MVP |
| `deleted` | `boolean` | soft delete, synced like any other field |

## Dexie tables (`src/db/index.ts`)

- **`waterLogs`** — `amountMl: number`, `loggedAt: string`
- **`settings`** — `moduleKey: string`, `key: string`, `value: unknown (JSON)`. Generic
  key/value store for scalar config only (daily water goal, weight, quick-add presets,
  per-module goal mode). Structured/relational data lives on its own entity table instead.
- **`supplements`** — `name, doseAmount: number, doseUnit: string, category: string,
  scheduleRule: ScheduleRule (JSON), cycleConfig: CycleConfig | null (JSON), currentStock: number,
  lowStockThreshold: number`
- **`supplementLogs`** — `supplementId: string (FK), loggedAt: string, amount: number`
- **`tasks`** — `title: string, notes: string, dueAt: string | null, priority: 'low'|'medium'|'high',
  recurrenceRule: RecurrenceRule | null (JSON), completedAt: string | null`
- **`reminders`** — `entityType: 'task'|'supplement'|'water', entityId: string, scheduledAt: string,
  repeatRule: unknown | null (JSON), channel: 'in-app'|'push', status: 'scheduled'|'fired'|'dismissed'|'snoozed'`
- **`streaks`** — `moduleKey: ModuleKey, currentStreak: number,
  longestStreak: number, lastCompletedLocalDate: string | null (YYYY-MM-DD),
  freezesAvailable: number, freezesUsedDates: string[], lastEvaluatedLocalDate: string | null`
  — one row per module, enforced by repository `getOrCreate(moduleKey)`. `ModuleKey` is
  `'water'|'supplements'|'tasks'|'expenses'|'food'|'gym'|'medication'` — Notes and Wishlist
  deliberately have no streak (see their `docs/modules/*.md`).
- **`pushSubscriptions`** — `endpoint: string, keys: {p256dh: string; auth: string}, userAgent: string`
- **`syncMeta`** — **local-only, never synced.** PK is `tableName`; value is `cursor: string`
  (max `server_updated_at` seen for that table).

### Stage 2 tables

- **`wishlistItems`** — `name, price: number, quantity: number, category: string, store: string,
  wantNeedLevel: number (1-5), sortOrder: number, status: 'active'|'archived'|'purchased'`
- **`notes`** — `title: string | null, body: string, tags: string[], color: string | null,
  isPinned: boolean`
- **`expenses`** — `amount: number, direction: 'in'|'out', category: string, note: string,
  occurredAt: string`
- **`budgets`** — `category: string, monthlyLimit: number`
- **`recurringBills`** — `label: string, amount: number, dayOfMonth: number, category: string`
  (currently CRUD-only in the repo layer; no auto-generation UI yet)
- **`foods`** — `name, caloriesPerServing: number, proteinG: number, carbsG: number, fatG: number,
  servingUnit: string, isSavedMeal: boolean`
- **`foodLogs`** — `foodId: string | null (FK), freeTextName: string | null, servings: number,
  mealSlot: 'breakfast'|'lunch'|'dinner'|'snack', loggedAt: string`
- **`exercises`** — `name, muscleGroup: string, equipment: string`
- **`workouts`** — `name, notes: string, startedAt: string, completedAt: string | null`
- **`workoutSets`** — `workoutId: string (FK), exerciseId: string (FK), setIndex: number,
  reps: number, weightKg: number, rpe: number | null`
- **`workoutTemplates`** — `name, exerciseOrder: string[]` (CRUD-only in the repo layer; no
  "start from template" UI flow yet — starting a workout always begins blank)
- **`medications`** — same shape as `supplements` (`name, dosage: string, shape: string,
  color: string, instructions: string, scheduleRule: ScheduleRule (JSON), currentStock: number,
  lowStockThreshold: number`) — reuses the Supplements `ScheduleRule` type verbatim
- **`medicationLogs`** — `medicationId: string (FK), scheduledAt: string, takenAt: string | null,
  status: 'taken'|'missed'|'skipped'`

`isScheduledOn` (schedule-day matching) and `isLowStock` moved out of the Supplements module into
`src/engine/scheduling/scheduleRule.ts` and `src/engine/inventory/stock.ts` respectively during
Stage 2, since Medication needed the identical logic — Supplements' `cycleLogic.ts` now just
re-exports them for its existing importers.

## Supabase (`supabase/schema.sql`)

Each syncable table above (all except `syncMeta`) is mirrored 1:1 in Postgres with snake_case
columns, plus:

- `user_id uuid not null references auth.users(id) default auth.uid()`
- `server_updated_at timestamptz not null default now()`, bumped by an `on insert or update`
  trigger — this is the sync cursor column, deliberately separate from `updated_at`.
- Row-Level Security enabled, with `select/insert/update/delete` policies all restricted to
  `user_id = auth.uid()`.
- `settings` additionally has `unique(user_id, module_key, key)`.
- `streaks` additionally has `unique(user_id, module_key)`.

See `supabase/schema.sql` for the exact DDL (one representative table fully written out, the
same trigger+RLS pattern repeated for the rest).
