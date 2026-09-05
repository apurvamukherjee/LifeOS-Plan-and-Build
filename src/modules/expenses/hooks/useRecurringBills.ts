import { listRecurringBills } from '@/db/repositories/expensesRepo'
import { useLiveQuery } from 'dexie-react-hooks'

export function useRecurringBills() {
  return useLiveQuery(() => listRecurringBills(), [])
}
