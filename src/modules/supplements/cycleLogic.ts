import { diffLocalDays, getDayOfWeek } from '@/engine/streak/dateUtils'
import type { CycleConfig, CyclingPattern, ScheduleRule } from '@/db/schema'

/** Is this supplement scheduled for the given local date, per its schedule rule? */
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

export interface CyclePhaseResult {
  phase: 'on' | 'off'
  /** 1-indexed day within the current on/off phase. */
  dayInPhase: number
}

/**
 * Which phase of an on/off cycle (e.g. ashwagandha's mandatory off-cycles) a given local date
 * falls in. `elapsed` is taken modulo the cycle length using a positive-remainder formula so a
 * `localDate` before `cycleStartDate` still resolves sensibly instead of returning a negative
 * day-in-cycle.
 */
export function getCyclePhase(pattern: CyclingPattern, localDate: string): CyclePhaseResult {
  const cycleLength = pattern.onDays + pattern.offDays
  if (cycleLength <= 0) return { phase: 'on', dayInPhase: 1 }

  const elapsed = diffLocalDays(pattern.cycleStartDate, localDate)
  const dayInCycle = ((elapsed % cycleLength) + cycleLength) % cycleLength

  if (dayInCycle < pattern.onDays) {
    return { phase: 'on', dayInPhase: dayInCycle + 1 }
  }
  return { phase: 'off', dayInPhase: dayInCycle - pattern.onDays + 1 }
}

export interface SaturationInput {
  /** Count of days, since the loading phase (or tracking) started, the dose was actually taken. */
  consistentDaysTaken: number
  cycleConfig: CycleConfig | null
}

const DEFAULT_MAINTENANCE_SATURATION_DAYS = 28

/**
 * Live "saturation %" for supplements like creatine, per docs/modules — a motivational
 * consistency metric, not a clinical model. A loading phase saturates over its configured
 * duration (e.g. 7 days); without one, saturation is modeled over a 28-day maintenance-only
 * window. Either way the percentage tracks *consistent dosing*, not just elapsed calendar
 * time — surfacing the research note that creatine timing doesn't matter, consistency does.
 */
export function computeSaturationPercent({ consistentDaysTaken, cycleConfig }: SaturationInput): number {
  const durationDays = cycleConfig?.loadingPhase?.durationDays ?? DEFAULT_MAINTENANCE_SATURATION_DAYS
  if (durationDays <= 0) return 100
  return Math.min(100, Math.round((consistentDaysTaken / durationDays) * 100))
}

export function isLowStock(currentStock: number, lowStockThreshold: number): boolean {
  return currentStock <= lowStockThreshold
}
