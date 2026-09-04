import { countConsistentDaysTaken } from '@/db/repositories/supplementsRepo'
import type { Supplement } from '@/db/schema'
import { getCurrentTimeZone } from '@/engine/streak/dateUtils'
import { useLiveQuery } from 'dexie-react-hooks'
import { computeSaturationPercent } from '../cycleLogic'

export function useSaturationPercent(supplement: Supplement | undefined): number | undefined {
  return useLiveQuery(async () => {
    if (!supplement) return undefined
    const timeZone = getCurrentTimeZone()
    const consistentDaysTaken = await countConsistentDaysTaken(supplement.id, timeZone)
    return computeSaturationPercent({ consistentDaysTaken, cycleConfig: supplement.cycleConfig })
  }, [supplement?.id, supplement?.cycleConfig])
}
