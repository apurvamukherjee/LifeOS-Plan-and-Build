import {
  checkExactAlarmPermission,
  checkNotificationPermission,
  isNativePlatform,
} from '@/engine/reminders/nativeNotifications'
import { evaluateReminderHealth, type NativeReminderHealth } from '@/engine/reminders/permissionStatus'
import { useEffect, useState } from 'react'

/**
 * Re-checks on every visibility change (not just on mount) because the only way to fix a denied
 * permission is a trip to system Settings — the user leaves the app and comes back, so mount-only
 * would show stale "still broken" state right after they fixed it.
 */
export function useNativeReminderHealth(): NativeReminderHealth | null {
  const [health, setHealth] = useState<NativeReminderHealth | null>(null)

  useEffect(() => {
    if (!isNativePlatform()) return

    let cancelled = false
    async function check() {
      const [notification, exactAlarm] = await Promise.all([
        checkNotificationPermission(),
        checkExactAlarmPermission(),
      ])
      if (!cancelled) setHealth(evaluateReminderHealth(notification, exactAlarm))
    }

    void check()
    document.addEventListener('visibilitychange', check)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', check)
    }
  }, [])

  return health
}
