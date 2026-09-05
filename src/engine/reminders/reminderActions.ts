import {
  createReminder,
  deleteReminder,
  getReminderForEntity,
  rescheduleReminder,
} from '@/db/repositories/remindersRepo'
import type { Reminder, ReminderEntityType } from '@/db/schema'
import {
  cancelNativeReminder,
  isNativePlatform,
  requestNativeNotificationPermission,
  scheduleNativeReminder,
} from './nativeNotifications'
import { nextOccurrenceOf } from './scheduling'

/**
 * Sets (or replaces) a daily reminder for one entity — e.g. "remind me about this medication at
 * 8:00am every day." On native platforms this also registers a real OS-level notification
 * (requesting permission first), so it fires even with the app closed; in the browser it falls
 * back to the existing in-app foreground poll (reminderScheduler.ts) for the same row.
 */
export async function setDailyReminder(
  entityType: ReminderEntityType,
  entityId: string,
  hour: number,
  minute: number,
): Promise<void> {
  if (isNativePlatform()) {
    await requestNativeNotificationPermission()
  }

  const scheduledAt = nextOccurrenceOf(hour, minute).toISOString()
  const existing = await getReminderForEntity(entityType, entityId)

  let reminder: Reminder
  if (existing) {
    await rescheduleReminder(existing.id, scheduledAt)
    reminder = { ...existing, scheduledAt, status: 'scheduled' }
  } else {
    reminder = await createReminder({
      entityType,
      entityId,
      scheduledAt,
      repeatRule: { freq: 'daily', interval: 1 },
      channel: isNativePlatform() ? 'push' : 'in-app',
      status: 'scheduled',
    })
  }

  await scheduleNativeReminder(reminder)
}

export async function removeDailyReminder(entityType: ReminderEntityType, entityId: string): Promise<void> {
  const existing = await getReminderForEntity(entityType, entityId)
  if (!existing) return
  await cancelNativeReminder(existing.id)
  await deleteReminder(existing.id)
}
