import { listLogsForLocalDate, listSupplements } from '@/db/repositories/supplementsRepo'
import { getSettingOrDefault } from '@/db/repositories/settingsRepo'
import type { Supplement } from '@/db/schema'
import type { GoalEvaluator } from '@/engine/logging/logEvent'
import { getCyclePhase, isScheduledOn } from './cycleLogic'

export const SUPPLEMENTS_MODULE_KEY = 'supplements' as const

export type SupplementsGoalMode = 'any' | 'all-scheduled'

export async function getSupplementsGoalMode(): Promise<SupplementsGoalMode> {
  return getSettingOrDefault<SupplementsGoalMode>(SUPPLEMENTS_MODULE_KEY, 'goalMode', 'any')
}

export function isSupplementDueToday(supplement: Supplement, localDate: string): boolean {
  if (!isScheduledOn(supplement.scheduleRule, localDate)) return false
  const cyclingPattern = supplement.cycleConfig?.cyclingPattern
  if (cyclingPattern && getCyclePhase(cyclingPattern, localDate).phase === 'off') return false
  return true
}

/**
 * "Any dose logged" by default (goalMode = 'any') keeps the streak shame-free even for users
 * with many scheduled supplements; 'all-scheduled' is available for users who want strict
 * full-stack adherence. If nothing is due today (e.g. every supplement is in an off-cycle),
 * the streak falls back to "logged anything at all" so an off-schedule manual dose still counts.
 */
export const supplementsGoalEvaluator: GoalEvaluator = {
  async isGoalMet(localDate, timeZone) {
    const [supplements, todaysLogs, goalMode] = await Promise.all([
      listSupplements(),
      listLogsForLocalDate(localDate, timeZone),
      getSupplementsGoalMode(),
    ])
    const loggedSupplementIds = new Set(todaysLogs.map((log) => log.supplementId))

    const dueToday = supplements.filter((supplement) => isSupplementDueToday(supplement, localDate))
    if (dueToday.length === 0) return loggedSupplementIds.size > 0

    if (goalMode === 'all-scheduled') {
      return dueToday.every((supplement) => loggedSupplementIds.has(supplement.id))
    }
    return dueToday.some((supplement) => loggedSupplementIds.has(supplement.id))
  },
}
