# Module: Gym & Workout Timing (Stage 2 — not built)

## Reference apps

Hevy (fast set-by-set logging), Strong (precise rest-timer control), FitNotes — all offline-first,
which is table stakes here just like the rest of LifeOS.

## Feature spec

- Fast set-by-set logging: reps, weight, RPE.
- Configurable rest timer with notification + haptic feedback when it ends.
- Plate calculator (given target weight + bar weight, show plates per side).
- Reusable workout templates/routines.
- Previous-performance review inline while logging (progressive overload — show last time's
  weight/reps for this exercise before the user enters today's).
- PR (personal record) tracking and celebration.
- Optional light session/gym-schedule reminders.

## Data model sketch

- `exercises`: `name, muscleGroup, equipment`
- `workouts`: `name (template name or session label), notes, startedAt, completedAt`
- `workoutSets`: `workoutId (FK), exerciseId (FK), setIndex, reps, weightKg, rpe: number | null`
- `workoutTemplates`: `name, exerciseOrder: string[] (exercise ids)`
- Reuses `reminders` (session reminders) and `streaks` (`moduleKey: 'gym'`) from the shared
  engine. The rest timer is a self-contained UI feature (countdown + Notification API), not a
  shared-engine concern.

## Note on the rest timer vs. the reminder service

The rest timer is short-duration (seconds to a couple minutes) and only needs to fire while the
workout screen is open/foregrounded — it does not need the same in-app-vs-push distinction the
shared reminder service exists to handle. Implement it as a local component-level timer, not a
`reminders` table row.
