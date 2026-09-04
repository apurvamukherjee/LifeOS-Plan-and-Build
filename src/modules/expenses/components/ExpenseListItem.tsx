import { GlassCard } from '@/components/ui/GlassCard'
import { deleteExpense } from '@/db/repositories/expensesRepo'
import type { Expense } from '@/db/schema'
import clsx from 'clsx'

export function ExpenseListItem({ expense }: { expense: Expense }) {
  return (
    <GlassCard className="flex items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">
          {expense.category}
          {expense.note && ` · ${expense.note}`}
        </span>
        <span className="text-xs text-(--color-text-secondary)">
          {new Date(expense.occurredAt).toLocaleDateString()}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className={clsx('font-semibold', expense.direction === 'in' ? 'text-streak' : 'text-action')}>
          {expense.direction === 'in' ? '+' : '-'}${expense.amount.toFixed(2)}
        </span>
        <button
          type="button"
          onClick={() => deleteExpense(expense.id)}
          className="text-xs text-(--color-text-muted) underline"
        >
          remove
        </button>
      </div>
    </GlassCard>
  )
}
