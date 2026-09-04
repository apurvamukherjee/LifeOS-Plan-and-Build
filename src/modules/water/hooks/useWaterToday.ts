import { listWaterLogsForLocalDate } from '@/db/repositories/waterRepo'
import type { WaterLog } from '@/db/schema'
import { getCurrentTimeZone, toLocalDateString } from '@/engine/streak/dateUtils'
import { useLiveQuery } from 'dexie-react-hooks'
import { getWaterGoalMl } from '../goal'

export interface WaterTodayData {
  totalMl: number
  goalMl: number
  logs: WaterLog[]
  progress: number
}

export function useWaterToday(): WaterTodayData | undefined {
  return useLiveQuery(async () => {
    const timeZone = getCurrentTimeZone()
    const today = toLocalDateString(new Date().toISOString(), timeZone)
    const [logs, goalMl] = await Promise.all([
      listWaterLogsForLocalDate(today, timeZone),
      getWaterGoalMl(),
    ])
    const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0)
    return { totalMl, goalMl, logs, progress: goalMl > 0 ? Math.min(1, totalMl / goalMl) : 0 }
  }, [])
}
