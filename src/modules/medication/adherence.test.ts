import type { MedicationLog } from '@/db/schema'
import { describe, expect, it } from 'vitest'
import { computeAdherencePercent } from './adherence'

function makeLog(status: MedicationLog['status']): MedicationLog {
  return {
    id: 'l',
    createdAt: '',
    updatedAt: '',
    syncStatus: 'pending',
    deleted: false,
    medicationId: 'm',
    scheduledAt: '2026-01-01T08:00:00.000Z',
    takenAt: status === 'taken' ? '2026-01-01T08:05:00.000Z' : null,
    status,
  }
}

describe('computeAdherencePercent', () => {
  it('returns 100 with no history, so a new medication is not shown as a failure', () => {
    expect(computeAdherencePercent([])).toBe(100)
  })

  it('computes the taken/total percentage', () => {
    expect(computeAdherencePercent([makeLog('taken'), makeLog('taken'), makeLog('missed'), makeLog('skipped')])).toBe(50)
  })

  it('is 0 when every dose was missed', () => {
    expect(computeAdherencePercent([makeLog('missed'), makeLog('missed')])).toBe(0)
  })
})
