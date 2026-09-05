import { GlassCard } from '@/components/ui/GlassCard'
import { deleteExpense } from '@/db/repositories/expensesRepo'
import type { Expense } from '@/db/schema'
import clsx from 'clsx'
import { Repeat, Trash2 } from 'lucide-react'

export function ExpenseListItem({ expense }: { expense: Expense }) {
  return (
    <GlassCard className="flex items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">
          {expense.category}
          {expense.note && ` · ${expense.note}`}
        </span>
        <span className="flex items-center gap-1 text-xs text-(--color-text-secondary)">
          {new Date(expense.occurredAt).toLocaleDateString()}
          {expense.recurringBillId && (
            <span className="flex items-center gap-0.5">
              <Repeat size={10} /> auto
            </span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className={clsx('font-semibold', expense.direction === 'in' ? 'text-streak' : 'text-action')}>
          {expense.direction === 'in' ? '+' : '-'}${expense.amount.toFixed(2)}
        </span>
        <button
          type="button"
          onClick={() => deleteExpense(expense.id)}
          className="flex items-center gap-1 text-xs text-(--color-text-muted) underline"
        >
          <Trash2 size={12} /> remove
        </button>
      </div>
    </GlassCard>
  )
}
