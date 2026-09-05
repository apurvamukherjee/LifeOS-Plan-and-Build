import type { ModuleKey } from '@/db/schema'
import { getCurrentTimeZone } from '@/engine/streak/dateUtils'
import { useLiveQuery } from 'dexie-react-hooks'
import { computeModuleCorrelations, getDailyGoalMetSeries } from '../correlations'
import { getLastNLocalDates } from '../dateRange'
import { STREAK_MODULES } from '../moduleRegistry'

// Longer than the 7-day weekly summary window on purpose — correlation needs more history to be
// trustworthy than a single week's coaching headline does.
const CORRELATION_WINDOW_DAYS = 30

export function useModuleCorrelations() {
  return useLiveQuery(async () => {
    const timeZone = getCurrentTimeZone()
    const dates = getLastNLocalDates(CORRELATION_WINDOW_DAYS, timeZone)
    const series = await getDailyGoalMetSeries(STREAK_MODULES, dates, timeZone)
    const labels = Object.fromEntries(STREAK_MODULES.map((m) => [m.moduleKey, m.label])) as Record<
      ModuleKey,
      string
    >
    return computeModuleCorrelations(series, labels)
  }, [])
}
