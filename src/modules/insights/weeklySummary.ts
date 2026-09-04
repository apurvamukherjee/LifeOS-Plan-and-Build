import type { ModuleKey } from '@/db/schema'
import { getCurrentTimeZone } from '@/engine/streak/dateUtils'
import { countGoalMetDays, getLastNLocalDates } from './dateRange'
import { STREAK_MODULES } from './moduleRegistry'

export interface ModuleWeeklyStat {
  moduleKey: ModuleKey
  label: string
  daysMet: number
  totalDays: number
}

export interface WeeklySummary {
  dates: string[]
  stats: ModuleWeeklyStat[]
}

export async function computeWeeklySummary(timeZone: string = getCurrentTimeZone()): Promise<WeeklySummary> {
  const dates = getLastNLocalDates(7, timeZone)
  const stats = await Promise.all(
    STREAK_MODULES.map(async ({ moduleKey, label, evaluator }) => ({
      moduleKey,
      label,
      daysMet: await countGoalMetDays(evaluator, dates, timeZone),
      totalDays: dates.length,
    })),
  )
  return { dates, stats }
}

/**
 * A Whoop-style "data-as-coaching" headline distilled from the week's stats — shame-free
 * framing ("room to grow", not "you failed") consistent with the app's tone throughout.
 */
export function generateCoachingHeadline(stats: ModuleWeeklyStat[]): string {
  const anyActivity = stats.some((stat) => stat.daysMet > 0)
  if (!anyActivity) return 'Log something today to start building your week.'

  const sorted = [...stats].sort((a, b) => b.daysMet - a.daysMet)
  const best = sorted[0]
  const weakest = sorted[sorted.length - 1]

  if (best.daysMet === weakest.daysMet) {
    return `Consistent week across the board — ${best.daysMet}/${best.totalDays} days.`
  }
  return `Strongest this week: ${best.label} (${best.daysMet}/${best.totalDays}). Room to grow: ${weakest.label} (${weakest.daysMet}/${weakest.totalDays}).`
}
