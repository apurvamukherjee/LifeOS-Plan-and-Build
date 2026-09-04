import type { WorkoutSet } from '@/db/schema'

/** True if `candidate` beats every prior set's weight for the same exercise (candidate itself,
 * if already present in `sets` by id, is excluded from the comparison). */
export function isNewPersonalRecord(sets: WorkoutSet[], candidate: Pick<WorkoutSet, 'id' | 'exerciseId' | 'weightKg'>): boolean {
  const priorMax = sets
    .filter((set) => set.exerciseId === candidate.exerciseId && set.id !== candidate.id)
    .reduce((max, set) => Math.max(max, set.weightKg), 0)
  return candidate.weightKg > priorMax
}

/** The heaviest set ever logged for an exercise. */
export function getPersonalBest(sets: WorkoutSet[], exerciseId: string): WorkoutSet | undefined {
  const forExercise = sets.filter((set) => set.exerciseId === exerciseId)
  if (forExercise.length === 0) return undefined
  return forExercise.reduce((best, set) => (set.weightKg > best.weightKg ? set : best))
}

/** Most recently logged set for an exercise, excluding the current in-progress workout — this
 * is the "last time's weight/reps" shown inline for progressive overload, per
 * docs/modules/gym.md, distinct from getPersonalBest (which tracks the max, not the latest). */
export function getMostRecentSet(
  sets: WorkoutSet[],
  exerciseId: string,
  excludeWorkoutId?: string,
): WorkoutSet | undefined {
  const candidates = sets.filter(
    (set) => set.exerciseId === exerciseId && set.workoutId !== excludeWorkoutId,
  )
  if (candidates.length === 0) return undefined
  return candidates.reduce((latest, set) => (set.createdAt > latest.createdAt ? set : latest))
}
