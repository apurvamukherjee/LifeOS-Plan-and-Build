import { listActiveReminders, markReminderFired } from '@/db/repositories/remindersRepo'
import type { Reminder } from '@/db/schema'

const CHECK_INTERVAL_MS = 30_000

/**
 * In-app reminders only, per docs/ARCHITECTURE.md: this only fires while the tab is open and
 * foregrounded (a poll gated on Page Visibility + the Notification API). It is NOT a substitute
 * for real Web Push — see src/engine/reminders/pushSubscription.ts for that (currently
 * client-side-only scaffolding, no server exists yet to send pushes).
 */
async function checkDueReminders(): Promise<void> {
  if (document.visibilityState !== 'visible') return
  if (typeof Notification === 'undefined') return

  const now = Date.now()
  const reminders = await listActiveReminders()
  for (const reminder of reminders) {
    if (new Date(reminder.scheduledAt).getTime() <= now) {
      fireReminder(reminder)
      await markReminderFired(reminder.id)
    }
  }
}

function fireReminder(reminder: Reminder): void {
  if (Notification.permission !== 'granted') return
  new Notification('LifeOS reminder', {
    body: reminderBody(reminder),
    tag: reminder.id,
  })
}

function reminderBody(reminder: Reminder): string {
  switch (reminder.entityType) {
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

/** Starts the foreground poll. Returns a cleanup function. */
export function startReminderScheduler(): () => void {
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
