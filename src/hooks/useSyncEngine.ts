import { startSyncEngine } from '@/engine/sync/syncEngine'
import { useEffect } from 'react'

/** Starts the background Dexie <-> Supabase sync loop. Safe to call unconditionally — every
 * sync-engine function no-ops when Supabase isn't configured or no one is signed in. */
export function useSyncEngine(): void {
  useEffect(() => startSyncEngine(), [])
}
