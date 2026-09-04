import { db } from '@/db'
import { addWaterLogRaw, deleteWaterLog } from '@/db/repositories/waterRepo'
import { triggerCelebration } from '@/engine/celebration/celebrationBus'
import { logEvent } from '@/engine/logging/logEvent'
import { WATER_MODULE_KEY, waterGoalEvaluator } from './goal'

export async function logWater(amountMl: number): Promise<void> {
  const { goalNewlyMet } = await logEvent({
    moduleKey: WATER_MODULE_KEY,
    tablesInvolved: [db.waterLogs, db.settings],
    writeLog: () => addWaterLogRaw(amountMl),
    goalEvaluator: waterGoalEvaluator,
  })
  if (goalNewlyMet) triggerCelebration()
}

export async function undoWaterLog(id: string): Promise<void> {
  await deleteWaterLog(id)
}
