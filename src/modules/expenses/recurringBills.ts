import type { Expense, RecurringBill } from '@/db/schema'
import { toLocalDateString } from '@/engine/streak/dateUtils'

/** True once today's local date has reached the bill's configured day of month. A `dayOfMonth`
 * past the end of a shorter month (e.g. 31 in February) clamps to that month's actual last day,
 * rather than never firing that month. */
export function isBillDueByLocalDate(bill: RecurringBill, todayLocalDate: string): boolean {
  const [year, month, day] = todayLocalDate.split('-').map(Number)
  const lastDayOfMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const effectiveDueDay = Math.min(bill.dayOfMonth, lastDayOfMonth)
  return day >= effectiveDueDay
}

/** Has this bill already produced an expense (identified by `recurringBillId`) whose local
 * date falls within the given 'YYYY-MM'? Prevents re-generating the same bill twice a month. */
export function hasBeenGeneratedForMonth(
  bill: RecurringBill,
  expenses: Expense[],
  yearMonth: string,
  timeZone: string,
): boolean {
  return expenses.some(
    (expense) =>
      expense.recurringBillId === bill.id &&
      toLocalDateString(expense.occurredAt, timeZone).startsWith(yearMonth),
  )
}
