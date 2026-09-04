import { db } from '../index'
import type { Setting } from '../schema'
import { insertRecord, updateRecord } from './baseRepo'

/** Generic scalar config store, keyed by (moduleKey, key). See docs/DATA_MODEL.md. */
export async function getSetting<T>(moduleKey: string, key: string): Promise<T | undefined> {
  const row = await db.settings.where({ moduleKey, key }).first()
  return row?.value as T | undefined
}

export async function getSettingOrDefault<T>(
  moduleKey: string,
  key: string,
  defaultValue: T,
): Promise<T> {
  const value = await getSetting<T>(moduleKey, key)
  return value === undefined ? defaultValue : value
}

export async function setSetting<T>(moduleKey: string, key: string, value: T): Promise<void> {
  const existing = await db.settings.where({ moduleKey, key }).first()
  if (existing) {
    await updateRecord<Setting>(db.settings, existing.id, { value })
  } else {
    await insertRecord<Setting>(db.settings, { moduleKey, key, value })
  }
}
