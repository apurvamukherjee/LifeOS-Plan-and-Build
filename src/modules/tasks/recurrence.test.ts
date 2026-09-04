import { describe, expect, it } from 'vitest'
import { getNextDueDate } from './recurrence'

describe('getNextDueDate', () => {
  it('adds the interval in days for a daily rule', () => {
    expect(getNextDueDate({ freq: 'daily', interval: 1 }, '2026-01-01')).toBe('2026-01-02')
    expect(getNextDueDate({ freq: 'daily', interval: 3 }, '2026-01-01')).toBe('2026-01-04')
  })

  it('finds the next configured weekday within the same week', () => {
    // 2026-01-05 is a Monday; next configured day (Wed=3) is later this week.
    const rule = { freq: 'weekly' as const, interval: 1, daysOfWeek: [1, 3, 5] }
    expect(getNextDueDate(rule, '2026-01-05')).toBe('2026-01-07') // Wednesday
  })

  it('wraps to next week when past all configured days', () => {
    // 2026-01-09 is a Friday, the last configured day -> wrap to Monday.
    const rule = { freq: 'weekly' as const, interval: 1, daysOfWeek: [1, 3, 5] }
    expect(getNextDueDate(rule, '2026-01-09')).toBe('2026-01-12') // next Monday
  })

  it('falls back to a plain N-week step without specific days', () => {
    expect(getNextDueDate({ freq: 'weekly', interval: 2 }, '2026-01-01')).toBe('2026-01-15')
  })

  it('adds the interval in months for a monthly rule, clamping at month end', () => {
    expect(getNextDueDate({ freq: 'monthly', interval: 1 }, '2026-01-15')).toBe('2026-02-15')
    expect(getNextDueDate({ freq: 'monthly', interval: 1 }, '2026-01-31')).toBe('2026-02-28')
  })
})
