import { logSavedMeal } from '../actions'
import { guessMealSlot } from '../goal'
import { useSavedMeals } from '../hooks/useSavedMeals'

export function SavedMealsQuickLog() {
  const savedMeals = useSavedMeals()
  if (!savedMeals?.length) return null

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-(--color-text-secondary)">Saved meals — tap to re-log</span>
      <div className="flex flex-wrap gap-2">
        {savedMeals.map((meal) => (
          <button
            key={meal.id}
            type="button"
            onClick={() => logSavedMeal(meal.id, guessMealSlot())}
            className="glass rounded-full px-3 py-1.5 text-xs"
          >
            {meal.name} · {meal.caloriesPerServing} cal
          </button>
        ))}
      </div>
    </div>
  )
}
