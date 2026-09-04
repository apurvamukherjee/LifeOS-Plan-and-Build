import { getTotalMlForLocalDate } from '@/db/repositories/waterRepo'
import { getSettingOrDefault } from '@/db/repositories/settingsRepo'
import type { GoalEvaluator } from '@/engine/logging/logEvent'

export const WATER_MODULE_KEY = 'water' as const
export const DEFAULT_WATER_GOAL_ML = 2000
export const WATER_QUICK_ADD_PRESETS_ML = [150, 250, 350, 500]

export async function getWaterGoalMl(): Promise<number> {
  return getSettingOrDefault(WATER_MODULE_KEY, 'dailyGoalMl', DEFAULT_WATER_GOAL_ML)
}

export const waterGoalEvaluator: GoalEvaluator = {
  async isGoalMet(localDate, timeZone) {
    const [goalMl, totalMl] = await Promise.all([
      getWaterGoalMl(),
      getTotalMlForLocalDate(localDate, timeZone),
    ])
    return totalMl >= goalMl
  },
}
