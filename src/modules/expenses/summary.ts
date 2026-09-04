import type { Budget, Expense } from '@/db/schema'
import { getCurrentTimeZone, toLocalDateString } from '@/engine/streak/dateUtils'

export interface CategoryTotal {
  category: string
  total: number
}

export function computeNetTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + (expense.direction === 'in' ? expense.amount : -expense.amount), 0)
}

/** Spend (direction 'out' only) grouped by category, highest-spend first. */
export function computeSpendByCategory(expenses: Expense[]): CategoryTotal[] {
  const totals = new Map<string, number>()
  for (const expense of expenses) {
    if (expense.direction !== 'out') continue
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount)
  }
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

/** `yearMonth` is 'YYYY-MM'; filtering happens on the LOCAL calendar date, consistent with the
 * timezone-safety principle used throughout the streak engine — not the UTC-stored `occurredAt`. */
export function filterForLocalMonth(expenses: Expense[], yearMonth: string, timeZone: string): Expense[] {
  return expenses.filter((expense) => toLocalDateString(expense.occurredAt, timeZone).startsWith(yearMonth))
}

export function getCurrentYearMonth(timeZone: string = getCurrentTimeZone()): string {
  return toLocalDateString(new Date().toISOString(), timeZone).slice(0, 7)
}

export interface BudgetStatus {
  category: string
  monthlyLimit: number
  spent: number
  remaining: number
}

export function computeBudgetStatuses(budgets: Budget[], monthCategoryTotals: CategoryTotal[]): BudgetStatus[] {
  const spentByCategory = new Map(monthCategoryTotals.map((c) => [c.category, c.total]))
  return budgets.map((budget) => {
    const spent = spentByCategory.get(budget.category) ?? 0
    return { category: budget.category, monthlyLimit: budget.monthlyLimit, spent, remaining: budget.monthlyLimit - spent }
  })
}
