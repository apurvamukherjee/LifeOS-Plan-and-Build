import { listActiveReminders, markReminderFired, rescheduleReminder } from '@/db/repositories/remindersRepo'
import type { Reminder } from '@/db/schema'
import { bodyForEntityType, isNativePlatform } from './nativeNotifications'
import { nextOccurrenceOf } from './scheduling'

const CHECK_INTERVAL_MS = 30_000

/**
 * In-app-only fallback, per docs/ARCHITECTURE.md: fires only while the tab is open and
 * foregrounded (a poll gated on Page Visibility + the Notification API). On native platforms
 * (Capacitor Android/iOS) this doesn't even start — engine/reminders/nativeNotifications.ts
 * schedules a real OS-level notification instead, which is what actually fires reliably with
 * the app closed. This poll exists for the plain-browser/PWA case where no native scheduler is
 * available.
 */
async function checkDueReminders(): Promise<void> {
  if (document.visibilityState !== 'visible') return
  if (typeof Notification === 'undefined') return

  const now = Date.now()
  const reminders = await listActiveReminders()
  for (const reminder of reminders) {
    if (new Date(reminder.scheduledAt).getTime() <= now) {
      fireReminder(reminder)

      if (reminder.repeatRule) {
        // Advance to the next occurrence rather than leaving it permanently 'fired', so a daily
        // reminder actually recurs for users on the plain-browser fallback path.
        const at = new Date(reminder.scheduledAt)
        const next = nextOccurrenceOf(at.getHours(), at.getMinutes())
        await rescheduleReminder(reminder.id, next.toISOString())
      } else {
        await markReminderFired(reminder.id)
      }
    }
  }
}

function fireReminder(reminder: Reminder): void {
  if (Notification.permission !== 'granted') return
  new Notification('LifeOS reminder', {
    body: bodyForEntityType(reminder.entityType),
    tag: reminder.id,
  })
}

/** Starts the in-app foreground poll — a no-op returning a harmless cleanup on native platforms,
 * since scheduleNativeReminder (called wherever reminders are set) supersedes it there. */
export function startReminderScheduler(): () => void {
  if (isNativePlatform()) return () => {}

  void checkDueReminders()
  const intervalHandle = setInterval(checkDueReminders, CHECK_INTERVAL_MS)
  document.addEventListener('visibilitychange', checkDueReminders)

  return () => {
    clearInterval(intervalHandle)
    document.removeEventListener('visibilitychange', checkDueReminders)
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') return 'denied'
  if (Notification.permission === 'default') {
    return Notification.requestPermission()
  }
  return Notification.permission
}
