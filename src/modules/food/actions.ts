import { db } from '@/db'
import { addFoodLogRaw, createFood } from '@/db/repositories/foodRepo'
import type { MealSlot } from '@/db/schema'
import { triggerCelebration } from '@/engine/celebration/celebrationBus'
import { logEvent } from '@/engine/logging/logEvent'
import { FOOD_MODULE_KEY, foodGoalEvaluator } from './goal'

export interface QuickAddFoodParams {
  name: string
  caloriesPerServing: number
  proteinG?: number
  carbsG?: number
  fatG?: number
  servings: number
  mealSlot: MealSlot
  saveAsMeal: boolean
}

/** Ad hoc quick-add: always creates a Food row (so daily/weekly totals can join on it), marked
 * as a saved meal only if the user opted in — otherwise it just won't show up in the quick-pick
 * saved-meals list. */
export async function logQuickAddFood(params: QuickAddFoodParams): Promise<void> {
  const { goalNewlyMet } = await logEvent({
    moduleKey: FOOD_MODULE_KEY,
    tablesInvolved: [db.foodLogs, db.foods, db.settings],
    writeLog: async () => {
      const food = await createFood({
        name: params.name,
        caloriesPerServing: params.caloriesPerServing,
        proteinG: params.proteinG ?? 0,
        carbsG: params.carbsG ?? 0,
        fatG: params.fatG ?? 0,
        servingUnit: 'serving',
        isSavedMeal: params.saveAsMeal,
      })
      return addFoodLogRaw({
        foodId: food.id,
        freeTextName: null,
        servings: params.servings,
        mealSlot: params.mealSlot,
        loggedAt: new Date().toISOString(),
      })
    },
    goalEvaluator: foodGoalEvaluator,
  })
  if (goalNewlyMet) triggerCelebration()
}

/** One-tap re-log of an existing saved meal — the highest-leverage path for repeat eaters. */
export async function logSavedMeal(foodId: string, mealSlot: MealSlot, servings = 1): Promise<void> {
  const { goalNewlyMet } = await logEvent({
    moduleKey: FOOD_MODULE_KEY,
    tablesInvolved: [db.foodLogs, db.settings],
    writeLog: () =>
      addFoodLogRaw({
        foodId,
        freeTextName: null,
        servings,
        mealSlot,
        loggedAt: new Date().toISOString(),
      }),
    goalEvaluator: foodGoalEvaluator,
  })
  if (goalNewlyMet) triggerCelebration()
}
