import type { Food, FoodLog } from '@/db/schema'
import { describe, expect, it } from 'vitest'
import { computeTotals } from './nutrition'

function makeFood(overrides: Partial<Food>): Food {
  return {
    id: 'f1',
    createdAt: '',
    updatedAt: '',
    syncStatus: 'pending',
    deleted: false,
    name: 'Food',
    caloriesPerServing: 200,
    proteinG: 10,
    carbsG: 20,
    fatG: 5,
    servingUnit: 'serving',
    isSavedMeal: false,
    ...overrides,
  }
}

function makeLog(overrides: Partial<FoodLog>): FoodLog {
  return {
    id: 'l1',
    createdAt: '',
    updatedAt: '',
    syncStatus: 'pending',
    deleted: false,
    foodId: 'f1',
    freeTextName: null,
    servings: 1,
    mealSlot: 'lunch',
    loggedAt: '2026-01-01T12:00:00.000Z',
    ...overrides,
  }
}

describe('computeTotals', () => {
  it('scales macros by servings and sums across logs', () => {
    const foodsById = new Map([['f1', makeFood({})]])
    const logs = [makeLog({ servings: 1 }), makeLog({ servings: 2 })]
    expect(computeTotals(logs, foodsById)).toEqual({
      calories: 600,
      proteinG: 30,
      carbsG: 60,
      fatG: 15,
    })
  })

  it('skips logs whose food cannot be found', () => {
    const foodsById = new Map<string, Food>()
    const logs = [makeLog({ foodId: 'missing' })]
    expect(computeTotals(logs, foodsById)).toEqual({ calories: 0, proteinG: 0, carbsG: 0, fatG: 0 })
  })

  it('skips freeTextName-only logs with no linked food', () => {
    const foodsById = new Map([['f1', makeFood({})]])
    const logs = [makeLog({ foodId: null, freeTextName: 'something' })]
    expect(computeTotals(logs, foodsById).calories).toBe(0)
  })
})
