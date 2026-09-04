import { GlassCard } from '@/components/ui/GlassCard'
import { getCurrentTimeZone } from '@/engine/streak/dateUtils'
import clsx from 'clsx'
import { useBudgets } from '../hooks/useBudgets'
import { useExpenses } from '../hooks/useExpenses'
import {
  computeBudgetStatuses,
  computeNetTotal,
  computeSpendByCategory,
  filterForLocalMonth,
  getCurrentYearMonth,
} from '../summary'

export function MonthlyOverview() {
  const expenses = useExpenses()
  const budgets = useBudgets()
  const timeZone = getCurrentTimeZone()
  const yearMonth = getCurrentYearMonth(timeZone)
  const monthExpenses = filterForLocalMonth(expenses ?? [], yearMonth, timeZone)
  const net = computeNetTotal(monthExpenses)
  const categoryTotals = computeSpendByCategory(monthExpenses)
  const budgetStatuses = computeBudgetStatuses(budgets ?? [], categoryTotals)

  return (
    <GlassCard className="flex flex-col gap-2">
      <span className="text-sm text-(--color-text-secondary)">This month</span>
      <span className={clsx('text-3xl font-semibold', net >= 0 ? 'text-streak' : 'text-action')}>
        {net >= 0 ? '+' : '-'}${Math.abs(net).toFixed(2)}
      </span>

      {categoryTotals.length > 0 && (
        <div className="flex flex-col gap-1 pt-1 text-xs text-(--color-text-secondary)">
          {categoryTotals.map((c) => (
            <div key={c.category} className="flex justify-between">
              <span>{c.category}</span>
              <span>${c.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {budgetStatuses.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-white/10 pt-2 text-xs">
          {budgetStatuses.map((b) => (
            <div key={b.category} className="flex justify-between">
              <span>{b.category} budget</span>
              <span className={b.remaining < 0 ? 'text-action' : 'text-streak'}>
                ${b.remaining.toFixed(2)} left of ${b.monthlyLimit.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
