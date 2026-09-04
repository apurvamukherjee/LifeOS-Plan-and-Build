import { listMedications } from '@/db/repositories/medicationRepo'
import { useLiveQuery } from 'dexie-react-hooks'

export function useMedications() {
  return useLiveQuery(() => listMedications(), [])
}
