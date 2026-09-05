import { GlassCard } from '@/components/ui/GlassCard'
import { Link } from 'react-router-dom'
import { useWishlistItems } from '../hooks/useWishlistItems'
import { computeRunningTotal } from '../totals'

export function WishlistDashboardCard() {
  const items = useWishlistItems()
  const active = items?.filter((item) => item.status === 'active') ?? []
  const total = computeRunningTotal(active)

  return (
    <Link to="/wishlist">
      <GlassCard interactive className="flex flex-col gap-2">
        <span className="text-sm text-(--color-text-secondary)">Wishlist</span>
        <span className="text-lg font-semibold">₹{total.toFixed(2)}</span>
        <span className="text-xs text-(--color-text-muted)">
          {active.length} active {active.length === 1 ? 'item' : 'items'}
        </span>
      </GlassCard>
    </Link>
  )
}
