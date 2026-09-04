import { toLocalDateString } from '@/engine/streak/dateUtils'
import { db } from '../index'
import type { BaseRecord, Task } from '../schema'
import { insertRecord, softDeleteRecord, updateRecord } from './baseRepo'

export async function listTasks(): Promise<Task[]> {
  const all = await db.tasks.toArray()
  return all.filter((task) => !task.deleted)
}

export async function createTask(fields: Omit<Task, keyof BaseRecord>): Promise<Task> {
  return insertRecord<Task>(db.tasks, fields)
}

export async function updateTask(
  id: string,
  changes: Partial<Omit<Task, keyof BaseRecord>>,
): Promise<void> {
  return updateRecord<Task>(db.tasks, id, changes)
}

export async function deleteTask(id: string): Promise<void> {
  return softDeleteRecord<Task>(db.tasks, id)
}

export async function listCompletedOnLocalDate(localDate: string, timeZone: string): Promise<Task[]> {
  const all = await listTasks()
  return all.filter(
    (task) => task.completedAt !== null && toLocalDateString(task.completedAt, timeZone) === localDate,
  )
}
