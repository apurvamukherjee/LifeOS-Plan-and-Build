import { GlassCard } from '@/components/ui/GlassCard'
import { StreakBadge } from '@/components/ui/StreakBadge'
import { useStreak } from '@/hooks/useStreak'
import { Link } from 'react-router-dom'
import { useFoodToday } from '../hooks/useFoodToday'

export function FoodDashboardCard() {
  const today = useFoodToday()
  const streak = useStreak('food')

  return (
    <Link to="/food">
      <GlassCard interactive className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-(--color-text-secondary)">Food</span>
          <StreakBadge streak={streak} />
        </div>
        <span className="text-lg font-semibold">{Math.round(today?.totals.calories ?? 0)} cal today</span>
      </GlassCard>
    </Link>
  )
}
