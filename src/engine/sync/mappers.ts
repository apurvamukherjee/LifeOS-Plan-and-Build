/**
 * Generic camelCase <-> snake_case field-name mapping between Dexie rows and Supabase rows.
 * Only top-level keys are renamed — nested JSON (scheduleRule, cycleConfig, freezesUsedDates,
 * etc.) is stored as an opaque jsonb blob on the Postgres side, so its internal keys are never
 * touched. `syncStatus` is local-only and dropped when going to remote; `user_id` and
 * `server_updated_at` are remote-only and dropped when coming back local.
 */

function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase())
}

/** Dexie table name -> Postgres table name, e.g. 'supplementLogs' -> 'supplement_logs'. */
export function remoteTableName(dexieTableName: string): string {
  return camelToSnake(dexieTableName)
}

export function toRemoteShape(row: object, userId: string): Record<string, unknown> {
  const remote: Record<string, unknown> = { user_id: userId }
  for (const [key, value] of Object.entries(row)) {
    if (key === 'syncStatus') continue
    remote[camelToSnake(key)] = value
  }
  return remote
}

export function fromRemoteShape<T>(row: Record<string, unknown>): T {
  const local: Record<string, unknown> = { syncStatus: 'synced' }
  for (const [key, value] of Object.entries(row)) {
    if (key === 'user_id' || key === 'server_updated_at') continue
    local[snakeToCamel(key)] = value
  }
  return local as T
}
