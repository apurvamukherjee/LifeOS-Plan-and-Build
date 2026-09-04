export type SyncStatus = 'synced' | 'pending' | 'conflict'

export interface BaseRecord {
  id: string
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
  deleted: boolean
}

export type ModuleKey = 'water' | 'supplements' | 'tasks'

// ---------------------------------------------------------------------------
// Water
// ---------------------------------------------------------------------------

export interface WaterLog extends BaseRecord {
  amountMl: number
  loggedAt: string
}

// ---------------------------------------------------------------------------
// Settings (generic scalar key/value store, per module)
// ---------------------------------------------------------------------------

export interface Setting extends BaseRecord {
  moduleKey: string
  key: string
  value: unknown
}

// ---------------------------------------------------------------------------
// Supplements
// ---------------------------------------------------------------------------

export interface ScheduleRule {
  type: 'daily' | 'weekdays' | 'custom-days'
  /** 0=Sunday..6=Saturday, only used when type is 'custom-days' */
  daysOfWeek?: number[]
  /** HH:mm 24h times the dose is scheduled for */
  times: string[]
}

export interface LoadingPhase {
  durationDays: number
  dosesPerDay: number
  doseAmount: number
}

export interface CyclingPattern {
  onDays: number
  offDays: number
  /** ISO date (YYYY-MM-DD) the current on/off cycle started counting from */
  cycleStartDate: string
}

export interface CycleConfig {
  loadingPhase?: LoadingPhase
  cyclingPattern?: CyclingPattern
}

export interface Supplement extends BaseRecord {
  name: string
  doseAmount: number
  doseUnit: string
  category: string
  scheduleRule: ScheduleRule
  cycleConfig: CycleConfig | null
  currentStock: number
  lowStockThreshold: number
}

export interface SupplementLog extends BaseRecord {
  supplementId: string
  loggedAt: string
  amount: number
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export type TaskPriority = 'low' | 'medium' | 'high'

export interface RecurrenceRule {
  freq: 'daily' | 'weekly' | 'monthly'
  interval: number
  /** 0=Sunday..6=Saturday, only used when freq is 'weekly' */
  daysOfWeek?: number[]
}

export interface Task extends BaseRecord {
  title: string
  notes: string
  dueAt: string | null
  priority: TaskPriority
  recurrenceRule: RecurrenceRule | null
  completedAt: string | null
}

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------

export type ReminderEntityType = 'task' | 'supplement' | 'water'
export type ReminderChannel = 'in-app' | 'push'
export type ReminderStatus = 'scheduled' | 'fired' | 'dismissed' | 'snoozed'

export interface Reminder extends BaseRecord {
  entityType: ReminderEntityType
  entityId: string
  scheduledAt: string
  repeatRule: RecurrenceRule | null
  channel: ReminderChannel
  status: ReminderStatus
}

// ---------------------------------------------------------------------------
// Streaks
// ---------------------------------------------------------------------------

export interface Streak extends BaseRecord {
  moduleKey: ModuleKey
  currentStreak: number
  longestStreak: number
  lastCompletedLocalDate: string | null
  freezesAvailable: number
  freezesUsedDates: string[]
  lastEvaluatedLocalDate: string | null
}

// ---------------------------------------------------------------------------
// Push subscriptions
// ---------------------------------------------------------------------------

export interface PushSubscriptionRecord extends BaseRecord {
  endpoint: string
  keys: { p256dh: string; auth: string }
  userAgent: string
}

// ---------------------------------------------------------------------------
// Sync metadata (local-only, never synced)
// ---------------------------------------------------------------------------

export interface SyncMeta {
  tableName: string
  cursor: string
}

export const SYNCABLE_TABLES = [
  'waterLogs',
  'settings',
  'supplements',
  'supplementLogs',
  'tasks',
  'reminders',
  'streaks',
  'pushSubscriptions',
] as const

export type SyncableTable = (typeof SYNCABLE_TABLES)[number]
