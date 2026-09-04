import { describe, expect, it } from 'vitest'
import { generateCoachingHeadline, type ModuleWeeklyStat } from './weeklySummary'

function makeStat(overrides: Partial<ModuleWeeklyStat>): ModuleWeeklyStat {
  return { moduleKey: 'water', label: 'Water', daysMet: 0, totalDays: 7, ...overrides }
}

describe('generateCoachingHeadline', () => {
  it('encourages logging when nothing has happened all week', () => {
    const stats = [makeStat({ daysMet: 0 }), makeStat({ label: 'Tasks', daysMet: 0 })]
    expect(generateCoachingHeadline(stats)).toMatch(/log something/i)
  })

  it('highlights the strongest and weakest modules when they differ', () => {
    const stats = [
      makeStat({ label: 'Water', daysMet: 7 }),
      makeStat({ label: 'Gym', daysMet: 1 }),
    ]
    const headline = generateCoachingHeadline(stats)
    expect(headline).toContain('Water (7/7)')
    expect(headline).toContain('Gym (1/7)')
    expect(headline).not.toMatch(/fail|bad|missed/i)
  })

  it('reports a consistent week when every module is tied', () => {
    const stats = [makeStat({ daysMet: 4 }), makeStat({ label: 'Tasks', daysMet: 4 })]
    expect(generateCoachingHeadline(stats)).toBe('Consistent week across the board — 4/7 days.')
  })
})
