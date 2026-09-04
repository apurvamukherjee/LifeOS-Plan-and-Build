import { GlassCard } from '@/components/ui/GlassCard'
import { StreakBadge } from '@/components/ui/StreakBadge'
import { getCurrentTimeZone } from '@/engine/streak/dateUtils'
import { useStreak } from '@/hooks/useStreak'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { useExpenses } from '../hooks/useExpenses'
import { computeNetTotal, filterForLocalMonth, getCurrentYearMonth } from '../summary'

export function ExpensesDashboardCard() {
  const expenses = useExpenses()
  const streak = useStreak('expenses')
  const timeZone = getCurrentTimeZone()
  const monthExpenses = filterForLocalMonth(expenses ?? [], getCurrentYearMonth(timeZone), timeZone)
  const net = computeNetTotal(monthExpenses)

  return (
    <Link to="/expenses">
      <GlassCard interactive className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-(--color-text-secondary)">Expenses</span>
          <StreakBadge streak={streak} />
        </div>
        <span className={clsx('text-lg font-semibold', net >= 0 ? 'text-streak' : 'text-action')}>
          {net >= 0 ? '+' : '-'}${Math.abs(net).toFixed(2)} this month
        </span>
      </GlassCard>
    </Link>
  )
}
