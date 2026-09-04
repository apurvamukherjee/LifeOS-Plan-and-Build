import { listBudgets } from '@/db/repositories/expensesRepo'
import { useLiveQuery } from 'dexie-react-hooks'

export function useBudgets() {
  return useLiveQuery(() => listBudgets(), [])
}
