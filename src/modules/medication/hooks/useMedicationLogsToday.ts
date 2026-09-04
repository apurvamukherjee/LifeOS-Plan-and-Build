import { listMedicationLogsForLocalDate } from '@/db/repositories/medicationRepo'
import { getCurrentTimeZone, toLocalDateString } from '@/engine/streak/dateUtils'
import { useLiveQuery } from 'dexie-react-hooks'

/** Distinct medication ids marked 'taken' today, for driving "taken" checkmarks in the list UI. */
export function useMedicationLogsToday() {
  return useLiveQuery(async () => {
    const timeZone = getCurrentTimeZone()
    const today = toLocalDateString(new Date().toISOString(), timeZone)
    const logs = await listMedicationLogsForLocalDate(today, timeZone)
    return new Set(logs.filter((log) => log.status === 'taken').map((log) => log.medicationId))
  }, [])
}
