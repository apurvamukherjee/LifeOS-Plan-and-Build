import { listTasks } from '@/db/repositories/tasksRepo'
import { useLiveQuery } from 'dexie-react-hooks'

export function useTasks() {
  return useLiveQuery(() => listTasks(), [])
}
