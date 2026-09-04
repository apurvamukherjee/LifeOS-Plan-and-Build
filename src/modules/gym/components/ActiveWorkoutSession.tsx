import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { createExercise } from '@/db/repositories/gymRepo'
import type { Workout } from '@/db/schema'
import { Trophy } from 'lucide-react'
import { useState } from 'react'
import { finishWorkout, logSet } from '../actions'
import { useAllSets, useExercises, useWorkoutSets } from '../hooks/useGym'
import { getMostRecentSet, isNewPersonalRecord } from '../personalRecords'
import { PlateCalculator } from './PlateCalculator'
import { RestTimer } from './RestTimer'

const inputClass =
  'glass rounded-lg px-2 py-1.5 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none'

export function ActiveWorkoutSession({ workout }: { workout: Workout }) {
  const exercises = useExercises()
  const sets = useWorkoutSets(workout.id)
  const allSets = useAllSets()

  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [newExerciseName, setNewExerciseName] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [rpe, setRpe] = useState('')
  const [prCelebration, setPrCelebration] = useState<string | null>(null)

  const exercisesById = new Map((exercises ?? []).map((exercise) => [exercise.id, exercise]))
  const previous = selectedExerciseId
    ? getMostRecentSet(allSets ?? [], selectedExerciseId, workout.id)
    : undefined

  async function handleAddExercise() {
    if (!newExerciseName.trim()) return
    const exercise = await createExercise({ name: newExerciseName.trim(), muscleGroup: '', equipment: '' })
    setSelectedExerciseId(exercise.id)
    setNewExerciseName('')
  }

  async function handleLogSet() {
    if (!selectedExerciseId) return
    const repsNum = Number(reps) || 0
    const weightNum = Number(weight) || 0

    const isPR =
      weightNum > 0 &&
      isNewPersonalRecord(allSets ?? [], { id: '', exerciseId: selectedExerciseId, weightKg: weightNum })

    await logSet({
      workoutId: workout.id,
      exerciseId: selectedExerciseId,
      reps: repsNum,
      weightKg: weightNum,
      rpe: rpe ? Number(rpe) : null,
    })

    if (isPR) {
      setPrCelebration(exercisesById.get(selectedExerciseId)?.name ?? 'that exercise')
      setTimeout(() => setPrCelebration(null), 3000)
    }
    setReps('')
    setWeight('')
    setRpe('')
  }

  return (
    <div className="flex flex-col gap-3">
      <GlassCard className="flex items-center justify-between">
        <span className="text-sm text-(--color-text-secondary)">{workout.name}</span>
        <Button variant="primary" onClick={() => finishWorkout(workout.id)}>
          Finish
        </Button>
      </GlassCard>

      <RestTimer />

      <GlassCard className="flex flex-col gap-2">
        <select
          className={inputClass}
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
        >
          <option value="">Select exercise</option>
          {exercises?.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            className={inputClass + ' flex-1'}
            placeholder="Or add a new exercise"
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
          />
          <Button variant="glass" onClick={handleAddExercise}>
            Add
          </Button>
        </div>

        {previous && (
          <span className="text-xs text-(--color-text-muted)">
            Last time: {previous.weightKg}kg × {previous.reps}
          </span>
        )}

        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            className={inputClass}
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
          />
          <input
            type="number"
            className={inputClass}
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <input
            type="number"
            className={inputClass}
            placeholder="RPE"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
          />
        </div>
        <Button variant="primary" onClick={handleLogSet} disabled={!selectedExerciseId}>
          Log set
        </Button>
        {prCelebration && (
          <span className="flex items-center gap-1 text-xs text-streak">
            <Trophy size={14} /> New PR for {prCelebration}!
          </span>
        )}
      </GlassCard>

      {sets && sets.length > 0 && (
        <div className="flex flex-col gap-1">
          {sets.map((set) => (
            <GlassCard key={set.id} className="flex items-center justify-between text-sm">
              <span>{exercisesById.get(set.exerciseId)?.name ?? '—'}</span>
              <span>
                {set.weightKg}kg × {set.reps}
                {set.rpe !== null && ` @RPE${set.rpe}`}
              </span>
            </GlassCard>
          ))}
        </div>
      )}

      <PlateCalculator />
    </div>
  )
}
