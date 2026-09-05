import { db } from '@/db'
import { addExpenseRaw, listExpenses, listRecurringBills } from '@/db/repositories/expensesRepo'
import type { ExpenseDirection } from '@/db/schema'
import { triggerCelebration } from '@/engine/celebration/celebrationBus'
import { logEvent } from '@/engine/logging/logEvent'
import { getCurrentTimeZone, toLocalDateString } from '@/engine/streak/dateUtils'
import { EXPENSES_MODULE_KEY, expensesGoalEvaluator } from './goal'
import { hasBeenGeneratedForMonth, isBillDueByLocalDate } from './recurringBills'

export async function logExpense(fields: {
  amount: number
  direction: ExpenseDirection
  category: string
  note: string
}): Promise<void> {
  const { goalNewlyMet } = await logEvent({
    moduleKey: EXPENSES_MODULE_KEY,
    tablesInvolved: [db.expenses, db.settings],
    writeLog: () => addExpenseRaw({ ...fields, occurredAt: new Date().toISOString() }),
    goalEvaluator: expensesGoalEvaluator,
  })
  if (goalNewlyMet) triggerCelebration()
}

let isGeneratingRecurringBills = false

/**
 * Checks every recurring bill against today's local date and auto-creates an expense (a normal,
 * editable/removable one — see docs/modules/expenses.md for why this is simpler than a
 * pending-confirmation flow) for any that are due and haven't already produced one this month.
 * Safe to call often (e.g. on every app foreground) — idempotent via `hasBeenGeneratedForMonth`.
 *
 * The module-level `isGeneratingRecurringBills` guard matters more than it looks: the
 * check-then-write here isn't atomic (it reads `listExpenses()` before writing), so two
 * overlapping calls can each see "not generated yet" and both create an expense — this isn't
 * hypothetical, it's exactly what React 18 StrictMode's intentional double-invocation of
 * effects surfaced in `useAppForegroundEffects` during testing. The guard makes a second
 * concurrent call a no-op instead of a duplicate bill.
 */
export async function generateDueRecurringBills(timeZone: string = getCurrentTimeZone()): Promise<number> {
  if (isGeneratingRecurringBills) return 0
  isGeneratingRecurringBills = true

  try {
    const today = toLocalDateString(new Date().toISOString(), timeZone)
    const yearMonth = today.slice(0, 7)

    const [bills, expenses] = await Promise.all([listRecurringBills(), listExpenses()])
    const due = bills.filter(
      (bill) =>
        isBillDueByLocalDate(bill, today) && !hasBeenGeneratedForMonth(bill, expenses, yearMonth, timeZone),
    )

    for (const bill of due) {
      const { goalNewlyMet } = await logEvent({
        moduleKey: EXPENSES_MODULE_KEY,
        tablesInvolved: [db.expenses, db.settings],
        writeLog: () =>
          addExpenseRaw({
            amount: bill.amount,
            direction: 'out',
            category: bill.category,
            note: bill.label,
            occurredAt: new Date().toISOString(),
            recurringBillId: bill.id,
          }),
        goalEvaluator: expensesGoalEvaluator,
        timeZone,
      })
      if (goalNewlyMet) triggerCelebration()
    }

    return due.length
  } finally {
    isGeneratingRecurringBills = false
  }
}
