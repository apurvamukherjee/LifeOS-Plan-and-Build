import { Button } from '@/components/ui/Button'
import type { MealSlot } from '@/db/schema'
import { type FormEvent, useState } from 'react'
import { logQuickAddFood } from '../actions'
import { guessMealSlot } from '../goal'

const inputClass =
  'glass rounded-xl px-3 py-2 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none'

/** Quick-add: name + calories + meal slot is the whole flow (≤10 actions target from
 * docs/modules/food.md) — protein/carbs/fat live behind a "more detail" disclosure. */
export function QuickAddFoodForm({ onAdded }: { onAdded?: () => void }) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [mealSlot, setMealSlot] = useState<MealSlot>(guessMealSlot())
  const [showDetail, setShowDetail] = useState(false)
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [saveAsMeal, setSaveAsMeal] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return

    await logQuickAddFood({
      name: name.trim(),
      caloriesPerServing: Number(calories) || 0,
      proteinG: Number(protein) || 0,
      carbsG: Number(carbs) || 0,
      fatG: Number(fat) || 0,
      servings: 1,
      mealSlot,
      saveAsMeal,
    })

    setName('')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
    onAdded?.()
  }

  return (
    <form onSubmit={handleSubmit} className="glass flex flex-col gap-3 rounded-3xl p-5">
      <span className="text-sm font-medium text-(--color-text-secondary)">Log a meal</span>
      <div className="grid grid-cols-2 gap-2">
        <input
          className={inputClass}
          placeholder="What did you eat?"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={inputClass}
          type="number"
          placeholder="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
        />
      </div>
      <select
        className={inputClass}
        value={mealSlot}
        onChange={(e) => setMealSlot(e.target.value as MealSlot)}
      >
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
        <option value="snack">Snack</option>
      </select>

      <button
        type="button"
        onClick={() => setShowDetail((prev) => !prev)}
        className="self-start text-xs text-(--color-text-muted) underline"
      >
        {showDetail ? 'hide macro detail' : 'add protein/carbs/fat'}
      </button>
      {showDetail && (
        <div className="grid grid-cols-3 gap-2">
          <input
            className={inputClass}
            type="number"
            placeholder="Protein (g)"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
          />
          <input
            className={inputClass}
            type="number"
            placeholder="Carbs (g)"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
          />
          <input
            className={inputClass}
            type="number"
            placeholder="Fat (g)"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-xs text-(--color-text-secondary)">
        <input type="checkbox" checked={saveAsMeal} onChange={(e) => setSaveAsMeal(e.target.checked)} />
        Save as a meal for one-tap re-logging
      </label>

      <Button type="submit" variant="primary">
        Log
      </Button>
    </form>
  )
}
