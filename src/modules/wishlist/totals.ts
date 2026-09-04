import type { WishlistItem } from '@/db/schema'

/** Running total across active items — the "estimated wishlist value" from docs/modules/wishlist.md. */
export function computeRunningTotal(items: WishlistItem[]): number {
  return items
    .filter((item) => item.status === 'active')
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export interface CategorySubtotal {
  category: string
  total: number
}

/** Per-category subtotals across active items, sorted highest-spend first. */
export function computeCategorySubtotals(items: WishlistItem[]): CategorySubtotal[] {
  const totals = new Map<string, number>()
  for (const item of items) {
    if (item.status !== 'active') continue
    totals.set(item.category, (totals.get(item.category) ?? 0) + item.price * item.quantity)
  }
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}
