import type { GoalEvaluator } from '@/engine/logging/logEvent'
import { getCurrentTimeZone, toLocalDateString } from '@/engine/streak/dateUtils'

/** The last `n` local calendar dates (YYYY-MM-DD), oldest first, ending today. */
export function getLastNLocalDates(n: number, timeZone: string = getCurrentTimeZone()): string[] {
  const nowIso = new Date().toISOString()
  const dates: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const instant = new Date(Date.parse(nowIso) - i * 86_400_000).toISOString()
    dates.push(toLocalDateString(instant, timeZone))
  }
  return dates
}

/**
 * Counts how many of the given dates a module's goal was met on. Works retroactively for any
 * past date because every GoalEvaluator is a pure read over that date's historical logs (see
 * engine/logging/logEvent.ts) — it doesn't depend on today's mutable streak state, so this is a
 * safe way to reconstruct a weekly view without any new per-module bookkeeping.
 */
export async function countGoalMetDays(
  evaluator: GoalEvaluator,
  dates: string[],
  timeZone: string,
): Promise<number> {
  let count = 0
  for (const date of dates) {
    if (await evaluator.isGoalMet(date, timeZone)) count++
  }
  return count
}
