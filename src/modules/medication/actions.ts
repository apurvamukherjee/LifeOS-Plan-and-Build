import { db } from '@/db'
import { addMedicationLogRaw, adjustMedicationStock } from '@/db/repositories/medicationRepo'
import type { MedicationLogStatus } from '@/db/schema'
import { triggerCelebration } from '@/engine/celebration/celebrationBus'
import { logEvent } from '@/engine/logging/logEvent'
import { MEDICATION_MODULE_KEY, medicationGoalEvaluator } from './goal'

export async function logMedicationDose(
  medicationId: string,
  status: MedicationLogStatus = 'taken',
): Promise<void> {
  const { goalNewlyMet } = await logEvent({
    moduleKey: MEDICATION_MODULE_KEY,
    tablesInvolved: [db.medicationLogs, db.medications, db.settings],
    writeLog: async () => {
      const log = await addMedicationLogRaw(medicationId, status)
      if (status === 'taken') {
        await adjustMedicationStock(medicationId, -1)
      }
      return log
    },
    goalEvaluator: medicationGoalEvaluator,
  })
  if (goalNewlyMet) triggerCelebration()
}
