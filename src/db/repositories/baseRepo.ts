import { notifyLocalWrite } from '@/engine/sync/syncBus'
import type { BaseRecord } from '../schema'

/**
 * The minimal slice of Dexie's Table interface these helpers need. Dexie's own `Table<T, TKey>`
 * generics (via `InsertType`/`IDType`) resist being used generically here — every EntityTable
 * fails structural assignability to a shared `Table<T, string>` parameter because of how
 * `InsertType` makes the key optional. Narrowing to just the two methods actually used sidesteps
 * that entirely; every concrete EntityTable in db/index.ts satisfies this structurally.
 */
interface WritableTable<T extends BaseRecord> {
  add(item: T): Promise<unknown>
  update(key: string, changes: Partial<T>): Promise<unknown>
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function stampNewRecord<T extends BaseRecord>(fields: Omit<T, keyof BaseRecord>): T {
  const timestamp = nowIso()
  const stamped: BaseRecord = {
    ...fields,
    id: crypto.randomUUID(),
    createdAt: timestamp,
    updatedAt: timestamp,
    syncStatus: 'pending',
    deleted: false,
  }
  return stamped as T
}

export async function insertRecord<T extends BaseRecord>(
  table: WritableTable<T>,
  fields: Omit<T, keyof BaseRecord>,
): Promise<T> {
  const record = stampNewRecord<T>(fields)
  await table.add(record)
  notifyLocalWrite()
  return record
}

export async function updateRecord<T extends BaseRecord>(
  table: WritableTable<T>,
  id: string,
  changes: Partial<Omit<T, keyof BaseRecord>>,
): Promise<void> {
  await table.update(id, { ...changes, updatedAt: nowIso(), syncStatus: 'pending' } as Partial<T>)
  notifyLocalWrite()
}

export async function softDeleteRecord<T extends BaseRecord>(
  table: WritableTable<T>,
  id: string,
): Promise<void> {
  await table.update(id, { deleted: true, updatedAt: nowIso(), syncStatus: 'pending' } as Partial<T>)
  notifyLocalWrite()
}
