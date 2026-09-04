import { GlassCard } from '@/components/ui/GlassCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { StreakBadge } from '@/components/ui/StreakBadge'
import { useStreak } from '@/hooks/useStreak'
import { Link } from 'react-router-dom'
import { useWaterToday } from '../hooks/useWaterToday'

export function WaterDashboardCard() {
  const today = useWaterToday()
  const streak = useStreak('water')

  return (
    <Link to="/water">
      <GlassCard interactive className="flex items-center gap-4">
        <ProgressRing
          progress={today?.progress ?? 0}
          colorVar="--color-water"
          size={72}
          strokeWidth={7}
        >
          <span className="text-sm font-semibold">
            {today ? Math.round(today.progress * 100) : 0}%
          </span>
        </ProgressRing>
        <div className="flex flex-col">
          <span className="text-sm text-(--color-text-secondary)">Water</span>
          <span className="text-lg font-semibold">
            {today ? `${today.totalMl} / ${today.goalMl} ml` : '—'}
          </span>
          <StreakBadge streak={streak} />
        </div>
      </GlassCard>
    </Link>
  )
}
