import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { useEffect, useState } from 'react'

/**
 * Self-contained countdown — per docs/modules/gym.md this does NOT go through the shared
 * reminders table; it only needs to fire while this screen is open/foregrounded, so a local
 * component timer is sufficient (no in-app-vs-push distinction needed here).
 */
export function RestTimer() {
  const [duration, setDuration] = useState(90)
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (remaining === null) return
    if (remaining <= 0) {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Rest complete', { body: 'Time for your next set.' })
      }
      navigator.vibrate?.(200)
      setRemaining(null)
      return
    }
    const timeout = setTimeout(() => setRemaining((prev) => (prev ?? 1) - 1), 1000)
    return () => clearTimeout(timeout)
  }, [remaining])

  return (
    <GlassCard className="flex items-center justify-between gap-3">
      <span className="text-sm text-(--color-text-secondary)">Rest timer</span>
      {remaining !== null ? (
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold tabular-nums">{remaining}s</span>
          <button
            type="button"
            onClick={() => setRemaining(null)}
            className="text-xs text-(--color-text-muted) underline"
          >
            cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="glass w-16 rounded-lg px-2 py-1 text-sm text-(--color-text-primary) focus:outline-none"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) || 90)}
          />
          <Button variant="glass" onClick={() => setRemaining(duration)}>
            Start
          </Button>
        </div>
      )}
    </GlassCard>
  )
}
