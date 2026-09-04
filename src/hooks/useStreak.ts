import { db } from '@/db'
import type { ModuleKey, Streak } from '@/db/schema'
import { getCurrentTimeZone, toLocalDateString } from '@/engine/streak/dateUtils'
import { isStreakAtRisk } from '@/engine/streak/streakEngine'
import { useLiveQuery } from 'dexie-react-hooks'

export function useStreak(moduleKey: ModuleKey): Streak | undefined {
  return useLiveQuery(() => db.streaks.where('moduleKey').equals(moduleKey).first(), [moduleKey])
}

/** Whether an active streak hasn't been extended yet today — see streakEngine.isStreakAtRisk. */
export function streakIsAtRisk(streak: Streak | undefined): boolean {
  if (!streak) return false
  const today = toLocalDateString(new Date().toISOString(), getCurrentTimeZone())
  return isStreakAtRisk(streak, today)
}
