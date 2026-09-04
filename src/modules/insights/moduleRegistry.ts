import type { ModuleKey } from '@/db/schema'
import type { GoalEvaluator } from '@/engine/logging/logEvent'
import { expensesGoalEvaluator } from '@/modules/expenses/goal'
import { foodGoalEvaluator } from '@/modules/food/goal'
import { gymGoalEvaluator } from '@/modules/gym/goal'
import { medicationGoalEvaluator } from '@/modules/medication/goal'
import { supplementsGoalEvaluator } from '@/modules/supplements/goal'
import { tasksGoalEvaluator } from '@/modules/tasks/goal'
import { waterGoalEvaluator } from '@/modules/water/goal'

export interface StreakModuleEntry {
  moduleKey: ModuleKey
  label: string
  evaluator: GoalEvaluator
}

/**
 * Every module that participates in the streak engine, with its goal evaluator — the single
 * source of truth insights/weeklySummary.ts uses to build a cross-module view without any
 * bespoke per-module aggregation. Notes and Wishlist are absent by design (no streak).
 */
export const STREAK_MODULES: StreakModuleEntry[] = [
  { moduleKey: 'water', label: 'Water', evaluator: waterGoalEvaluator },
  { moduleKey: 'supplements', label: 'Supplements', evaluator: supplementsGoalEvaluator },
  { moduleKey: 'tasks', label: 'Tasks', evaluator: tasksGoalEvaluator },
  { moduleKey: 'medication', label: 'Medication', evaluator: medicationGoalEvaluator },
  { moduleKey: 'gym', label: 'Gym', evaluator: gymGoalEvaluator },
  { moduleKey: 'food', label: 'Food', evaluator: foodGoalEvaluator },
  { moduleKey: 'expenses', label: 'Expenses', evaluator: expensesGoalEvaluator },
]
