import type { ReminderEntityType } from '@/db/schema'
import { removeDailyReminder, setDailyReminder } from '@/engine/reminders/reminderActions'
import { useReminderForEntity } from '@/hooks/useReminderForEntity'
import { Bell, BellOff } from 'lucide-react'
import { useState } from 'react'

interface ReminderToggleProps {
  entityType: ReminderEntityType
  entityId: string
}

/**
 * Per-entity daily reminder toggle. On native platforms, setting one registers a real OS-level
 * notification (see engine/reminders/nativeNotifications.ts); in the browser it falls back to
 * the in-app foreground poll. Either way, the UI here doesn't need to know which — it just calls
 * setDailyReminder/removeDailyReminder.
 */
export function ReminderToggle({ entityType, entityId }: ReminderToggleProps) {
  const reminder = useReminderForEntity(entityType, entityId)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [time, setTime] = useState('08:00')

  async function handleSave() {
    const [hour, minute] = time.split(':').map(Number)
    await setDailyReminder(entityType, entityId, hour, minute)
    setShowTimePicker(false)
  }

  if (reminder) {
    const label = new Date(reminder.scheduledAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
    return (
      <button
        type="button"
        onClick={() => removeDailyReminder(entityType, entityId)}
        className="flex items-center gap-1 text-xs text-water"
        aria-label="Remove reminder"
        title="Remove reminder"
      >
        <Bell size={12} /> {label}
      </button>
    )
  }

  if (showTimePicker) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="glass rounded-lg px-1 py-0.5 text-xs text-(--color-text-primary)"
        />
        <button type="button" onClick={handleSave} className="text-xs text-action underline">
          set
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setShowTimePicker(true)}
      className="flex items-center gap-1 text-xs text-(--color-text-muted)"
      aria-label="Add a daily reminder"
      title="Add a daily reminder"
    >
      <BellOff size={12} />
    </button>
  )
}
