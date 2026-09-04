import { db } from '@/db'
import { addSupplementLogRaw, adjustStock } from '@/db/repositories/supplementsRepo'
import { logEvent } from '@/engine/logging/logEvent'
import { SUPPLEMENTS_MODULE_KEY, supplementsGoalEvaluator } from './goal'

/** Logs one dose. Assumes 1 stock unit consumed per dose (e.g. one pill/scoop) — refine if a
 * future supplement needs finer-grained unit tracking than "doses remaining". */
export async function logSupplementDose(supplementId: string, amount: number): Promise<void> {
  await logEvent({
    moduleKey: SUPPLEMENTS_MODULE_KEY,
    tablesInvolved: [db.supplementLogs, db.supplements, db.settings],
    writeLog: async () => {
      const log = await addSupplementLogRaw(supplementId, amount)
      await adjustStock(supplementId, -1)
      return log
    },
    goalEvaluator: supplementsGoalEvaluator,
  })
}
