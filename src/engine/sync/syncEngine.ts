import { db } from '@/db'
import { SYNCABLE_TABLES, type BaseRecord } from '@/db/schema'
import { fromRemoteShape, remoteTableName, toRemoteShape } from './mappers'
import { supabase } from './supabaseClient'
import { getCursor, setCursor } from './syncMeta'
import { onLocalWrite } from './syncBus'

const PUSH_BATCH_SIZE = 200
const PULL_PAGE_SIZE = 500
const DEBOUNCE_MS = 3000
const INTERVAL_MS = 60_000

export interface SyncSummary {
  skipped: boolean
  pushed?: number
  failed?: number
}

async function getUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
}

/**
 * Uploads every locally-pending row to Supabase. Never throws — a failed batch is left
 * 'pending' and the next table is tried. See docs/SYNC_DESIGN.md for the full algorithm.
 */
export async function pushPending(): Promise<SyncSummary> {
  if (!supabase) return { skipped: true }
  const userId = await getUserId()
  if (!userId) return { skipped: true }

  let pushed = 0
  let failed = 0

  for (const tableName of SYNCABLE_TABLES) {
    const table = db.table(tableName)
    const pendingRows: BaseRecord[] = await table.where('syncStatus').equals('pending').toArray()

    for (let i = 0; i < pendingRows.length; i += PUSH_BATCH_SIZE) {
      const batch = pendingRows.slice(i, i + PUSH_BATCH_SIZE)
      const remoteRows = batch.map((row) => toRemoteShape(row, userId))

      try {
        const { error } = await supabase.from(remoteTableName(tableName)).upsert(remoteRows, {
          onConflict: 'id',
        })
        if (error) throw error

        for (const row of batch) {
          // Only flip to 'synced' if the row hasn't been edited again since we read it, so we
          // never clobber a newer local edit made mid-flight.
          const current: BaseRecord | undefined = await table.get(row.id)
          if (current && current.updatedAt === row.updatedAt) {
            await table.update(row.id, { syncStatus: 'synced' })
          }
        }
        pushed += batch.length
      } catch {
        failed += batch.length
      }
    }
  }

  return { skipped: false, pushed, failed }
}

/**
 * Downloads rows updated (by the server's own clock) since this table's cursor, merging by
 * last-write-wins on the client's `updatedAt`. Never throws.
 */
export async function pullRemote(): Promise<SyncSummary> {
  if (!supabase) return { skipped: true }
  const userId = await getUserId()
  if (!userId) return { skipped: true }

  for (const tableName of SYNCABLE_TABLES) {
    const table = db.table(tableName)

    try {
      let cursor = await getCursor(tableName)

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { data, error } = await supabase
          .from(remoteTableName(tableName))
          .select('*')
          .eq('user_id', userId)
          .gt('server_updated_at', cursor)
          .order('server_updated_at', { ascending: true })
          .limit(PULL_PAGE_SIZE)

        if (error || !data || data.length === 0) break

        for (const remoteRow of data as Record<string, unknown>[]) {
          const localFromRemote = fromRemoteShape<BaseRecord>(remoteRow)
          const existing: BaseRecord | undefined = await table.get(localFromRemote.id)
          if (!existing || localFromRemote.updatedAt > existing.updatedAt) {
            await table.put(localFromRemote)
          }
          // else: keep the local row — if it's 'pending', the next pushPending re-asserts it.
        }

        cursor = String((data[data.length - 1] as Record<string, unknown>).server_updated_at)
        await setCursor(tableName, cursor)

        if (data.length < PULL_PAGE_SIZE) break
      }
    } catch {
      // Best-effort: move on to the next table.
    }
  }

  return { skipped: false }
}

export async function runSyncCycle(): Promise<void> {
  await pushPending()
  await pullRemote()
}

let isRunning = false
let isQueued = false

async function guardedRunSyncCycle(): Promise<void> {
  if (isRunning) {
    isQueued = true
    return
  }
  isRunning = true
  try {
    await runSyncCycle()
  } finally {
    isRunning = false
    if (isQueued) {
      isQueued = false
      void guardedRunSyncCycle()
    }
  }
}

/** Kicks an immediate sync cycle — e.g. right after sign-in, so a user doesn't wait for the
 * ~60s interval trigger to see their data start syncing. */
export function triggerSyncNow(): void {
  void guardedRunSyncCycle()
}

/** Wires up all four sync triggers described in docs/SYNC_DESIGN.md. Returns a cleanup function. */
export function startSyncEngine(): () => void {
  void guardedRunSyncCycle() // app load

  const handleOnline = () => void guardedRunSyncCycle()
  window.addEventListener('online', handleOnline)

  const intervalHandle = setInterval(() => {
    if (document.visibilityState === 'visible') void guardedRunSyncCycle()
  }, INTERVAL_MS)

  let debounceHandle: ReturnType<typeof setTimeout> | undefined
  const unsubscribeLocalWrite = onLocalWrite(() => {
    if (debounceHandle) clearTimeout(debounceHandle)
    debounceHandle = setTimeout(() => void guardedRunSyncCycle(), DEBOUNCE_MS)
  })

  return () => {
    window.removeEventListener('online', handleOnline)
    clearInterval(intervalHandle)
    if (debounceHandle) clearTimeout(debounceHandle)
    unsubscribeLocalWrite()
  }
}
