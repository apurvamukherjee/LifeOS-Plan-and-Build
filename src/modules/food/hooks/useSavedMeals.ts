import { listSavedMeals } from '@/db/repositories/foodRepo'
import { useLiveQuery } from 'dexie-react-hooks'

export function useSavedMeals() {
  return useLiveQuery(() => listSavedMeals(), [])
}
