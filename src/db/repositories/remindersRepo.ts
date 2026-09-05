import { db } from '../index'
import type { BaseRecord, Reminder, ReminderEntityType } from '../schema'
import { insertRecord, softDeleteRecord, updateRecord } from './baseRepo'

export async function listActiveReminders(): Promise<Reminder[]> {
  const all = await db.reminders.toArray()
  return all.filter((reminder) => !reminder.deleted && reminder.status === 'scheduled')
}

/** At most one active reminder per entity is assumed for the MVP UI (see ReminderToggle). */
export async function getReminderForEntity(
  entityType: ReminderEntityType,
  entityId: string,
): Promise<Reminder | undefined> {
  const all = await db.reminders.where('entityId').equals(entityId).toArray()
  return all.find(
    (reminder) => !reminder.deleted && reminder.entityType === entityType && reminder.status === 'scheduled',
  )
}

export async function createReminder(fields: Omit<Reminder, keyof BaseRecord>): Promise<Reminder> {
  return insertRecord<Reminder>(db.reminders, fields)
}

export async function rescheduleReminder(id: string, scheduledAt: string): Promise<void> {
  return updateRecord<Reminder>(db.reminders, id, { scheduledAt, status: 'scheduled' })
}

export async function markReminderFired(id: string): Promise<void> {
  return updateRecord<Reminder>(db.reminders, id, { status: 'fired' })
}

export async function markReminderDismissed(id: string): Promise<void> {
  return updateRecord<Reminder>(db.reminders, id, { status: 'dismissed' })
}

export async function deleteReminder(id: string): Promise<void> {
  return softDeleteRecord<Reminder>(db.reminders, id)
}
