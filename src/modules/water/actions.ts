import { db } from '@/db'
import { addWaterLogRaw, deleteWaterLog } from '@/db/repositories/waterRepo'
import { logEvent } from '@/engine/logging/logEvent'
import { WATER_MODULE_KEY, waterGoalEvaluator } from './goal'

export async function logWater(amountMl: number): Promise<void> {
  await logEvent({
    moduleKey: WATER_MODULE_KEY,
    tablesInvolved: [db.waterLogs, db.settings],
    writeLog: () => addWaterLogRaw(amountMl),
    goalEvaluator: waterGoalEvaluator,
  })
}

export async function undoWaterLog(id: string): Promise<void> {
  await deleteWaterLog(id)
}
