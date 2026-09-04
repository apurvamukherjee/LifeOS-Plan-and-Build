import type { WishlistItem } from '@/db/schema'
import { describe, expect, it } from 'vitest'
import { computeCategorySubtotals, computeRunningTotal } from './totals'

function makeItem(overrides: Partial<WishlistItem>): WishlistItem {
  return {
    id: 'x',
    createdAt: '',
    updatedAt: '',
    syncStatus: 'pending',
    deleted: false,
    name: 'Item',
    price: 10,
    quantity: 1,
    category: 'tech',
    store: '',
    wantNeedLevel: 3,
    sortOrder: 0,
    status: 'active',
    ...overrides,
  }
}

describe('computeRunningTotal', () => {
  it('sums price * quantity across active items only', () => {
    const items = [
      makeItem({ price: 10, quantity: 2 }), // 20
      makeItem({ price: 5, quantity: 3 }), // 15
      makeItem({ price: 100, quantity: 1, status: 'archived' }), // excluded
      makeItem({ price: 50, quantity: 1, status: 'purchased' }), // excluded
    ]
    expect(computeRunningTotal(items)).toBe(35)
  })

  it('is 0 for an empty list', () => {
    expect(computeRunningTotal([])).toBe(0)
  })
})

describe('computeCategorySubtotals', () => {
  it('groups active items by category and sorts highest-spend first', () => {
    const items = [
      makeItem({ category: 'tech', price: 10, quantity: 1 }),
      makeItem({ category: 'tech', price: 20, quantity: 1 }),
      makeItem({ category: 'books', price: 100, quantity: 1 }),
      makeItem({ category: 'tech', price: 5, quantity: 1, status: 'purchased' }), // excluded
    ]
    expect(computeCategorySubtotals(items)).toEqual([
      { category: 'books', total: 100 },
      { category: 'tech', total: 30 },
    ])
  })
})
