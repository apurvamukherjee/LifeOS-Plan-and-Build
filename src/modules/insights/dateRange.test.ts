import { describe, expect, it, vi } from 'vitest'
import { countGoalMetDays, getLastNLocalDates } from './dateRange'

describe('getLastNLocalDates', () => {
  it('returns n dates ending today, oldest first', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'))

    const dates = getLastNLocalDates(7, 'UTC')

    expect(dates).toHaveLength(7)
    expect(dates[0]).toBe('2026-01-09')
    expect(dates[6]).toBe('2026-01-15')

    vi.useRealTimers()
  })

  it('has no duplicate or out-of-order dates', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-01T00:00:00.000Z'))

    const dates = getLastNLocalDates(5, 'UTC')
    expect(new Set(dates).size).toBe(5)
    expect([...dates].sort()).toEqual(dates)

    vi.useRealTimers()
  })
})

describe('countGoalMetDays', () => {
  it('counts how many of the given dates the evaluator reports as met', async () => {
    const evaluator = {
      isGoalMet: vi.fn(async (date: string) => date === '2026-01-01' || date === '2026-01-03'),
    }
    const count = await countGoalMetDays(evaluator, ['2026-01-01', '2026-01-02', '2026-01-03'], 'UTC')
    expect(count).toBe(2)
  })

  it('is 0 when nothing was met', async () => {
    const evaluator = { isGoalMet: vi.fn(async () => false) }
    const count = await countGoalMetDays(evaluator, ['2026-01-01', '2026-01-02'], 'UTC')
    expect(count).toBe(0)
  })
})
