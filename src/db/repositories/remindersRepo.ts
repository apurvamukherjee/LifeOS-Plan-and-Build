import { db } from '../index'
import type { BaseRecord, Reminder } from '../schema'
import { insertRecord, softDeleteRecord, updateRecord } from './baseRepo'

export async function listActiveReminders(): Promise<Reminder[]> {
  const all = await db.reminders.toArray()
  return all.filter((reminder) => !reminder.deleted && reminder.status === 'scheduled')
}

export async function createReminder(fields: Omit<Reminder, keyof BaseRecord>): Promise<Reminder> {
  return insertRecord<Reminder>(db.reminders, fields)
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
