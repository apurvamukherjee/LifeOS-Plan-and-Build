import { Button } from '@/components/ui/Button'
import { startWorkout } from '@/db/repositories/gymRepo'
import { ActiveWorkoutSession } from '@/modules/gym/components/ActiveWorkoutSession'
import { TemplatePicker } from '@/modules/gym/components/TemplatePicker'
import { WorkoutHistoryList } from '@/modules/gym/components/WorkoutHistoryList'
import { useActiveWorkout } from '@/modules/gym/hooks/useGym'
import { useState } from 'react'

export function GymPage() {
  const activeWorkout = useActiveWorkout()
  const [workoutName, setWorkoutName] = useState('')

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Gym</h1>

      {activeWorkout ? (
        <ActiveWorkoutSession workout={activeWorkout} />
      ) : (
        <>
          <div className="glass flex items-center gap-2 rounded-3xl p-4">
            <input
              className="glass flex-1 rounded-lg px-3 py-2 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none"
              placeholder="Workout name (optional)"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
            <Button variant="primary" onClick={() => startWorkout(workoutName || 'Workout')}>
              Start workout
            </Button>
          </div>
          <TemplatePicker />
          <WorkoutHistoryList />
        </>
      )}
    </div>
  )
}
