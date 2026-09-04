import { toLocalDateString } from '@/engine/streak/dateUtils'
import { db } from '../index'
import type { WaterLog } from '../schema'
import { insertRecord, softDeleteRecord } from './baseRepo'

export async function addWaterLogRaw(
  amountMl: number,
  loggedAt = new Date().toISOString(),
): Promise<WaterLog> {
  return insertRecord<WaterLog>(db.waterLogs, { amountMl, loggedAt })
}

export async function deleteWaterLog(id: string): Promise<void> {
  return softDeleteRecord<WaterLog>(db.waterLogs, id)
}

export async function listWaterLogsForLocalDate(
  localDate: string,
  timeZone: string,
): Promise<WaterLog[]> {
  const logs = await db.waterLogs.toArray()
  return logs
    .filter((log) => !log.deleted && toLocalDateString(log.loggedAt, timeZone) === localDate)
    .sort((a, b) => a.loggedAt.localeCompare(b.loggedAt))
}

export async function getTotalMlForLocalDate(localDate: string, timeZone: string): Promise<number> {
  const logs = await listWaterLogsForLocalDate(localDate, timeZone)
  return logs.reduce((sum, log) => sum + log.amountMl, 0)
}
