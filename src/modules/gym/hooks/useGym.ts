import {
  getActiveWorkout,
  getWorkoutTemplate,
  listAllSets,
  listExercises,
  listWorkoutHistory,
  listSetsForWorkout,
  listWorkoutTemplates,
} from '@/db/repositories/gymRepo'
import { useLiveQuery } from 'dexie-react-hooks'

export function useActiveWorkout() {
  return useLiveQuery(() => getActiveWorkout(), [])
}

export function useExercises() {
  return useLiveQuery(() => listExercises(), [])
}

export function useAllSets() {
  return useLiveQuery(() => listAllSets(), [])
}

export function useWorkoutHistory() {
  return useLiveQuery(() => listWorkoutHistory(), [])
}

export function useWorkoutSets(workoutId: string | undefined) {
  return useLiveQuery(
    () => (workoutId ? listSetsForWorkout(workoutId) : Promise.resolve([])),
    [workoutId],
  )
}

export function useWorkoutTemplates() {
  return useLiveQuery(() => listWorkoutTemplates(), [])
}

export function useWorkoutTemplate(templateId: string | null) {
  return useLiveQuery(
    () => (templateId ? getWorkoutTemplate(templateId) : Promise.resolve(undefined)),
    [templateId],
  )
}
