import { listSupplements } from '@/db/repositories/supplementsRepo'
import { useLiveQuery } from 'dexie-react-hooks'

export function useSupplements() {
  return useLiveQuery(() => listSupplements(), [])
}
