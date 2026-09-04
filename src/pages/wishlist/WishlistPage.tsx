import { AddToggleButton } from '@/components/ui/AddToggleButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { AddWishlistItemForm } from '@/modules/wishlist/components/AddWishlistItemForm'
import { WishlistItemRow } from '@/modules/wishlist/components/WishlistItemRow'
import { useWishlistItems } from '@/modules/wishlist/hooks/useWishlistItems'
import { computeCategorySubtotals, computeRunningTotal } from '@/modules/wishlist/totals'
import { useState } from 'react'

export function WishlistPage() {
  const items = useWishlistItems()
  const [showAddForm, setShowAddForm] = useState(false)

  const active = items?.filter((item) => item.status !== 'purchased' && item.status !== 'archived') ?? []
  const resolved = items?.filter((item) => item.status === 'purchased' || item.status === 'archived') ?? []
  const total = computeRunningTotal(active)
  const subtotals = computeCategorySubtotals(active)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Wishlist</h1>
        <AddToggleButton isOpen={showAddForm} onToggle={() => setShowAddForm((prev) => !prev)} />
      </div>

      <GlassCard className="flex flex-col gap-2">
        <span className="text-sm text-(--color-text-secondary)">Estimated total</span>
        <span className="text-3xl font-semibold text-finance">${total.toFixed(2)}</span>
        {subtotals.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs text-(--color-text-secondary)">
            {subtotals.map((s) => (
              <span key={s.category}>
                {s.category}: ${s.total.toFixed(2)}
              </span>
            ))}
          </div>
        )}
      </GlassCard>

      {showAddForm && <AddWishlistItemForm onAdded={() => setShowAddForm(false)} />}

      <div className="flex flex-col gap-2">
        {active.length ? (
          active.map((item) => <WishlistItemRow key={item.id} item={item} />)
        ) : (
          <span className="text-sm text-(--color-text-muted)">
            Nothing on your wishlist yet — add something to start being intentional about it.
          </span>
        )}
      </div>

      {resolved.length > 0 && (
        <details className="text-sm text-(--color-text-secondary)">
          <summary>Purchased / out of stock ({resolved.length})</summary>
          <div className="mt-2 flex flex-col gap-2">
            {resolved.map((item) => (
              <WishlistItemRow key={item.id} item={item} />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
