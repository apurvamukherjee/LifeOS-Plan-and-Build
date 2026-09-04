import { describe, expect, it } from 'vitest'
import { datesBetweenExclusive, diffLocalDays, toLocalDateString } from './dateUtils'

describe('toLocalDateString', () => {
  it('rolls a UTC instant back to "yesterday" across a negative UTC offset', () => {
    // 03:00 UTC on Jan 15 is 22:00 EST on Jan 14 (America/New_York is UTC-5 in January).
    expect(toLocalDateString('2026-01-15T03:00:00.000Z', 'America/New_York')).toBe('2026-01-14')
  })

  it('maps the same UTC instant to different local dates in different timezones', () => {
    const instant = '2026-01-15T03:00:00.000Z'
    const nyDate = toLocalDateString(instant, 'America/New_York')
    const tokyoDate = toLocalDateString(instant, 'Asia/Tokyo')
    expect(nyDate).toBe('2026-01-14')
    expect(tokyoDate).toBe('2026-01-15')
    expect(nyDate).not.toBe(tokyoDate)
  })

  it('is stable across a DST spring-forward transition (America/New_York, 2026-03-08)', () => {
    // Local noon the day before and the day of a DST transition should still land on their
    // own respective calendar dates, not skip or duplicate a day.
    const before = toLocalDateString('2026-03-08T16:00:00.000Z', 'America/New_York') // 11:00 EST
    const after = toLocalDateString('2026-03-09T16:00:00.000Z', 'America/New_York') // 12:00 EDT
    expect(before).toBe('2026-03-08')
    expect(after).toBe('2026-03-09')
  })
})

describe('diffLocalDays', () => {
  it('is 1 for consecutive calendar dates, including across a DST boundary', () => {
    // Pure date-string arithmetic has no notion of elapsed real-world hours (23 vs 24 vs 25
    // across a DST transition) — this is what makes the streak engine structurally DST-safe.
    expect(diffLocalDays('2026-03-08', '2026-03-09')).toBe(1)
  })

  it('is 0 for the same date', () => {
    expect(diffLocalDays('2026-05-01', '2026-05-01')).toBe(0)
  })

  it('is antisymmetric', () => {
    expect(diffLocalDays('2026-01-01', '2026-01-10')).toBe(-diffLocalDays('2026-01-10', '2026-01-01'))
  })

  it('handles a multi-month gap', () => {
    expect(diffLocalDays('2026-01-01', '2026-03-01')).toBe(59) // 2026 is not a leap year
  })
})

describe('datesBetweenExclusive', () => {
  it('returns the dates strictly between two dates', () => {
    expect(datesBetweenExclusive('2026-01-01', '2026-01-05')).toEqual([
      '2026-01-02',
      '2026-01-03',
      '2026-01-04',
    ])
  })

  it('returns an empty array for adjacent dates', () => {
    expect(datesBetweenExclusive('2026-01-01', '2026-01-02')).toEqual([])
  })
})
