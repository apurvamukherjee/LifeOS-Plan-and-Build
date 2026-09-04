import { listCompletedOnLocalDate } from '@/db/repositories/tasksRepo'
import { getSettingOrDefault } from '@/db/repositories/settingsRepo'
import type { GoalEvaluator } from '@/engine/logging/logEvent'

export const TASKS_MODULE_KEY = 'tasks' as const
export const DEFAULT_DAILY_TASK_GOAL_COUNT = 1

export async function getDailyTaskGoalCount(): Promise<number> {
  return getSettingOrDefault(TASKS_MODULE_KEY, 'dailyGoalCount', DEFAULT_DAILY_TASK_GOAL_COUNT)
}

export const tasksGoalEvaluator: GoalEvaluator = {
  async isGoalMet(localDate, timeZone) {
    const [completedToday, goalCount] = await Promise.all([
      listCompletedOnLocalDate(localDate, timeZone),
      getDailyTaskGoalCount(),
    ])
    return completedToday.length >= goalCount
  },
}
