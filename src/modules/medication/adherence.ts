import type { MedicationLog } from '@/db/schema'

/** Shame-free by design: with no history yet, this returns 100 rather than 0 so a brand-new
 * medication doesn't render as an immediate "failure." See docs/modules/medication.md. */
export function computeAdherencePercent(logs: MedicationLog[]): number {
  if (logs.length === 0) return 100
  const taken = logs.filter((log) => log.status === 'taken').length
  return Math.round((taken / logs.length) * 100)
}
