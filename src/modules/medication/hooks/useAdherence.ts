import { listMedicationLogs } from '@/db/repositories/medicationRepo'
import { useLiveQuery } from 'dexie-react-hooks'
import { computeAdherencePercent } from '../adherence'

export function useAdherencePercent(medicationId: string): number | undefined {
  return useLiveQuery(async () => {
    const logs = await listMedicationLogs(medicationId)
    return computeAdherencePercent(logs)
  }, [medicationId])
}
