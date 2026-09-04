import { useLiveQuery } from 'dexie-react-hooks'
import { computeWeeklySummary } from '../weeklySummary'

export function useWeeklySummary() {
  return useLiveQuery(() => computeWeeklySummary(), [])
}
