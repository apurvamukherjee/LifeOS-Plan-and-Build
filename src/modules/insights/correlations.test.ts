import type { ModuleKey } from '@/db/schema'
import { describe, expect, it } from 'vitest'
import { computeModuleCorrelations, describeCorrelation, phiCoefficient } from './correlations'

describe('phiCoefficient', () => {
  it('returns 1 for two identical series with variance', () => {
    const a = [true, false, true, false, true, false, true, false]
    expect(phiCoefficient(a, a)).toBe(1)
  })

  it('returns -1 for two perfectly opposite series', () => {
    const a = [true, false, true, false, true, false]
    const b = a.map((v) => !v)
    expect(phiCoefficient(a, b)).toBe(-1)
  })

  it('returns null when a series has zero variance (all true)', () => {
    const a = [true, true, true, true]
    const b = [true, false, true, false]
    expect(phiCoefficient(a, b)).toBeNull()
  })

  it('returns null when a series has zero variance (all false)', () => {
    const a = [false, false, false, false]
    const b = [true, false, true, false]
    expect(phiCoefficient(a, b)).toBeNull()
  })

  it('returns null for mismatched lengths or empty input', () => {
    expect(phiCoefficient([true], [true, false])).toBeNull()
    expect(phiCoefficient([], [])).toBeNull()
  })

  it('computes a known partial correlation from a hand-built contingency table', () => {
    // n11=3, n10=1, n01=1, n00=3 -> phi = (3*3 - 1*1) / sqrt(4*4*4*4) = 8/16 = 0.5
    const a = [true, true, true, true, false, false, false, false]
    const b = [true, true, true, false, true, false, false, false]
    expect(phiCoefficient(a, b)).toBeCloseTo(0.5, 10)
  })
})

describe('computeModuleCorrelations', () => {
  const labels: Record<ModuleKey, string> = {
    water: 'Water',
    supplements: 'Supplements',
    tasks: 'Tasks',
    medication: 'Medication',
    gym: 'Gym',
    food: 'Food',
    expenses: 'Expenses',
  }

  it('surfaces a strong positive pair, sorted strongest first', () => {
    const gym = [true, true, true, true, true, false, false, false, false, false]
    const water = [true, true, true, true, true, false, false, false, false, false]
    const noise = [true, false, false, true, false, true, false, false, true, false]

    const series: Record<ModuleKey, boolean[]> = {
      water,
      gym,
      tasks: noise,
    } as Record<ModuleKey, boolean[]>

    const result = computeModuleCorrelations(series, labels)
    expect(result[0].moduleA).toBe('water')
    expect(result[0].moduleB).toBe('gym')
    expect(result[0].direction).toBe('positive')
    expect(result[0].strength).toBeCloseTo(1, 10)
  })

  it('excludes a module that was barely ever met (below minActiveDays)', () => {
    const gym = Array(10).fill(false).map((_, i) => i === 0) // only 1 true day
    const water = [true, true, true, true, true, false, false, false, false, false]

    const series = { water, gym } as Record<ModuleKey, boolean[]>
    const result = computeModuleCorrelations(series, labels)
    expect(result).toEqual([])
  })

  it('excludes a pair whose correlation is weaker than minStrength', () => {
    const a = [true, false, true, false, true, false, true, false, true, false]
    const b = [true, true, false, false, true, true, false, false, true, true]

    const series = { water: a, gym: b } as Record<ModuleKey, boolean[]>
    const weak = phiCoefficient(a, b)
    expect(Math.abs(weak ?? 1)).toBeLessThan(0.35)
    expect(computeModuleCorrelations(series, labels)).toEqual([])
  })

  it('returns [] when nothing clears the thresholds, never a fabricated low-confidence guess', () => {
    const series = {
      water: [false, false, false, false, false],
      gym: [false, false, false, false, false],
    } as Record<ModuleKey, boolean[]>
    expect(computeModuleCorrelations(series, labels)).toEqual([])
  })

  it('respects custom thresholds', () => {
    const a = [true, false, true, false]
    const b = [true, false, false, true]
    const series = { water: a, gym: b } as Record<ModuleKey, boolean[]>
    const result = computeModuleCorrelations(series, labels, { minActiveDays: 2, minStrength: 0 })
    expect(result).toHaveLength(1)
  })
})

describe('describeCorrelation', () => {
  it('frames a positive correlation as going together, shame-free', () => {
    const text = describeCorrelation({
      moduleA: 'water',
      labelA: 'Water',
      moduleB: 'gym',
      labelB: 'Gym',
      strength: 0.6,
      direction: 'positive',
      sampleSize: 30,
    })
    expect(text).toContain('Water and Gym tend to go together')
  })

  it('frames a negative correlation as a trade-off, not a failure', () => {
    const text = describeCorrelation({
      moduleA: 'water',
      labelA: 'Water',
      moduleB: 'gym',
      labelB: 'Gym',
      strength: -0.6,
      direction: 'negative',
      sampleSize: 30,
    })
    expect(text).toContain('rarely land on the same day')
  })
})
