import { listWishlistItems } from '@/db/repositories/wishlistRepo'
import { useLiveQuery } from 'dexie-react-hooks'

export function useWishlistItems() {
  return useLiveQuery(() => listWishlistItems(), [])
}
