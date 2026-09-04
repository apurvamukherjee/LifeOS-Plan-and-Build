import { db } from '@/db'
import { stampNewRecord } from '@/db/repositories/baseRepo'
import type { ModuleKey, Streak } from '@/db/schema'
import { getCurrentTimeZone, toLocalDateString } from '@/engine/streak/dateUtils'
import { recordGoalMet } from '@/engine/streak/streakEngine'
import { EMPTY_STREAK_STATE } from '@/engine/streak/types'
import { notifyLocalWrite } from '@/engine/sync/syncBus'
import type { Table } from 'dexie'

/**
 * Each module supplies one of these to decide whether *today's* goal is met after a log write.
 * Implementations query their own log table for `localDate` — Dexie automatically joins the
 * ambient transaction started by logEvent, so no explicit transaction handle needs threading
 * through.
 */
export interface GoalEvaluator {
  isGoalMet(localDate: string, timeZone: string): Promise<boolean>
}

interface LogEventParams<T> {
  moduleKey: ModuleKey
  /** Every Dexie table logEvent's write (and the goal check) touches, besides `streaks`. */
  tablesInvolved: Table[]
  writeLog: () => Promise<T>
  goalEvaluator: GoalEvaluator
  timeZone?: string
}

export interface LogEventOutcome<T> {
  result: T
  /** True only on the crossing edge — the goal was NOT met before this write and IS met after.
   * False on every subsequent log the same day once the goal is already met, so callers can use
   * this to trigger a celebration exactly once per day rather than on every repeat log. */
  goalNewlyMet: boolean
}

/**
 * Wraps a module's log-row insert and its streak update in a single IndexedDB transaction, so
 * a UI action can never leave a log written with a stale streak. See docs/ARCHITECTURE.md
 * ("Streak engine" section) for the full design.
 */
export async function logEvent<T>(params: LogEventParams<T>): Promise<LogEventOutcome<T>> {
  const timeZone = params.timeZone ?? getCurrentTimeZone()
  const localDate = toLocalDateString(new Date().toISOString(), timeZone)

  const outcome = await db.transaction('rw', [...params.tablesInvolved, db.streaks], async () => {
    const logResult = await params.writeLog()

    const goalMet = await params.goalEvaluator.isGoalMet(localDate, timeZone)
    let goalNewlyMet = false

    if (goalMet) {
      const existing = await db.streaks.where('moduleKey').equals(params.moduleKey).first()
      goalNewlyMet = existing?.lastCompletedLocalDate !== localDate

      const base: Streak =
        existing ??
        stampNewRecord<Streak>({ moduleKey: params.moduleKey, ...EMPTY_STREAK_STATE })
      const nextState = recordGoalMet(base, localDate)
      await db.streaks.put({
        ...base,
        ...nextState,
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
      })
    }

    return { result: logResult, goalNewlyMet }
  })

  notifyLocalWrite()
  return outcome
}
