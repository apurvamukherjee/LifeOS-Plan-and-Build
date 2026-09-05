import { db } from '../index'
import type { BaseRecord, Exercise, Workout, WorkoutSet, WorkoutTemplate } from '../schema'
import { insertRecord, softDeleteRecord, updateRecord } from './baseRepo'

export async function listExercises(): Promise<Exercise[]> {
  const all = await db.exercises.toArray()
  return all.filter((exercise) => !exercise.deleted)
}

export async function createExercise(fields: Omit<Exercise, keyof BaseRecord>): Promise<Exercise> {
  return insertRecord<Exercise>(db.exercises, fields)
}

export async function getActiveWorkout(): Promise<Workout | undefined> {
  const all = await db.workouts.toArray()
  return all
    .filter((workout) => !workout.deleted && workout.completedAt === null)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]
}

export async function startWorkout(name: string, templateId: string | null = null): Promise<Workout> {
  return insertRecord<Workout>(db.workouts, {
    name,
    notes: '',
    startedAt: new Date().toISOString(),
    completedAt: null,
    templateId,
  })
}

export async function finishWorkoutRaw(id: string): Promise<void> {
  return updateRecord<Workout>(db.workouts, id, { completedAt: new Date().toISOString() })
}

export async function listWorkoutHistory(): Promise<Workout[]> {
  const all = await db.workouts.toArray()
  return all
    .filter((workout) => !workout.deleted && workout.completedAt !== null)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

export async function addWorkoutSetRaw(fields: Omit<WorkoutSet, keyof BaseRecord>): Promise<WorkoutSet> {
  return insertRecord<WorkoutSet>(db.workoutSets, fields)
}

export async function listSetsForWorkout(workoutId: string): Promise<WorkoutSet[]> {
  const all = await db.workoutSets.where('workoutId').equals(workoutId).toArray()
  return all.filter((set) => !set.deleted).sort((a, b) => a.setIndex - b.setIndex)
}

export async function listAllSets(): Promise<WorkoutSet[]> {
  const all = await db.workoutSets.toArray()
  return all.filter((set) => !set.deleted)
}

export async function deleteWorkoutSet(id: string): Promise<void> {
  return softDeleteRecord<WorkoutSet>(db.workoutSets, id)
}

export async function listWorkoutTemplates(): Promise<WorkoutTemplate[]> {
  const all = await db.workoutTemplates.toArray()
  return all.filter((template) => !template.deleted)
}

export async function getWorkoutTemplate(id: string): Promise<WorkoutTemplate | undefined> {
  return db.workoutTemplates.get(id)
}

export async function createWorkoutTemplate(
  fields: Omit<WorkoutTemplate, keyof BaseRecord>,
): Promise<WorkoutTemplate> {
  return insertRecord<WorkoutTemplate>(db.workoutTemplates, fields)
}

export async function deleteWorkoutTemplate(id: string): Promise<void> {
  return softDeleteRecord<WorkoutTemplate>(db.workoutTemplates, id)
}
