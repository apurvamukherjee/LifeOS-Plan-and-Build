import type { ModuleWeeklyStat } from '@/modules/insights/weeklySummary'
import { describe, expect, it } from 'vitest'
import { getCompanionMood, pickCompanionMessage } from './mood'

function makeStat(daysMet: number, totalDays = 7): ModuleWeeklyStat {
  return { moduleKey: 'water', label: 'Water', daysMet, totalDays }
}

describe('getCompanionMood', () => {
  it('is resting with no stats at all', () => {
    expect(getCompanionMood([])).toBe('resting')
  })

  it('is resting when nothing was logged all week', () => {
    expect(getCompanionMood([makeStat(0), makeStat(0)])).toBe('resting')
  })

  it('is content for moderate activity', () => {
    // 7 met out of 21 possible = 1/3
    expect(getCompanionMood([makeStat(7), makeStat(0), makeStat(0)])).toBe('content')
  })

  it('is thriving at or above the 60% threshold', () => {
    // 14 met out of 21 possible = 2/3
    expect(getCompanionMood([makeStat(7), makeStat(7), makeStat(0)])).toBe('thriving')
  })

  it('is never resting when there is any met day, even a single one', () => {
    expect(getCompanionMood([makeStat(1)])).not.toBe('resting')
  })
})

describe('pickCompanionMessage', () => {
  it('is deterministic for the same mood and seed', () => {
    expect(pickCompanionMessage('thriving', 5)).toBe(pickCompanionMessage('thriving', 5))
  })

  it('stays within bounds for negative or large seeds', () => {
    expect(() => pickCompanionMessage('resting', -3)).not.toThrow()
    expect(() => pickCompanionMessage('content', 999)).not.toThrow()
  })
})
