import { GlassCard } from '@/components/ui/GlassCard'
import { StreakBadge } from '@/components/ui/StreakBadge'
import { getCurrentTimeZone, toLocalDateString } from '@/engine/streak/dateUtils'
import { useStreak } from '@/hooks/useStreak'
import { Link } from 'react-router-dom'
import { isSupplementDueToday } from '../goal'
import { useSupplementLogsToday } from '../hooks/useSupplementLogsToday'
import { useSupplements } from '../hooks/useSupplements'

export function SupplementDashboardCard() {
  const supplements = useSupplements()
  const loggedIds = useSupplementLogsToday()
  const streak = useStreak('supplements')

  const today = toLocalDateString(new Date().toISOString(), getCurrentTimeZone())
  const due = supplements?.filter((supplement) => isSupplementDueToday(supplement, today)) ?? []
  const takenCount = due.filter((supplement) => loggedIds?.has(supplement.id)).length

  return (
    <Link to="/supplements">
      <GlassCard interactive className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-(--color-text-secondary)">Supplements</span>
          <StreakBadge streak={streak} />
        </div>
        <span className="text-lg font-semibold">
          {due.length > 0
            ? `${takenCount} / ${due.length} taken today`
            : `${supplements?.length ?? 0} tracked`}
        </span>
      </GlassCard>
    </Link>
  )
}
