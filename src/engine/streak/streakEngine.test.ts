import { describe, expect, it } from 'vitest'
import { isStreakAtRisk, recordGoalMet, settleToDate } from './streakEngine'
import { DEFAULT_STREAK_CONFIG, EMPTY_STREAK_STATE, type StreakState } from './types'

describe('recordGoalMet', () => {
  it('starts a streak of 1 on the first-ever completion', () => {
    const result = recordGoalMet(EMPTY_STREAK_STATE, '2026-01-01')
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(1)
    expect(result.lastCompletedLocalDate).toBe('2026-01-01')
  })

  it('extends the streak across consecutive days', () => {
    let state = recordGoalMet(EMPTY_STREAK_STATE, '2026-01-01')
    state = recordGoalMet(state, '2026-01-02')
    state = recordGoalMet(state, '2026-01-03')
    expect(state.currentStreak).toBe(3)
    expect(state.longestStreak).toBe(3)
  })

  it('is a no-op when called again for the same local date', () => {
    const first = recordGoalMet(EMPTY_STREAK_STATE, '2026-01-01')
    const second = recordGoalMet(first, '2026-01-01')
    expect(second.currentStreak).toBe(1)
    expect(second.lastCompletedLocalDate).toBe('2026-01-01')
  })

  it('is a no-op for a backdated log (gap < 0)', () => {
    const state = recordGoalMet(EMPTY_STREAK_STATE, '2026-01-05')
    const backdated = recordGoalMet(state, '2026-01-03')
    expect(backdated.currentStreak).toBe(1)
    expect(backdated.lastCompletedLocalDate).toBe('2026-01-05')
  })

  it('bridges a single-day gap using one freeze', () => {
    let state: StreakState = { ...EMPTY_STREAK_STATE, freezesAvailable: 1 }
    state = recordGoalMet(state, '2026-01-01')
    // Skip 2026-01-02 entirely, log again on 2026-01-03 (a 1-day gap).
    state = recordGoalMet(state, '2026-01-03')
    expect(state.currentStreak).toBe(2)
    expect(state.freezesAvailable).toBe(0)
    expect(state.freezesUsedDates).toEqual(['2026-01-02'])
  })

  it('resets the streak when a gap exceeds available freezes, preserving longestStreak', () => {
    let state: StreakState = { ...EMPTY_STREAK_STATE, freezesAvailable: 0 }
    state = recordGoalMet(state, '2026-01-01')
    state = recordGoalMet(state, '2026-01-02')
    state = recordGoalMet(state, '2026-01-03') // streak of 3, longest = 3
    state = recordGoalMet(state, '2026-01-10') // 6-day gap, no freezes -> reset
    expect(state.currentStreak).toBe(1)
    expect(state.longestStreak).toBe(3)
    expect(state.freezesAvailable).toBe(0)
  })

  it('bridges a gap exactly equal to available freezes, consuming all of them', () => {
    let state: StreakState = { ...EMPTY_STREAK_STATE, freezesAvailable: 2 }
    state = recordGoalMet(state, '2026-01-01')
    // 3-day gap = 2 missed days, exactly matching the 2 available freezes.
    state = recordGoalMet(state, '2026-01-04')
    expect(state.currentStreak).toBe(2)
    expect(state.freezesAvailable).toBe(0)
    expect(state.freezesUsedDates).toEqual(['2026-01-02', '2026-01-03'])
  })

  it('regenerates a freeze at the configured milestone', () => {
    let state: StreakState = { ...EMPTY_STREAK_STATE }
    const dates = [
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
      '2026-01-04',
      '2026-01-05',
      '2026-01-06',
      '2026-01-07',
    ]
    for (const date of dates) {
      state = recordGoalMet(state, date)
    }
    expect(state.currentStreak).toBe(7)
    expect(state.freezesAvailable).toBe(1)
  })

  it('caps regenerated freezes at the configured limit', () => {
    let state: StreakState = { ...EMPTY_STREAK_STATE, freezesAvailable: DEFAULT_STREAK_CONFIG.freezeCap }
    let date = new Date('2026-01-01T00:00:00Z')
    for (let i = 0; i < 14; i++) {
      const iso = date.toISOString().slice(0, 10)
      state = recordGoalMet(state, iso)
      date = new Date(date.getTime() + 86_400_000)
    }
    expect(state.currentStreak).toBe(14)
    expect(state.freezesAvailable).toBe(DEFAULT_STREAK_CONFIG.freezeCap)
  })
})

describe('settleToDate', () => {
  it('leaves an active streak untouched when today is within the grace window', () => {
    const state = recordGoalMet(EMPTY_STREAK_STATE, '2026-01-01')
    const settled = settleToDate(state, '2026-01-02')
    expect(settled.currentStreak).toBe(1)
  })

  it('leaves a salvageable gap untouched without consuming freezes', () => {
    const state: StreakState = {
      ...recordGoalMet(EMPTY_STREAK_STATE, '2026-01-01'),
      freezesAvailable: 2,
    }
    const settled = settleToDate(state, '2026-01-03') // 1 missed day, 2 freezes available
    expect(settled.currentStreak).toBe(1)
    expect(settled.freezesAvailable).toBe(2)
    expect(settled.freezesUsedDates).toEqual([])
  })

  it('forces a reset when the gap exceeds available freezes, without a new log event', () => {
    const state: StreakState = {
      ...recordGoalMet(EMPTY_STREAK_STATE, '2026-01-01'),
      freezesAvailable: 0,
    }
    const settled = settleToDate(state, '2026-01-10')
    expect(settled.currentStreak).toBe(0)
    expect(settled.lastCompletedLocalDate).toBe('2026-01-01') // unchanged, no new log
  })

  it('does not double-consume freezes when a forced reset is followed by a new completion', () => {
    let state: StreakState = {
      ...recordGoalMet(EMPTY_STREAK_STATE, '2026-01-01'),
      freezesAvailable: 1,
    }
    state = settleToDate(state, '2026-01-10') // gap of 9 far exceeds 1 freeze -> reset
    expect(state.currentStreak).toBe(0)
    expect(state.freezesAvailable).toBe(1) // untouched by settleToDate

    state = recordGoalMet(state, '2026-01-10')
    expect(state.currentStreak).toBe(1)
    expect(state.freezesAvailable).toBe(1) // still untouched — no double-consumption
  })
})

describe('isStreakAtRisk', () => {
  it('is false when there is no active streak', () => {
    expect(isStreakAtRisk(EMPTY_STREAK_STATE, '2026-01-01')).toBe(false)
  })

  it('is false once today has already extended the streak', () => {
    const state = recordGoalMet(EMPTY_STREAK_STATE, '2026-01-01')
    expect(isStreakAtRisk(state, '2026-01-01')).toBe(false)
  })

  it('is true when an active streak has not been extended yet today', () => {
    const state = recordGoalMet(EMPTY_STREAK_STATE, '2026-01-01')
    expect(isStreakAtRisk(state, '2026-01-02')).toBe(true)
  })
})
