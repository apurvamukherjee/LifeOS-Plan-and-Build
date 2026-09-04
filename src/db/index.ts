import Dexie, { type EntityTable } from 'dexie'
import type {
  Budget,
  Exercise,
  Expense,
  Food,
  FoodLog,
  Medication,
  MedicationLog,
  Note,
  PushSubscriptionRecord,
  RecurringBill,
  Reminder,
  Setting,
  Streak,
  Supplement,
  SupplementLog,
  SyncMeta,
  Task,
  WaterLog,
  WishlistItem,
  Workout,
  WorkoutSet,
  WorkoutTemplate,
} from './schema'

export class LifeOsDB extends Dexie {
  waterLogs!: EntityTable<WaterLog, 'id'>
  settings!: EntityTable<Setting, 'id'>
  supplements!: EntityTable<Supplement, 'id'>
  supplementLogs!: EntityTable<SupplementLog, 'id'>
  tasks!: EntityTable<Task, 'id'>
  reminders!: EntityTable<Reminder, 'id'>
  streaks!: EntityTable<Streak, 'id'>
  pushSubscriptions!: EntityTable<PushSubscriptionRecord, 'id'>
  syncMeta!: EntityTable<SyncMeta, 'tableName'>
  wishlistItems!: EntityTable<WishlistItem, 'id'>
  notes!: EntityTable<Note, 'id'>
  expenses!: EntityTable<Expense, 'id'>
  budgets!: EntityTable<Budget, 'id'>
  recurringBills!: EntityTable<RecurringBill, 'id'>
  foods!: EntityTable<Food, 'id'>
  foodLogs!: EntityTable<FoodLog, 'id'>
  exercises!: EntityTable<Exercise, 'id'>
  workouts!: EntityTable<Workout, 'id'>
  workoutSets!: EntityTable<WorkoutSet, 'id'>
  workoutTemplates!: EntityTable<WorkoutTemplate, 'id'>
  medications!: EntityTable<Medication, 'id'>
  medicationLogs!: EntityTable<MedicationLog, 'id'>

  constructor() {
    super('lifeos')

    const stage1Stores = {
      waterLogs: 'id, loggedAt, syncStatus, updatedAt',
      settings: 'id, moduleKey, syncStatus, updatedAt',
      supplements: 'id, category, syncStatus, updatedAt',
      supplementLogs: 'id, supplementId, loggedAt, syncStatus, updatedAt',
      tasks: 'id, dueAt, completedAt, priority, syncStatus, updatedAt',
      reminders: 'id, entityType, entityId, scheduledAt, status, syncStatus, updatedAt',
      streaks: 'id, moduleKey, syncStatus, updatedAt',
      pushSubscriptions: 'id, syncStatus, updatedAt',
      syncMeta: 'tableName',
    }

    this.version(1).stores(stage1Stores)

    // Stage 2: Wishlist, Notes, Expenses, Food, Gym, Medication. Every Dexie version must
    // declare the FULL store set (not just the delta) — omitting stage1Stores here would tell
    // Dexie to drop those tables. See https://dexie.org/docs/Tutorial/Design#database-versioning.
    this.version(2).stores({
      ...stage1Stores,
      wishlistItems: 'id, status, sortOrder, syncStatus, updatedAt',
      notes: 'id, isPinned, syncStatus, updatedAt',
      expenses: 'id, direction, category, occurredAt, syncStatus, updatedAt',
      budgets: 'id, category, syncStatus, updatedAt',
      recurringBills: 'id, dayOfMonth, syncStatus, updatedAt',
      foods: 'id, isSavedMeal, syncStatus, updatedAt',
      foodLogs: 'id, foodId, mealSlot, loggedAt, syncStatus, updatedAt',
      exercises: 'id, muscleGroup, syncStatus, updatedAt',
      workouts: 'id, startedAt, completedAt, syncStatus, updatedAt',
      workoutSets: 'id, workoutId, exerciseId, syncStatus, updatedAt',
      workoutTemplates: 'id, syncStatus, updatedAt',
      medications: 'id, syncStatus, updatedAt',
      medicationLogs: 'id, medicationId, scheduledAt, status, syncStatus, updatedAt',
    })
  }
}

export const db = new LifeOsDB()
