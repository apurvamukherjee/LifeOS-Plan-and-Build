import { GlassCard } from '@/components/ui/GlassCard'
import { StreakBadge } from '@/components/ui/StreakBadge'
import { useStreak } from '@/hooks/useStreak'
import { Link } from 'react-router-dom'
import { useActiveWorkout } from '../hooks/useGym'

export function GymDashboardCard() {
  const streak = useStreak('gym')
  const activeWorkout = useActiveWorkout()

  return (
    <Link to="/gym">
      <GlassCard interactive className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-(--color-text-secondary)">Gym</span>
          <StreakBadge streak={streak} />
        </div>
        <span className="text-lg font-semibold">
          {activeWorkout ? 'Workout in progress' : 'Start a workout'}
        </span>
      </GlassCard>
    </Link>
  )
}
