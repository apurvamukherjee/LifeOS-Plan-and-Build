import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const MS_PER_DAY = 86_400_000

/**
 * Converts a UTC instant to a local calendar-date string (YYYY-MM-DD) in the given IANA
 * timezone. This is the ONLY place a UTC->local conversion happens in the streak engine —
 * every other function operates purely on YYYY-MM-DD strings via UTC-anchored arithmetic,
 * which has no DST, so DST bugs are structurally avoided rather than patched around.
 */
export function toLocalDateString(isoUtc: string, timeZone: string): string {
  const zoned = toZonedTime(isoUtc, timeZone)
  return format(zoned, 'yyyy-MM-dd')
}

/** Returns the device's current IANA timezone id. Never cache this — always read fresh, so a
 * user who travels gets the new zone's "today" on the next call, and any resulting gap is
 * handled by the ordinary freeze/reset rules rather than special-cased travel logic. */
export function getCurrentTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

function parseLocalDateString(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

function formatUtcMillisAsDateString(ms: number): string {
  const d = new Date(ms)
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Calendar-day difference, `b - a`, both YYYY-MM-DD. Antisymmetric: diffLocalDays(b,a) === -diffLocalDays(a,b). */
export function diffLocalDays(a: string, b: string): number {
  return Math.round((parseLocalDateString(b) - parseLocalDateString(a)) / MS_PER_DAY)
}

/** Day of week for a YYYY-MM-DD string: 0=Sunday..6=Saturday. */
export function getDayOfWeek(dateStr: string): number {
  return new Date(parseLocalDateString(dateStr)).getUTCDay()
}

/** Dates strictly between `a` and `b` (exclusive), assuming b is chronologically after a. */
export function datesBetweenExclusive(a: string, b: string): string[] {
  const start = parseLocalDateString(a)
  const end = parseLocalDateString(b)
  const dates: string[] = []
  for (let t = start + MS_PER_DAY; t < end; t += MS_PER_DAY) {
    dates.push(formatUtcMillisAsDateString(t))
  }
  return dates
}
