import { describe, expect, it } from 'vitest'
import { nextOccurrenceOf } from './scheduling'

describe('nextOccurrenceOf', () => {
  it('returns later today when the time has not passed yet', () => {
    const now = new Date(2026, 0, 15, 8, 0, 0)
    const result = nextOccurrenceOf(20, 0, now)
    expect(result.getDate()).toBe(15)
    expect(result.getHours()).toBe(20)
  })

  it('rolls to tomorrow when the time has already passed today', () => {
    const now = new Date(2026, 0, 15, 21, 0, 0)
    const result = nextOccurrenceOf(20, 0, now)
    expect(result.getDate()).toBe(16)
    expect(result.getHours()).toBe(20)
  })

  it('rolls to tomorrow at the exact boundary (treats "now" as already passed)', () => {
    const now = new Date(2026, 0, 15, 20, 0, 0)
    const result = nextOccurrenceOf(20, 0, now)
    expect(result.getDate()).toBe(16)
  })

  it('rolls over a month boundary correctly', () => {
    const now = new Date(2026, 0, 31, 21, 0, 0)
    const result = nextOccurrenceOf(20, 0, now)
    expect(result.getMonth()).toBe(1) // February
    expect(result.getDate()).toBe(1)
  })
})
