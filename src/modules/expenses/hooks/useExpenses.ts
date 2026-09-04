import { listExpenses } from '@/db/repositories/expensesRepo'
import { useLiveQuery } from 'dexie-react-hooks'

export function useExpenses() {
  return useLiveQuery(() => listExpenses(), [])
}
