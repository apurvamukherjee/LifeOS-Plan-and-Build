import { datesBetweenExclusive, diffLocalDays } from './dateUtils'
import { DEFAULT_STREAK_CONFIG, type StreakConfig, type StreakState } from './types'

function regenerateFreezes(
  streakAfterUpdate: number,
  freezesAvailable: number,
  config: StreakConfig,
): number {
  if (streakAfterUpdate > 0 && streakAfterUpdate % config.freezeEarnEveryDays === 0) {
    return Math.min(freezesAvailable + 1, config.freezeCap)
  }
  return freezesAvailable
}

/**
 * Call after a log write once today's goal has been met. Idempotent — safe to call every time
 * the goal remains met on the same local date, not just on the crossing edge.
 */
export function recordGoalMet(
  state: StreakState,
  localDate: string,
  config: StreakConfig = DEFAULT_STREAK_CONFIG,
): StreakState {
  if (state.lastCompletedLocalDate === null) {
    const currentStreak = 1
    return {
      ...state,
      currentStreak,
      longestStreak: Math.max(state.longestStreak, currentStreak),
      lastCompletedLocalDate: localDate,
      lastEvaluatedLocalDate: localDate,
      freezesAvailable: regenerateFreezes(currentStreak, state.freezesAvailable, config),
    }
  }

  const gap = diffLocalDays(state.lastCompletedLocalDate, localDate)

  // Same-day repeat, or a backdated log — no streak mutation.
  if (gap <= 0) {
    return { ...state, lastEvaluatedLocalDate: localDate }
  }

  if (gap === 1) {
    const currentStreak = state.currentStreak + 1
    return {
      ...state,
      currentStreak,
      longestStreak: Math.max(state.longestStreak, currentStreak),
      lastCompletedLocalDate: localDate,
      lastEvaluatedLocalDate: localDate,
      freezesAvailable: regenerateFreezes(currentStreak, state.freezesAvailable, config),
    }
  }

  const missedDays = gap - 1
  if (missedDays <= state.freezesAvailable) {
    const bridgedDates = datesBetweenExclusive(state.lastCompletedLocalDate, localDate)
    const currentStreak = state.currentStreak + 1
    return {
      ...state,
      currentStreak,
      longestStreak: Math.max(state.longestStreak, currentStreak),
      lastCompletedLocalDate: localDate,
      lastEvaluatedLocalDate: localDate,
      freezesAvailable: regenerateFreezes(
        currentStreak,
        state.freezesAvailable - missedDays,
        config,
      ),
      freezesUsedDates: [...state.freezesUsedDates, ...bridgedDates],
    }
  }

  // Gap exceeds available freezes: the streak resets, but freezes are untouched and
  // longestStreak is preserved.
  const currentStreak = 1
  return {
    ...state,
    currentStreak,
    longestStreak: Math.max(state.longestStreak, currentStreak),
    lastCompletedLocalDate: localDate,
    lastEvaluatedLocalDate: localDate,
  }
}

/**
 * Call on app foreground/interval to detect a streak that has already died from an elapsed,
 * uncovered gap — without a new success event. Never consumes freezes itself (only
 * recordGoalMet spends them, only at the moment a gap is actually bridged), so calling this
 * repeatedly can never double-spend a freeze that a later recordGoalMet also accounts for.
 */
export function settleToDate(
  state: StreakState,
  todayLocalDate: string,
  // Reserved for future settle-time policy (e.g. partial freeze consumption); unused for now
  // since settleToDate must never itself spend a freeze.
  _config: StreakConfig = DEFAULT_STREAK_CONFIG,
): StreakState {
  if (state.lastCompletedLocalDate === null || state.currentStreak === 0) {
    return { ...state, lastEvaluatedLocalDate: todayLocalDate }
  }

  const gap = diffLocalDays(state.lastCompletedLocalDate, todayLocalDate)
  if (gap <= 1) {
    return { ...state, lastEvaluatedLocalDate: todayLocalDate }
  }

  const missedDays = gap - 1
  if (missedDays <= state.freezesAvailable) {
    // Salvageable — leave the streak and freezes alone. A future recordGoalMet call will
    // actually bridge the gap and consume the freezes at that point.
    return { ...state, lastEvaluatedLocalDate: todayLocalDate }
  }

  return {
    ...state,
    currentStreak: 0,
    lastEvaluatedLocalDate: todayLocalDate,
  }
}

/**
 * True when there's an active streak that hasn't been extended yet today — a proactive "log
 * something today or lose it" signal for the UI, distinct from settleToDate's job of detecting
 * a streak that has *already* died from a past uncovered gap.
 */
export function isStreakAtRisk(state: StreakState, todayLocalDate: string): boolean {
  return state.currentStreak > 0 && state.lastCompletedLocalDate !== todayLocalDate
}
