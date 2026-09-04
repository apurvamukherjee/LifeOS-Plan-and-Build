import { listMedicationLogsForLocalDate, listMedications } from '@/db/repositories/medicationRepo'
import { getSettingOrDefault } from '@/db/repositories/settingsRepo'
import type { Medication } from '@/db/schema'
import type { GoalEvaluator } from '@/engine/logging/logEvent'
import { isScheduledOn } from '@/engine/scheduling/scheduleRule'

export const MEDICATION_MODULE_KEY = 'medication' as const

export type MedicationGoalMode = 'any' | 'all-scheduled'

/** Defaults to the stricter 'all-scheduled' (unlike Supplements' 'any' default) — adherence to
 * every scheduled dose is the headline metric for medication, per docs/modules/medication.md. */
export async function getMedicationGoalMode(): Promise<MedicationGoalMode> {
  return getSettingOrDefault<MedicationGoalMode>(MEDICATION_MODULE_KEY, 'goalMode', 'all-scheduled')
}

export function isMedicationDueToday(medication: Medication, localDate: string): boolean {
  return isScheduledOn(medication.scheduleRule, localDate)
}

export const medicationGoalEvaluator: GoalEvaluator = {
  async isGoalMet(localDate, timeZone) {
    const [medications, todaysLogs, goalMode] = await Promise.all([
      listMedications(),
      listMedicationLogsForLocalDate(localDate, timeZone),
      getMedicationGoalMode(),
    ])
    const takenIds = new Set(
      todaysLogs.filter((log) => log.status === 'taken').map((log) => log.medicationId),
    )

    const dueToday = medications.filter((medication) => isMedicationDueToday(medication, localDate))
    if (dueToday.length === 0) return takenIds.size > 0

    if (goalMode === 'all-scheduled') {
      return dueToday.every((medication) => takenIds.has(medication.id))
    }
    return dueToday.some((medication) => takenIds.has(medication.id))
  },
}
