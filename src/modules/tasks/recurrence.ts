import type { RecurrenceRule } from '@/db/schema'
import { getDayOfWeek } from '@/engine/streak/dateUtils'
import { addDays, addMonths, addWeeks } from 'date-fns'

function parseAsUtcDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function formatUtcDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Computes the next due date (YYYY-MM-DD) after `fromLocalDate`, per the recurrence rule.
 * `weekly` with specific `daysOfWeek` is only precisely honored for interval 1 (the common
 * "every Mon/Wed/Fri" case) — other interval/daysOfWeek combinations fall back to a plain
 * "+N weeks" step rather than attempting full RRULE-style semantics, which is more complexity
 * than an MVP task list needs. `monthly` uses date-fns' addMonths, which clamps at month-end
 * (e.g. Jan 31 + 1 month -> Feb 28) rather than overflowing into the following month.
 */
export function getNextDueDate(rule: RecurrenceRule, fromLocalDate: string): string {
  const interval = Math.max(1, rule.interval)
  const from = parseAsUtcDate(fromLocalDate)

  if (rule.freq === 'daily') {
    return formatUtcDate(addDays(from, interval))
  }

  if (rule.freq === 'weekly') {
    if (rule.daysOfWeek && rule.daysOfWeek.length > 0 && interval === 1) {
      const sortedDays = [...rule.daysOfWeek].sort((a, b) => a - b)
      const fromDay = getDayOfWeek(fromLocalDate)
      const nextDayThisWeek = sortedDays.find((day) => day > fromDay)
      if (nextDayThisWeek !== undefined) {
        return formatUtcDate(addDays(from, nextDayThisWeek - fromDay))
      }
      return formatUtcDate(addDays(from, 7 - fromDay + sortedDays[0]))
    }
    return formatUtcDate(addWeeks(from, interval))
  }

  return formatUtcDate(addMonths(from, interval))
}
