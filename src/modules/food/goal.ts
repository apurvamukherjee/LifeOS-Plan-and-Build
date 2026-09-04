import { listFoodLogsForLocalDate } from '@/db/repositories/foodRepo'
import type { MealSlot } from '@/db/schema'
import type { GoalEvaluator } from '@/engine/logging/logEvent'

export const FOOD_MODULE_KEY = 'food' as const

/** Goal is "logged at least one meal today" — per docs/modules/food.md, logging consistency is
 * the habit being reinforced, not diet compliance. */
export const foodGoalEvaluator: GoalEvaluator = {
  async isGoalMet(localDate, timeZone) {
    const logs = await listFoodLogsForLocalDate(localDate, timeZone)
    return logs.length > 0
  },
}

export function guessMealSlot(now: Date = new Date()): MealSlot {
  const hour = now.getHours()
  if (hour < 11) return 'breakfast'
  if (hour < 16) return 'lunch'
  if (hour < 21) return 'dinner'
  return 'snack'
}
