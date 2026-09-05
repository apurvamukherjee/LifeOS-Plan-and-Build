import type { Reminder, ReminderEntityType } from '@/db/schema'
import { Capacitor, type PermissionState } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform()
}

/** LocalNotifications needs a 32-bit integer id; reminders are identified by uuid strings, so
 * derive a stable numeric id from the uuid via a simple string hash. A collision would just mean
 * two reminders share one OS notification slot — extremely unlikely at personal-use data
 * volumes, and non-fatal (the OS just replaces the older one) rather than a real bug. */
function numericIdFor(reminderId: string): number {
  let hash = 0
  for (let i = 0; i < reminderId.length; i++) {
    hash = (hash * 31 + reminderId.charCodeAt(i)) | 0
  }
  return Math.abs(hash) || 1
}

/** Shared with the in-app poll in reminderScheduler.ts so both paths describe a reminder the
 * same way. */
export function bodyForEntityType(entityType: ReminderEntityType): string {
  switch (entityType) {
    case 'water':
      return "It's time to drink some water."
    case 'supplement':
      return 'A supplement dose is due.'
    case 'task':
      return 'A task is due.'
    case 'medication':
      return 'A medication dose is due.'
    case 'gym':
      return 'It might be time for a workout.'
    case 'food':
      return "Don't forget to log a meal."
    case 'note':
      return 'A note reminder is due.'
  }
}

export async function requestNativeNotificationPermission(): Promise<boolean> {
  if (!isNativePlatform()) return false
  const result = await LocalNotifications.requestPermissions()
  return result.display === 'granted'
}

/** Current notification-display permission, without prompting. 'granted' off-platform so callers
 * that gate on this don't need a separate isNativePlatform() check of their own. */
export async function checkNotificationPermission(): Promise<PermissionState> {
  if (!isNativePlatform()) return 'granted'
  const result = await LocalNotifications.checkPermissions()
  return result.display
}

/** Android 12+'s separate "Alarms & reminders" exact-alarm permission (see docs/CAPACITOR.md) —
 * unlike the notification permission, this can only be granted via openExactAlarmSettings()
 * below, never a runtime dialog. 'granted' off-platform and pre-Android-12, matching the
 * plugin's own behavior of treating those as not gated. */
export async function checkExactAlarmPermission(): Promise<PermissionState> {
  if (!isNativePlatform()) return 'granted'
  const result = await LocalNotifications.checkExactNotificationSetting()
  return result.exact_alarm
}

/** Deep-links to the system "Alarms & reminders" settings screen for this app — the only way to
 * grant the exact-alarm permission once denied. No-op (returns 'granted') off-platform. */
export async function openExactAlarmSettings(): Promise<PermissionState> {
  if (!isNativePlatform()) return 'granted'
  const result = await LocalNotifications.changeExactNotificationSetting()
  return result.exact_alarm
}

/**
 * Schedules (or replaces) an OS-level notification for this reminder — fires even if the app is
 * closed or backgrounded, unlike the in-app-only foreground poll in reminderScheduler.ts. A
 * no-op in the browser (`isNativePlatform()` false), so this is always safe to call
 * unconditionally from shared reminder-setting code.
 */
export async function scheduleNativeReminder(reminder: Reminder): Promise<void> {
  if (!isNativePlatform()) return
  const id = numericIdFor(reminder.id)
  const at = new Date(reminder.scheduledAt)

  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title: 'LifeOS reminder',
        body: bodyForEntityType(reminder.entityType),
        // A repeating reminder fires daily at this local wall-clock time (Capacitor's `on`
        // schedule is interpreted in the device's local timezone); a one-off fires once at `at`.
        schedule: reminder.repeatRule
          ? { on: { hour: at.getHours(), minute: at.getMinutes() }, allowWhileIdle: true }
          : { at, allowWhileIdle: true },
      },
    ],
  })
}

export async function cancelNativeReminder(reminderId: string): Promise<void> {
  if (!isNativePlatform()) return
  await LocalNotifications.cancel({ notifications: [{ id: numericIdFor(reminderId) }] })
}
