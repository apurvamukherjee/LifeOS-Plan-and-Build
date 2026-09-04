import { listExpensesForLocalDate } from '@/db/repositories/expensesRepo'
import type { GoalEvaluator } from '@/engine/logging/logEvent'

export const EXPENSES_MODULE_KEY = 'expenses' as const

/** Goal is simply "logged at least one transaction today" — awareness through consistent
 * logging is the habit being reinforced here, not a spending target. */
export const expensesGoalEvaluator: GoalEvaluator = {
  async isGoalMet(localDate, timeZone) {
    const todaysExpenses = await listExpensesForLocalDate(localDate, timeZone)
    return todaysExpenses.length > 0
  },
}
