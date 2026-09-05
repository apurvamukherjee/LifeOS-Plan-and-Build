import type { Expense, RecurringBill } from '@/db/schema'
import { describe, expect, it } from 'vitest'
import { hasBeenGeneratedForMonth, isBillDueByLocalDate } from './recurringBills'

function makeBill(overrides: Partial<RecurringBill>): RecurringBill {
  return {
    id: 'bill-1',
    createdAt: '',
    updatedAt: '',
    syncStatus: 'pending',
    deleted: false,
    label: 'Rent',
    amount: 1000,
    dayOfMonth: 1,
    category: 'housing',
    ...overrides,
  }
}

function makeExpense(overrides: Partial<Expense>): Expense {
  return {
    id: 'e1',
    createdAt: '',
    updatedAt: '',
    syncStatus: 'pending',
    deleted: false,
    amount: 1000,
    direction: 'out',
    category: 'housing',
    note: 'Rent',
    occurredAt: '2026-01-01T12:00:00.000Z',
    recurringBillId: 'bill-1',
    ...overrides,
  }
}

describe('isBillDueByLocalDate', () => {
  it('is not due before the configured day of month', () => {
    expect(isBillDueByLocalDate(makeBill({ dayOfMonth: 15 }), '2026-01-14')).toBe(false)
  })

  it('is due on and after the configured day of month', () => {
    const bill = makeBill({ dayOfMonth: 15 })
    expect(isBillDueByLocalDate(bill, '2026-01-15')).toBe(true)
    expect(isBillDueByLocalDate(bill, '2026-01-20')).toBe(true)
  })

  it('clamps a dayOfMonth past the end of a shorter month instead of never firing', () => {
    const bill = makeBill({ dayOfMonth: 31 })
    // February 2026 has 28 days.
    expect(isBillDueByLocalDate(bill, '2026-02-27')).toBe(false)
    expect(isBillDueByLocalDate(bill, '2026-02-28')).toBe(true)
  })
})

describe('hasBeenGeneratedForMonth', () => {
  it('is true when an expense with this bill id exists in the given month', () => {
    const bill = makeBill({})
    const expenses = [makeExpense({ occurredAt: '2026-01-05T00:00:00.000Z' })]
    expect(hasBeenGeneratedForMonth(bill, expenses, '2026-01', 'UTC')).toBe(true)
  })

  it('is false for a different month', () => {
    const bill = makeBill({})
    const expenses = [makeExpense({ occurredAt: '2026-01-05T00:00:00.000Z' })]
    expect(hasBeenGeneratedForMonth(bill, expenses, '2026-02', 'UTC')).toBe(false)
  })

  it('is false when no expense references this bill', () => {
    const bill = makeBill({})
    const expenses = [makeExpense({ recurringBillId: 'other-bill' })]
    expect(hasBeenGeneratedForMonth(bill, expenses, '2026-01', 'UTC')).toBe(false)
  })

  it('ignores manual expenses that happen to match category/amount but have no recurringBillId', () => {
    const bill = makeBill({})
    const expenses = [makeExpense({ recurringBillId: null })]
    expect(hasBeenGeneratedForMonth(bill, expenses, '2026-01', 'UTC')).toBe(false)
  })
})
