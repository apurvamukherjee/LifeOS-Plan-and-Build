import { toLocalDateString } from '@/engine/streak/dateUtils'
import { db } from '../index'
import type { BaseRecord, Medication, MedicationLog, MedicationLogStatus } from '../schema'
import { insertRecord, softDeleteRecord, updateRecord } from './baseRepo'

export async function listMedications(): Promise<Medication[]> {
  const all = await db.medications.toArray()
  return all.filter((medication) => !medication.deleted)
}

export async function getMedication(id: string): Promise<Medication | undefined> {
  return db.medications.get(id)
}

export async function createMedication(
  fields: Omit<Medication, keyof BaseRecord>,
): Promise<Medication> {
  return insertRecord<Medication>(db.medications, fields)
}

export async function updateMedication(
  id: string,
  changes: Partial<Omit<Medication, keyof BaseRecord>>,
): Promise<void> {
  return updateRecord<Medication>(db.medications, id, changes)
}

export async function deleteMedication(id: string): Promise<void> {
  return softDeleteRecord<Medication>(db.medications, id)
}

export async function adjustMedicationStock(id: string, delta: number): Promise<void> {
  const medication = await getMedication(id)
  if (!medication) return
  await updateRecord<Medication>(db.medications, id, {
    currentStock: Math.max(0, medication.currentStock + delta),
  })
}

export async function addMedicationLogRaw(
  medicationId: string,
  status: MedicationLogStatus,
  scheduledAt = new Date().toISOString(),
): Promise<MedicationLog> {
  return insertRecord<MedicationLog>(db.medicationLogs, {
    medicationId,
    scheduledAt,
    takenAt: status === 'taken' ? new Date().toISOString() : null,
    status,
  })
}

export async function listMedicationLogsForLocalDate(
  localDate: string,
  timeZone: string,
): Promise<MedicationLog[]> {
  const all = await db.medicationLogs.toArray()
  return all.filter(
    (log) => !log.deleted && toLocalDateString(log.scheduledAt, timeZone) === localDate,
  )
}

export async function listMedicationLogs(medicationId: string): Promise<MedicationLog[]> {
  const all = await db.medicationLogs.where('medicationId').equals(medicationId).toArray()
  return all.filter((log) => !log.deleted).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
}
