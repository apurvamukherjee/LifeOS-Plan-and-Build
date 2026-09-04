import { listFoodLogsForLocalDate, listFoods } from '@/db/repositories/foodRepo'
import type { Food, FoodLog } from '@/db/schema'
import { getCurrentTimeZone, toLocalDateString } from '@/engine/streak/dateUtils'
import { useLiveQuery } from 'dexie-react-hooks'
import { computeTotals, type NutritionTotals } from '../nutrition'

export interface FoodTodayData {
  logs: FoodLog[]
  foodsById: Map<string, Food>
  totals: NutritionTotals
}

export function useFoodToday(): FoodTodayData | undefined {
  return useLiveQuery(async () => {
    const timeZone = getCurrentTimeZone()
    const today = toLocalDateString(new Date().toISOString(), timeZone)
    const [logs, foods] = await Promise.all([
      listFoodLogsForLocalDate(today, timeZone),
      listFoods(),
    ])
    const foodsById = new Map(foods.map((food) => [food.id, food]))
    return { logs, foodsById, totals: computeTotals(logs, foodsById) }
  }, [])
}
