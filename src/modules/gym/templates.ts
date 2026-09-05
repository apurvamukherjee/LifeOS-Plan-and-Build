import type { Exercise } from '@/db/schema'

/** Resolves a template's stored exercise-id order into actual Exercise records, in that order,
 * silently dropping any id that no longer resolves (e.g. the exercise was deleted since). */
export function resolveTemplateExercises(exerciseOrder: string[], allExercises: Exercise[]): Exercise[] {
  const byId = new Map(allExercises.map((exercise) => [exercise.id, exercise]))
  return exerciseOrder.map((id) => byId.get(id)).filter((exercise): exercise is Exercise => exercise !== undefined)
}
