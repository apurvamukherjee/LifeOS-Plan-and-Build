import { GlassCard } from '@/components/ui/GlassCard'
import { deleteWishlistItem, setWishlistItemStatus } from '@/db/repositories/wishlistRepo'
import type { WishlistItem } from '@/db/schema'
import { CircleCheck, PackageX, Trash2 } from 'lucide-react'

export function WishlistItemRow({ item }: { item: WishlistItem }) {
  const subtotal = item.price * item.quantity

  return (
    <GlassCard className="flex items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{item.name}</span>
        <span className="text-xs text-(--color-text-secondary)">
          {item.quantity} × ${item.price.toFixed(2)} = ${subtotal.toFixed(2)}
          {item.category && ` · ${item.category}`}
          {item.store && ` · ${item.store}`}
        </span>
        <span className="text-xs text-finance">want/need: {item.wantNeedLevel}/5</span>
      </div>
      {item.status === 'active' ? (
        <div className="flex flex-col items-end gap-1 text-xs">
          <button
            type="button"
            onClick={() => setWishlistItemStatus(item.id, 'purchased')}
            className="flex items-center gap-1 text-streak underline"
          >
            <CircleCheck size={12} /> bought it
          </button>
          <button
            type="button"
            onClick={() => setWishlistItemStatus(item.id, 'archived')}
            className="flex items-center gap-1 text-(--color-text-muted) underline"
          >
            <PackageX size={12} /> out of stock
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => deleteWishlistItem(item.id)}
          className="flex items-center gap-1 text-xs text-(--color-text-muted) underline"
        >
          <Trash2 size={12} /> remove
        </button>
      )}
    </GlassCard>
  )
}
