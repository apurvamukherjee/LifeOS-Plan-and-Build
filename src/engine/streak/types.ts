export type ModuleKey = 'water' | 'supplements' | 'tasks'

/**
 * Pure state the streak engine operates on. Deliberately shaped to match (a subset of) the
 * Dexie `Streak` record so callers can pass a DB row in directly and spread the result back.
 */
export interface StreakState {
  currentStreak: number
  longestStreak: number
  lastCompletedLocalDate: string | null
  freezesAvailable: number
  freezesUsedDates: string[]
  lastEvaluatedLocalDate: string | null
}

export interface StreakConfig {
  /** Award one freeze every N days of streak. */
  freezeEarnEveryDays: number
  /** Maximum number of freezes that can be banked at once. */
  freezeCap: number
}

export const DEFAULT_STREAK_CONFIG: StreakConfig = {
  freezeEarnEveryDays: 7,
  freezeCap: 2,
}

export const EMPTY_STREAK_STATE: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedLocalDate: null,
  freezesAvailable: 0,
  freezesUsedDates: [],
  lastEvaluatedLocalDate: null,
}
