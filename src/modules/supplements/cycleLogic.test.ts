import { describe, expect, it } from 'vitest'
import {
  computeSaturationPercent,
  getCyclePhase,
  isLowStock,
  isScheduledOn,
} from './cycleLogic'

describe('isScheduledOn', () => {
  it('is always scheduled for a daily rule', () => {
    expect(isScheduledOn({ type: 'daily', times: ['08:00'] }, '2026-01-04')).toBe(true) // Sunday
  })

  it('excludes weekends for a weekdays rule', () => {
    const rule = { type: 'weekdays' as const, times: ['08:00'] }
    expect(isScheduledOn(rule, '2026-01-05')).toBe(true) // Monday
    expect(isScheduledOn(rule, '2026-01-04')).toBe(false) // Sunday
    expect(isScheduledOn(rule, '2026-01-10')).toBe(false) // Saturday
  })

  it('matches only the configured days for a custom-days rule', () => {
    const rule = { type: 'custom-days' as const, daysOfWeek: [1, 3, 5], times: ['08:00'] }
    expect(isScheduledOn(rule, '2026-01-05')).toBe(true) // Monday
    expect(isScheduledOn(rule, '2026-01-06')).toBe(false) // Tuesday
  })
})

describe('getCyclePhase', () => {
  const pattern = { onDays: 3, offDays: 2, cycleStartDate: '2026-01-01' }

  it('reports the on-phase for the first onDays days', () => {
    expect(getCyclePhase(pattern, '2026-01-01')).toEqual({ phase: 'on', dayInPhase: 1 })
    expect(getCyclePhase(pattern, '2026-01-03')).toEqual({ phase: 'on', dayInPhase: 3 })
  })

  it('reports the off-phase for the remaining days', () => {
    expect(getCyclePhase(pattern, '2026-01-04')).toEqual({ phase: 'off', dayInPhase: 1 })
    expect(getCyclePhase(pattern, '2026-01-05')).toEqual({ phase: 'off', dayInPhase: 2 })
  })

  it('wraps into the next cycle correctly', () => {
    expect(getCyclePhase(pattern, '2026-01-06')).toEqual({ phase: 'on', dayInPhase: 1 })
  })

  it('handles a date before the cycle start without returning a negative day', () => {
    const result = getCyclePhase(pattern, '2025-12-31')
    expect(result.dayInPhase).toBeGreaterThan(0)
  })
})

describe('computeSaturationPercent', () => {
  it('saturates over the loading phase duration when configured', () => {
    const cycleConfig = { loadingPhase: { durationDays: 7, dosesPerDay: 4, doseAmount: 5 } }
    expect(computeSaturationPercent({ consistentDaysTaken: 7, cycleConfig })).toBe(100)
    expect(computeSaturationPercent({ consistentDaysTaken: 3, cycleConfig })).toBe(43)
  })

  it('falls back to a 28-day maintenance-only window with no loading phase', () => {
    expect(computeSaturationPercent({ consistentDaysTaken: 14, cycleConfig: null })).toBe(50)
  })

  it('caps at 100% even if days taken exceeds the duration', () => {
    const cycleConfig = { loadingPhase: { durationDays: 7, dosesPerDay: 4, doseAmount: 5 } }
    expect(computeSaturationPercent({ consistentDaysTaken: 30, cycleConfig })).toBe(100)
  })
})

describe('isLowStock', () => {
  it('is true when stock is at or below the threshold', () => {
    expect(isLowStock(5, 5)).toBe(true)
    expect(isLowStock(4, 5)).toBe(true)
  })

  it('is false when stock is above the threshold', () => {
    expect(isLowStock(6, 5)).toBe(false)
  })
})
