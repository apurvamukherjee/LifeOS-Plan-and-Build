import { isNativePlatform } from '@/engine/reminders/nativeNotifications'
import { requestNotificationPermission } from '@/engine/reminders/reminderScheduler'
import { useState } from 'react'
import { Button } from './Button'
import { GlassCard } from './GlassCard'

/** Browser-only: on native platforms reminders are real OS notifications gated by different
 * permissions entirely (see NativeReminderPermissionBanner), and the in-app poll this banner is
 * for doesn't even run there (reminderScheduler.ts no-ops on native). */
export function NotificationPermissionBanner() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  )

  if (isNativePlatform()) return null
  if (permission !== 'default') return null

  return (
    <GlassCard className="flex items-center justify-between gap-3">
      <span className="text-sm text-(--color-text-secondary)">
        Enable reminders while LifeOS is open?
      </span>
      <Button
        variant="glass"
        onClick={async () => {
          const result = await requestNotificationPermission()
          setPermission(result)
        }}
      >
        Enable
      </Button>
    </GlassCard>
  )
}
