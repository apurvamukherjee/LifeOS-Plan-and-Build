import { listActiveReminders } from '@/db/repositories/remindersRepo'
import { openExactAlarmSettings, requestNativeNotificationPermission } from '@/engine/reminders/nativeNotifications'
import { useNativeReminderHealth } from '@/hooks/useNativeReminderHealth'
import { useLiveQuery } from 'dexie-react-hooks'
import { Button } from './Button'
import { GlassCard } from './GlassCard'

/**
 * Native-Android-only counterpart to NotificationPermissionBanner: nudges the user back to fix
 * whichever of the two permission gates (see docs/CAPACITOR.md) is currently blocking their
 * reminders from actually firing. Silent unless there's both a real problem AND at least one
 * reminder the user has actually set — no point warning about a feature they aren't using.
 */
export function NativeReminderPermissionBanner() {
  const health = useNativeReminderHealth()
  const reminders = useLiveQuery(() => listActiveReminders(), [])

  if (!health?.hasIssue || !reminders?.length) return null

  // Notification-denied is checked first: it means nothing will ever display, a complete
  // blocker. Exact-alarm-denied alone still shows a notification, just possibly not exactly on
  // time (an inexact alarm) — a real but lesser problem, so it only gets its own message once
  // the more severe one is resolved.
  const message = health.notificationDenied
    ? 'Your reminders are off — LifeOS needs permission to notify you.'
    : "Your reminders won't fire exactly on time — Android needs one more permission."

  async function handleFix() {
    if (health?.notificationDenied) {
      await requestNativeNotificationPermission()
    } else {
      await openExactAlarmSettings()
    }
  }

  return (
    <GlassCard className="flex items-center justify-between gap-3">
      <span className="text-sm text-(--color-text-secondary)">{message}</span>
      <Button variant="glass" onClick={handleFix}>
        Fix
      </Button>
    </GlassCard>
  )
}
