import { db } from '@/db'

const EPOCH = new Date(0).toISOString()

export async function getCursor(tableName: string): Promise<string> {
  const row = await db.syncMeta.get(tableName)
  return row?.cursor ?? EPOCH
}

export async function setCursor(tableName: string, cursor: string): Promise<void> {
  await db.syncMeta.put({ tableName, cursor })
}
