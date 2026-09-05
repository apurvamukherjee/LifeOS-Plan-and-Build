import type { Exercise } from '@/db/schema'
import { describe, expect, it } from 'vitest'
import { resolveTemplateExercises } from './templates'

function makeExercise(id: string, name: string): Exercise {
  return {
    id,
    createdAt: '',
    updatedAt: '',
    syncStatus: 'pending',
    deleted: false,
    name,
    muscleGroup: '',
    equipment: '',
  }
}

describe('resolveTemplateExercises', () => {
  it('resolves ids to exercises, preserving the template order', () => {
    const exercises = [makeExercise('a', 'Squat'), makeExercise('b', 'Bench'), makeExercise('c', 'Row')]
    const result = resolveTemplateExercises(['c', 'a'], exercises)
    expect(result.map((e) => e.name)).toEqual(['Row', 'Squat'])
  })

  it('silently drops ids that no longer resolve to an exercise', () => {
    const exercises = [makeExercise('a', 'Squat')]
    const result = resolveTemplateExercises(['a', 'deleted-id'], exercises)
    expect(result).toEqual([exercises[0]])
  })

  it('returns an empty array for an empty template', () => {
    expect(resolveTemplateExercises([], [makeExercise('a', 'Squat')])).toEqual([])
  })
})
