import type { WorkoutSet } from '@/db/schema'
import { describe, expect, it } from 'vitest'
import { getMostRecentSet, getPersonalBest, isNewPersonalRecord } from './personalRecords'

function makeSet(overrides: Partial<WorkoutSet>): WorkoutSet {
  return {
    id: 'default-id',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '',
    syncStatus: 'pending',
    deleted: false,
    workoutId: 'w1',
    exerciseId: 'bench',
    setIndex: 0,
    reps: 5,
    weightKg: 60,
    rpe: null,
    ...overrides,
  }
}

describe('isNewPersonalRecord', () => {
  it('is true when the candidate exceeds every prior set for that exercise', () => {
    const sets = [makeSet({ id: 's1', weightKg: 60 }), makeSet({ id: 's2', weightKg: 65 })]
    expect(isNewPersonalRecord(sets, { id: 'new', exerciseId: 'bench', weightKg: 70 })).toBe(true)
  })

  it('is false when a prior set already matches or beats it', () => {
    const sets = [makeSet({ id: 's1', weightKg: 80 })]
    expect(isNewPersonalRecord(sets, { id: 'new', exerciseId: 'bench', weightKg: 80 })).toBe(false)
  })

  it('ignores sets for other exercises', () => {
    const sets = [makeSet({ id: 's1', exerciseId: 'squat', weightKg: 200 })]
    expect(isNewPersonalRecord(sets, { id: 'new', exerciseId: 'bench', weightKg: 40 })).toBe(true)
  })
})

describe('getPersonalBest', () => {
  it('returns the heaviest set for the exercise', () => {
    const sets = [makeSet({ id: 's1', weightKg: 60 }), makeSet({ id: 's2', weightKg: 80 })]
    expect(getPersonalBest(sets, 'bench')?.id).toBe('s2')
  })

  it('returns undefined with no sets for the exercise', () => {
    expect(getPersonalBest([], 'bench')).toBeUndefined()
  })
})

describe('getMostRecentSet', () => {
  it('returns the most recently created set, excluding the given workout', () => {
    const sets = [
      makeSet({ id: 's1', workoutId: 'w0', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeSet({ id: 's2', workoutId: 'w0', createdAt: '2026-01-03T00:00:00.000Z' }),
      makeSet({ id: 's3', workoutId: 'w-current', createdAt: '2026-01-05T00:00:00.000Z' }),
    ]
    expect(getMostRecentSet(sets, 'bench', 'w-current')?.id).toBe('s2')
  })
})
