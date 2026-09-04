import { GlassCard } from '@/components/ui/GlassCard'
import { useAllSets, useWorkoutHistory } from '../hooks/useGym'

export function WorkoutHistoryList() {
  const history = useWorkoutHistory()
  const allSets = useAllSets()

  if (!history?.length) {
    return <span className="text-sm text-(--color-text-muted)">No workouts logged yet.</span>
  }

  return (
    <div className="flex flex-col gap-2">
      {history.map((workout) => {
        const setCount = allSets?.filter((set) => set.workoutId === workout.id).length ?? 0
        return (
          <GlassCard key={workout.id} className="flex items-center justify-between text-sm">
            <span>{workout.name || 'Workout'}</span>
            <span className="text-(--color-text-secondary)">
              {new Date(workout.startedAt).toLocaleDateString()} · {setCount} sets
            </span>
          </GlassCard>
        )
      })}
    </div>
  )
}
