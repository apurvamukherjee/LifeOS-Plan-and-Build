import { db } from '@/db'
import { addWorkoutSetRaw, finishWorkoutRaw, listSetsForWorkout } from '@/db/repositories/gymRepo'
import type { WorkoutSet } from '@/db/schema'
import { logEvent } from '@/engine/logging/logEvent'
import { GYM_MODULE_KEY, gymGoalEvaluator } from './goal'

/** Auto-increments setIndex per (workout, exercise) pair. Not wrapped in logEvent — an
 * individual set doesn't complete the day's goal, finishing the workout does. */
export async function logSet(params: {
  workoutId: string
  exerciseId: string
  reps: number
  weightKg: number
  rpe: number | null
}): Promise<WorkoutSet> {
  const existingSets = await listSetsForWorkout(params.workoutId)
  const setIndex = existingSets.filter((set) => set.exerciseId === params.exerciseId).length
  return addWorkoutSetRaw({ ...params, setIndex })
}

export async function finishWorkout(workoutId: string): Promise<void> {
  await logEvent({
    moduleKey: GYM_MODULE_KEY,
    tablesInvolved: [db.workouts, db.settings],
    writeLog: () => finishWorkoutRaw(workoutId),
    goalEvaluator: gymGoalEvaluator,
  })
}
