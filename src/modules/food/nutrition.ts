import type { Food, FoodLog } from '@/db/schema'

export interface NutritionTotals {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export const EMPTY_TOTALS: NutritionTotals = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }

/** Joins logs against their Food record (by foodId) and sums servings-scaled macros. Logs
 * whose food can't be found (deleted food, or a bare freeTextName-only log) are skipped rather
 * than treated as zero-but-counted, since they carry no nutrition data to add. */
export function computeTotals(logs: FoodLog[], foodsById: Map<string, Food>): NutritionTotals {
  return logs.reduce((acc, log) => {
    const food = log.foodId ? foodsById.get(log.foodId) : undefined
    if (!food) return acc
    return {
      calories: acc.calories + food.caloriesPerServing * log.servings,
      proteinG: acc.proteinG + food.proteinG * log.servings,
      carbsG: acc.carbsG + food.carbsG * log.servings,
      fatG: acc.fatG + food.fatG * log.servings,
    }
  }, EMPTY_TOTALS)
}
