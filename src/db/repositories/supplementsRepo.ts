import { toLocalDateString } from '@/engine/streak/dateUtils'
import { db } from '../index'
import type { BaseRecord, Supplement, SupplementLog } from '../schema'
import { insertRecord, softDeleteRecord, updateRecord } from './baseRepo'

export async function listSupplements(): Promise<Supplement[]> {
  const all = await db.supplements.toArray()
  return all.filter((s) => !s.deleted)
}

export async function getSupplement(id: string): Promise<Supplement | undefined> {
  return db.supplements.get(id)
}

export async function createSupplement(
  fields: Omit<Supplement, keyof BaseRecord>,
): Promise<Supplement> {
  return insertRecord<Supplement>(db.supplements, fields)
}

export async function updateSupplement(
  id: string,
  changes: Partial<Omit<Supplement, keyof BaseRecord>>,
): Promise<void> {
  return updateRecord<Supplement>(db.supplements, id, changes)
}

export async function deleteSupplement(id: string): Promise<void> {
  return softDeleteRecord<Supplement>(db.supplements, id)
}

/** Adjusts stock by `delta` (negative to consume), clamped at 0. */
export async function adjustStock(id: string, delta: number): Promise<void> {
  const supplement = await getSupplement(id)
  if (!supplement) return
  await updateRecord<Supplement>(db.supplements, id, {
    currentStock: Math.max(0, supplement.currentStock + delta),
  })
}

export async function addSupplementLogRaw(
  supplementId: string,
  amount: number,
  loggedAt = new Date().toISOString(),
): Promise<SupplementLog> {
  return insertRecord<SupplementLog>(db.supplementLogs, { supplementId, amount, loggedAt })
}

export async function listLogsForSupplement(supplementId: string): Promise<SupplementLog[]> {
  const logs = await db.supplementLogs.where('supplementId').equals(supplementId).toArray()
  return logs.filter((log) => !log.deleted).sort((a, b) => a.loggedAt.localeCompare(b.loggedAt))
}

export async function listLogsForLocalDate(
  localDate: string,
  timeZone: string,
): Promise<SupplementLog[]> {
  const logs = await db.supplementLogs.toArray()
  return logs.filter((log) => !log.deleted && toLocalDateString(log.loggedAt, timeZone) === localDate)
}

/** Distinct local dates this supplement has been logged on — the input to the saturation %. */
export async function countConsistentDaysTaken(supplementId: string, timeZone: string): Promise<number> {
  const logs = await listLogsForSupplement(supplementId)
  const distinctDates = new Set(logs.map((log) => toLocalDateString(log.loggedAt, timeZone)))
  return distinctDates.size
}
