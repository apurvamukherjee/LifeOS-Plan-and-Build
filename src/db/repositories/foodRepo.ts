import { toLocalDateString } from '@/engine/streak/dateUtils'
import { db } from '../index'
import type { BaseRecord, Food, FoodLog } from '../schema'
import { insertRecord, softDeleteRecord } from './baseRepo'

export async function listFoods(): Promise<Food[]> {
  const all = await db.foods.toArray()
  return all.filter((food) => !food.deleted)
}

export async function listSavedMeals(): Promise<Food[]> {
  return (await listFoods()).filter((food) => food.isSavedMeal)
}

export async function createFood(fields: Omit<Food, keyof BaseRecord>): Promise<Food> {
  return insertRecord<Food>(db.foods, fields)
}

export async function addFoodLogRaw(fields: Omit<FoodLog, keyof BaseRecord>): Promise<FoodLog> {
  return insertRecord<FoodLog>(db.foodLogs, fields)
}

export async function deleteFoodLog(id: string): Promise<void> {
  return softDeleteRecord<FoodLog>(db.foodLogs, id)
}

export async function listFoodLogsForLocalDate(localDate: string, timeZone: string): Promise<FoodLog[]> {
  const all = await db.foodLogs.toArray()
  return all
    .filter((log) => !log.deleted && toLocalDateString(log.loggedAt, timeZone) === localDate)
    .sort((a, b) => a.loggedAt.localeCompare(b.loggedAt))
}
