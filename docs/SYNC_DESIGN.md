# LifeOS Sync Design — Dexie ↔ Supabase

Algorithmic detail behind the summary in `docs/ARCHITECTURE.md`. Lives in
`src/engine/sync/syncEngine.ts`. Every function here must be safe to call with no Supabase
client configured, no network, or mid-request failure — always resolve, never throw, never
block a UI write.

## `pushPending(db, supabase)`

```
1. guard: no supabase client, no session, offline -> return {skipped: true}
2. for each syncable table (waterLogs, settings, supplements, supplementLogs, tasks,
   reminders, streaks, pushSubscriptions):
   a. rows = table.where('syncStatus').equals('pending'), read in batches of ~200
   b. map row -> snake_case remote shape (mappers.ts), attach user_id = session.user.id
   c. supabase.from(remoteTable).upsert(rows, { onConflict: 'id' })
   d. on success: re-read the local row; flip syncStatus -> 'synced' ONLY if its updatedAt
      is unchanged since step (a) read it (guards against clobbering a newer edit made
      mid-flight by the user)
   e. on failure: leave rows 'pending', log, continue to the next table (don't abort the whole cycle)
3. never throws; returns { pushed, failed, skipped } for the sync-status indicator
```

## `pullRemote(db, supabase)`

```
1. same guards as pushPending
2. for each table:
   a. cursor = syncMeta.get(tableName)?.cursor ?? EPOCH
   b. loop:
        page = select * from remoteTable
               where user_id = uid and server_updated_at > cursor
               order by server_updated_at asc limit 500
        for each remote row:
          - no local row with that id           -> insert locally, syncStatus = 'synced'
          - local row exists, remote.updatedAt >  local.updatedAt -> overwrite local, syncStatus = 'synced'
          - local row exists, remote.updatedAt <= local.updatedAt -> keep local as-is
              (if local.syncStatus was 'pending', leave it 'pending' so the next
               pushPending re-asserts the local version)
        cursor = max(server_updated_at in page)
        syncMeta.put({ tableName, cursor })       // persisted per page, not just at the end
   c. repeat until page size < 500
3. never throws
```

## Why these specific answers

- **ID collisions:** never happen by construction — `id` is `crypto.randomUUID()` set once
  client-side and reused as the Postgres PK; `upsert(..., {onConflict:'id'})` is insert-or-update
  with no server-side remapping.
- **Cursor vs. clock skew:** the cursor is keyed on the *server's* `server_updated_at`
  (trigger-maintained, `default now()`), never the client's `updatedAt`. A client with a wrong
  system clock can still merge correctly (LWW uses `updatedAt` only for the two-row comparison,
  not for deciding what to fetch next).
- **Delete propagation:** `deleted` is a plain synced boolean, merged by the same LWW rule as
  every other field. No tombstone table, no special delete message type.
- **First login / backfill:** cursor defaults to epoch → first pull is a full-history fetch.
  Running `pushPending()` before the first `pullRemote()` on sign-in means pre-login local data
  reaches the server before the merge happens, so "used app before signing in" and "already has
  cloud data from another device" both resolve through the same ordinary id-match/LWW path.

## Triggers

`runSyncCycle()` = `pushPending()` then `pullRemote()`. Invoked on:
- app load, after auth state resolves
- `window.addEventListener('online', ...)`
- a `document.visibilityState === 'visible'`-gated `setInterval(~60s)`
- a ~3s debounce after `syncEngine.notifyLocalWrite()` (called by repositories after any write)

An in-flight guard ensures at most "one running + one queued" cycle at a time, so overlapping
triggers can't race on the same cursor.
