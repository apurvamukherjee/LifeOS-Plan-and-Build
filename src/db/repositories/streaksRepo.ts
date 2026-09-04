import { getCurrentTimeZone, toLocalDateString } from '@/engine/streak/dateUtils'
import { settleToDate } from '@/engine/streak/streakEngine'
import { db } from '../index'
import type { ModuleKey, Streak } from '../schema'

export async function getStreak(moduleKey: ModuleKey): Promise<Streak | undefined> {
  return db.streaks.where('moduleKey').equals(moduleKey).first()
}

/**
 * Call on app foreground to detect a streak that already died from an uncovered gap since it
 * was last evaluated, without requiring a new log event. Safe to call often — settleToDate is
 * idempotent for dates already accounted for and never spends a freeze itself.
 */
export async function settleStreak(moduleKey: ModuleKey, timeZone = getCurrentTimeZone()): Promise<void> {
  const streak = await getStreak(moduleKey)
  if (!streak) return

  const today = toLocalDateString(new Date().toISOString(), timeZone)
  if (streak.lastEvaluatedLocalDate === today) return // already settled today

  const nextState = settleToDate(streak, today)
  await db.streaks.put({
    ...streak,
    ...nextState,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  })
}
