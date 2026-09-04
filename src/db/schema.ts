export type SyncStatus = 'synced' | 'pending' | 'conflict'

export interface BaseRecord {
  id: string
  createdAt: string
  updatedAt: string
  syncStatus: SyncStatus
  deleted: boolean
}

export type ModuleKey = 'water' | 'supplements' | 'tasks' | 'expenses' | 'food' | 'gym' | 'medication'

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
// Wishlist
// ---------------------------------------------------------------------------

export type WishlistItemStatus = 'active' | 'archived' | 'purchased'

export interface WishlistItem extends BaseRecord {
  name: string
  price: number
  quantity: number
  category: string
  store: string
  /** 1 (pure want) .. 5 (genuine need) */
  wantNeedLevel: number
  sortOrder: number
  status: WishlistItemStatus
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export interface Note extends BaseRecord {
  title: string | null
  body: string
  tags: string[]
  color: string | null
  isPinned: boolean
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

export type ExpenseDirection = 'in' | 'out'

export interface Expense extends BaseRecord {
  amount: number
  direction: ExpenseDirection
  category: string
  note: string
  occurredAt: string
}

export interface Budget extends BaseRecord {
  category: string
  monthlyLimit: number
}

export interface RecurringBill extends BaseRecord {
  label: string
  amount: number
  /** 1-31; if a month is shorter, treated as that month's last day */
  dayOfMonth: number
  category: string
}

// ---------------------------------------------------------------------------
// Food
// ---------------------------------------------------------------------------

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface Food extends BaseRecord {
  name: string
  caloriesPerServing: number
  proteinG: number
  carbsG: number
  fatG: number
  servingUnit: string
  isSavedMeal: boolean
}

export interface FoodLog extends BaseRecord {
  foodId: string | null
  freeTextName: string | null
  servings: number
  mealSlot: MealSlot
  loggedAt: string
}

// ---------------------------------------------------------------------------
// Gym
// ---------------------------------------------------------------------------

export interface Exercise extends BaseRecord {
  name: string
  muscleGroup: string
  equipment: string
}

export interface Workout extends BaseRecord {
  name: string
  notes: string
  startedAt: string
  completedAt: string | null
}

export interface WorkoutSet extends BaseRecord {
  workoutId: string
  exerciseId: string
  setIndex: number
  reps: number
  weightKg: number
  rpe: number | null
}

export interface WorkoutTemplate extends BaseRecord {
  name: string
  exerciseOrder: string[]
}

// ---------------------------------------------------------------------------
// Medication
// ---------------------------------------------------------------------------

export type MedicationLogStatus = 'taken' | 'missed' | 'skipped'

export interface Medication extends BaseRecord {
  name: string
  dosage: string
  shape: string
  color: string
  instructions: string
  scheduleRule: ScheduleRule
  currentStock: number
  lowStockThreshold: number
}

export interface MedicationLog extends BaseRecord {
  medicationId: string
  scheduledAt: string
  takenAt: string | null
  status: MedicationLogStatus
}

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------

export type ReminderEntityType = 'task' | 'supplement' | 'water' | 'medication' | 'gym' | 'food' | 'note'
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
  'wishlistItems',
  'notes',
  'expenses',
  'budgets',
  'recurringBills',
  'foods',
  'foodLogs',
  'exercises',
  'workouts',
  'workoutSets',
  'workoutTemplates',
  'medications',
  'medicationLogs',
] as const

export type SyncableTable = (typeof SYNCABLE_TABLES)[number]
