import { GlassCard } from '@/components/ui/GlassCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { useStreak } from '@/hooks/useStreak'
import { undoWaterLog } from '@/modules/water/actions'
import { WaterQuickAdd } from '@/modules/water/components/WaterQuickAdd'
import { useWaterToday } from '@/modules/water/hooks/useWaterToday'
import { Flame, Undo2 } from 'lucide-react'

export function WaterPage() {
  const today = useWaterToday()
  const streak = useStreak('water')

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Water</h1>

      <GlassCard className="flex flex-col items-center gap-3 py-8">
        <ProgressRing progress={today?.progress ?? 0} size={140} strokeWidth={12}>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-semibold">{today?.totalMl ?? 0}ml</span>
            <span className="text-xs text-(--color-text-secondary)">
              of {today?.goalMl ?? 0}ml
            </span>
          </div>
        </ProgressRing>
        {streak && streak.currentStreak > 0 && (
          <span className="flex items-center gap-1 text-sm text-streak">
            <Flame size={16} /> {streak.currentStreak}-day streak · best {streak.longestStreak}
          </span>
        )}
      </GlassCard>

      <WaterQuickAdd />

      <GlassCard className="flex flex-col gap-2">
        <span className="text-sm text-(--color-text-secondary)">Today's log</span>
        {today?.logs.length ? (
          <ul className="flex flex-col gap-1">
            {today.logs.map((log) => (
              <li key={log.id} className="flex items-center justify-between text-sm">
                <span>
                  {new Date(log.loggedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>{log.amountMl}ml</span>
                <button
                  type="button"
                  onClick={() => undoWaterLog(log.id)}
                  className="flex items-center gap-1 text-xs text-(--color-text-muted) underline"
                >
                  <Undo2 size={12} /> undo
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-(--color-text-muted)">No water logged yet today.</span>
        )}
      </GlassCard>
    </div>
  )
}
