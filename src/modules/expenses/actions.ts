import { db } from '@/db'
import { addExpenseRaw } from '@/db/repositories/expensesRepo'
import type { ExpenseDirection } from '@/db/schema'
import { logEvent } from '@/engine/logging/logEvent'
import { EXPENSES_MODULE_KEY, expensesGoalEvaluator } from './goal'

export async function logExpense(fields: {
  amount: number
  direction: ExpenseDirection
  category: string
  note: string
}): Promise<void> {
  await logEvent({
    moduleKey: EXPENSES_MODULE_KEY,
    tablesInvolved: [db.expenses, db.settings],
    writeLog: () => addExpenseRaw({ ...fields, occurredAt: new Date().toISOString() }),
    goalEvaluator: expensesGoalEvaluator,
  })
}
