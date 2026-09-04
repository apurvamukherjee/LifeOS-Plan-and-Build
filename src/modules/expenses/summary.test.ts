import type { Budget, Expense } from '@/db/schema'
import { describe, expect, it } from 'vitest'
import {
  computeBudgetStatuses,
  computeNetTotal,
  computeSpendByCategory,
  filterForLocalMonth,
} from './summary'

function makeExpense(overrides: Partial<Expense>): Expense {
  return {
    id: 'x',
    createdAt: '',
    updatedAt: '',
    syncStatus: 'pending',
    deleted: false,
    amount: 10,
    direction: 'out',
    category: 'food',
    note: '',
    occurredAt: '2026-01-15T12:00:00.000Z',
    ...overrides,
  }
}

describe('computeNetTotal', () => {
  it('adds money in and subtracts money out', () => {
    const expenses = [
      makeExpense({ direction: 'in', amount: 100 }),
      makeExpense({ direction: 'out', amount: 40 }),
    ]
    expect(computeNetTotal(expenses)).toBe(60)
  })
})

describe('computeSpendByCategory', () => {
  it('only counts direction=out, grouped and sorted highest-spend first', () => {
    const expenses = [
      makeExpense({ category: 'food', amount: 20 }),
      makeExpense({ category: 'food', amount: 10 }),
      makeExpense({ category: 'transport', amount: 100 }),
      makeExpense({ category: 'food', amount: 5, direction: 'in' }), // excluded
    ]
    expect(computeSpendByCategory(expenses)).toEqual([
      { category: 'transport', total: 100 },
      { category: 'food', total: 30 },
    ])
  })
})

describe('filterForLocalMonth', () => {
  it('keeps only expenses whose local date falls in the given year-month', () => {
    const expenses = [
      makeExpense({ occurredAt: '2026-01-15T12:00:00.000Z' }),
      makeExpense({ occurredAt: '2026-02-01T12:00:00.000Z' }),
      // 03:00Z on Feb 1 is still Jan 31 in America/New_York (UTC-5) — exercises the
      // local-date-not-UTC-date distinction the streak engine relies on elsewhere.
      makeExpense({ occurredAt: '2026-02-01T03:00:00.000Z' }),
    ]
    const result = filterForLocalMonth(expenses, '2026-01', 'America/New_York')
    expect(result).toHaveLength(2)
  })
})

describe('computeBudgetStatuses', () => {
  it('computes remaining budget per category', () => {
    const budgets: Budget[] = [
      {
        id: 'b1',
        createdAt: '',
        updatedAt: '',
        syncStatus: 'pending',
        deleted: false,
        category: 'food',
        monthlyLimit: 300,
      },
    ]
    const result = computeBudgetStatuses(budgets, [{ category: 'food', total: 350 }])
    expect(result).toEqual([{ category: 'food', monthlyLimit: 300, spent: 350, remaining: -50 }])
  })

  it('defaults spent to 0 for a budget with no matching category total', () => {
    const budgets: Budget[] = [
      {
        id: 'b2',
        createdAt: '',
        updatedAt: '',
        syncStatus: 'pending',
        deleted: false,
        category: 'entertainment',
        monthlyLimit: 100,
      },
    ]
    expect(computeBudgetStatuses(budgets, [])).toEqual([
      { category: 'entertainment', monthlyLimit: 100, spent: 0, remaining: 100 },
    ])
  })
})
