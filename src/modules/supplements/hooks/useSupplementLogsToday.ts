import { listLogsForLocalDate } from '@/db/repositories/supplementsRepo'
import { getCurrentTimeZone, toLocalDateString } from '@/engine/streak/dateUtils'
import { useLiveQuery } from 'dexie-react-hooks'

/** Distinct supplement ids logged today, for driving "taken" checkmarks in the list UI. */
export function useSupplementLogsToday() {
  return useLiveQuery(async () => {
    const timeZone = getCurrentTimeZone()
    const today = toLocalDateString(new Date().toISOString(), timeZone)
    const logs = await listLogsForLocalDate(today, timeZone)
    return new Set(logs.map((log) => log.supplementId))
  }, [])
}
