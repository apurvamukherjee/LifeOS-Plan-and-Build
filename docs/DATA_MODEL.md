# LifeOS Data Model (Stage 1 MVP)

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
- **`streaks`** — `moduleKey: 'water'|'supplements'|'tasks', currentStreak: number,
  longestStreak: number, lastCompletedLocalDate: string | null (YYYY-MM-DD),
  freezesAvailable: number, freezesUsedDates: string[], lastEvaluatedLocalDate: string | null`
  — one row per module, enforced by repository `getOrCreate(moduleKey)`.
- **`pushSubscriptions`** — `endpoint: string, keys: {p256dh: string; auth: string}, userAgent: string`
- **`syncMeta`** — **local-only, never synced.** PK is `tableName`; value is `cursor: string`
  (max `server_updated_at` seen for that table).

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
