import { listWorkoutHistory } from '@/db/repositories/gymRepo'
import { toLocalDateString } from '@/engine/streak/dateUtils'
import type { GoalEvaluator } from '@/engine/logging/logEvent'

export const GYM_MODULE_KEY = 'gym' as const

/** Goal is "completed a workout today" — the finish action is what counts, not each set logged
 * along the way (see docs/modules/gym.md and actions.ts). */
export const gymGoalEvaluator: GoalEvaluator = {
  async isGoalMet(localDate, timeZone) {
    const history = await listWorkoutHistory()
    return history.some(
      (workout) => workout.completedAt && toLocalDateString(workout.completedAt, timeZone) === localDate,
    )
  },
}
