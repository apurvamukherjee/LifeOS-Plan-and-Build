import { db } from '@/db'
import { createTask, updateTask } from '@/db/repositories/tasksRepo'
import { triggerCelebration } from '@/engine/celebration/celebrationBus'
import { logEvent } from '@/engine/logging/logEvent'
import { getCurrentTimeZone, toLocalDateString } from '@/engine/streak/dateUtils'
import { TASKS_MODULE_KEY, tasksGoalEvaluator } from './goal'
import { getNextDueDate } from './recurrence'

/**
 * Completes a task. If it recurs, a fresh task instance is created for the next occurrence
 * rather than resetting this row's completedAt in place — doing the latter would erase the
 * very evidence tasksGoalEvaluator needs to see "a task was completed today" in this same
 * transaction, since the evaluator and the write share one atomic logEvent.
 */
export async function completeTask(id: string): Promise<void> {
  const { goalNewlyMet } = await logEvent({
    moduleKey: TASKS_MODULE_KEY,
    tablesInvolved: [db.tasks, db.settings],
    writeLog: async () => {
      const task = await db.tasks.get(id)
      if (!task) return

      const completedAt = new Date().toISOString()
      await updateTask(id, { completedAt })

      if (task.recurrenceRule) {
        const timeZone = getCurrentTimeZone()
        const completedLocalDate = toLocalDateString(completedAt, timeZone)
        const nextDueLocalDate = getNextDueDate(task.recurrenceRule, completedLocalDate)
        await createTask({
          title: task.title,
          notes: task.notes,
          dueAt: `${nextDueLocalDate}T00:00:00.000Z`,
          priority: task.priority,
          recurrenceRule: task.recurrenceRule,
          completedAt: null,
        })
      }
    },
    goalEvaluator: tasksGoalEvaluator,
  })
  if (goalNewlyMet) triggerCelebration()
}

export async function uncompleteTask(id: string): Promise<void> {
  await updateTask(id, { completedAt: null })
}
