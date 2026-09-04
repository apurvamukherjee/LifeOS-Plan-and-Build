import { db } from '@/db'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockAuth, mockFrom } = vi.hoisted(() => ({
  mockAuth: { getSession: vi.fn() },
  mockFrom: vi.fn(),
}))

// Vitest hoists vi.mock calls above all imports in this file, so syncEngine.ts's own
// `import { supabase } from './supabaseClient'` resolves against this mock.
vi.mock('./supabaseClient', () => ({
  supabase: { auth: mockAuth, from: mockFrom },
  isSupabaseConfigured: true,
}))

import { pullRemote, pushPending } from './syncEngine'

function makeSelectBuilder(result: { data: unknown[] | null; error: unknown }) {
  const builder = {
    eq: () => builder,
    gt: () => builder,
    order: () => builder,
    limit: () => builder,
    then: (resolve: (v: typeof result) => unknown, reject?: (e: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  }
  return builder
}

function defaultTableMock() {
  return {
    upsert: vi.fn().mockResolvedValue({ error: null }),
    select: () => makeSelectBuilder({ data: [], error: null }),
  }
}

beforeEach(async () => {
  await db.waterLogs.clear()
  await db.syncMeta.clear()
  mockFrom.mockReset()
  mockFrom.mockImplementation(defaultTableMock)
  mockAuth.getSession.mockReset()
  mockAuth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } })
})

describe('pushPending', () => {
  it('skips without throwing when nobody is signed in', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: null } })
    const result = await pushPending()
    expect(result.skipped).toBe(true)
  })

  it('uploads pending rows and marks them synced', async () => {
    await db.waterLogs.add({
      id: 'w1',
      amountMl: 250,
      loggedAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      syncStatus: 'pending',
      deleted: false,
    })

    const upsert = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockImplementation((table: string) =>
      table === 'water_logs' ? { upsert } : defaultTableMock(),
    )

    const result = await pushPending()
    expect(result.skipped).toBe(false)
    expect(upsert).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 'w1', user_id: 'user-1', amount_ml: 250 })],
      { onConflict: 'id' },
    )
    const row = await db.waterLogs.get('w1')
    expect(row?.syncStatus).toBe('synced')
  })

  it('leaves a row pending when its upload fails, without throwing', async () => {
    await db.waterLogs.add({
      id: 'w2',
      amountMl: 100,
      loggedAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      syncStatus: 'pending',
      deleted: false,
    })
    mockFrom.mockImplementation((table: string) =>
      table === 'water_logs'
        ? { upsert: vi.fn().mockResolvedValue({ error: new Error('network') }) }
        : defaultTableMock(),
    )

    await expect(pushPending()).resolves.not.toThrow()
    const row = await db.waterLogs.get('w2')
    expect(row?.syncStatus).toBe('pending')
  })
})

describe('pullRemote', () => {
  it('inserts a new remote row not present locally, and advances the cursor', async () => {
    mockFrom.mockImplementation((table: string) =>
      table === 'water_logs'
        ? {
            select: () =>
              makeSelectBuilder({
                data: [
                  {
                    id: 'w3',
                    user_id: 'user-1',
                    amount_ml: 500,
                    logged_at: '2026-01-02T00:00:00.000Z',
                    created_at: '2026-01-02T00:00:00.000Z',
                    updated_at: '2026-01-02T00:00:00.000Z',
                    deleted: false,
                    server_updated_at: '2026-01-02T00:00:01.000Z',
                  },
                ],
                error: null,
              }),
          }
        : defaultTableMock(),
    )

    await pullRemote()
    const row = await db.waterLogs.get('w3')
    expect(row).toMatchObject({ amountMl: 500, syncStatus: 'synced' })
    const cursor = await db.syncMeta.get('waterLogs')
    expect(cursor?.cursor).toBe('2026-01-02T00:00:01.000Z')
  })

  it('keeps the local row when it is newer than the incoming remote row (last-write-wins)', async () => {
    await db.waterLogs.add({
      id: 'w4',
      amountMl: 999,
      loggedAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-03T00:00:00.000Z',
      syncStatus: 'pending',
      deleted: false,
    })
    mockFrom.mockImplementation((table: string) =>
      table === 'water_logs'
        ? {
            select: () =>
              makeSelectBuilder({
                data: [
                  {
                    id: 'w4',
                    user_id: 'user-1',
                    amount_ml: 111,
                    logged_at: '2026-01-01T00:00:00.000Z',
                    created_at: '2026-01-01T00:00:00.000Z',
                    updated_at: '2026-01-02T00:00:00.000Z',
                    deleted: false,
                    server_updated_at: '2026-01-02T00:00:01.000Z',
                  },
                ],
                error: null,
              }),
          }
        : defaultTableMock(),
    )

    await pullRemote()
    const row = await db.waterLogs.get('w4')
    expect(row?.amountMl).toBe(999)
    expect(row?.syncStatus).toBe('pending')
  })
})
