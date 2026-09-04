import Dexie, { type EntityTable } from 'dexie'
import type {
  PushSubscriptionRecord,
  Reminder,
  Setting,
  Streak,
  Supplement,
  SupplementLog,
  SyncMeta,
  Task,
  WaterLog,
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

  constructor() {
    super('lifeos')
    this.version(1).stores({
      waterLogs: 'id, loggedAt, syncStatus, updatedAt',
      settings: 'id, moduleKey, syncStatus, updatedAt',
      supplements: 'id, category, syncStatus, updatedAt',
      supplementLogs: 'id, supplementId, loggedAt, syncStatus, updatedAt',
      tasks: 'id, dueAt, completedAt, priority, syncStatus, updatedAt',
      reminders: 'id, entityType, entityId, scheduledAt, status, syncStatus, updatedAt',
      streaks: 'id, moduleKey, syncStatus, updatedAt',
      pushSubscriptions: 'id, syncStatus, updatedAt',
      syncMeta: 'tableName',
    })
  }
}

export const db = new LifeOsDB()
