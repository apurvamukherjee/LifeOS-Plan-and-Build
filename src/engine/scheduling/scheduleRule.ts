import type { ScheduleRule } from '@/db/schema'
import { getDayOfWeek } from '@/engine/streak/dateUtils'

/**
 * Is something scheduled for the given local date, per its ScheduleRule? Shared between
 * Supplements and Medication (both reuse the same ScheduleRule shape — see
 * docs/modules/medication.md).
 */
export function isScheduledOn(scheduleRule: ScheduleRule, localDate: string): boolean {
  switch (scheduleRule.type) {
    case 'daily':
      return true
    case 'weekdays': {
      const day = getDayOfWeek(localDate)
      return day >= 1 && day <= 5
    }
    case 'custom-days':
      return scheduleRule.daysOfWeek?.includes(getDayOfWeek(localDate)) ?? false
  }
}
