import { db } from '../index'
import type { BaseRecord, WishlistItem, WishlistItemStatus } from '../schema'
import { insertRecord, softDeleteRecord, updateRecord } from './baseRepo'

export async function listWishlistItems(): Promise<WishlistItem[]> {
  const all = await db.wishlistItems.toArray()
  return all.filter((item) => !item.deleted).sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function createWishlistItem(
  fields: Omit<WishlistItem, keyof BaseRecord>,
): Promise<WishlistItem> {
  return insertRecord<WishlistItem>(db.wishlistItems, fields)
}

export async function updateWishlistItem(
  id: string,
  changes: Partial<Omit<WishlistItem, keyof BaseRecord>>,
): Promise<void> {
  return updateRecord<WishlistItem>(db.wishlistItems, id, changes)
}

export async function setWishlistItemStatus(id: string, status: WishlistItemStatus): Promise<void> {
  return updateWishlistItem(id, { status })
}

export async function deleteWishlistItem(id: string): Promise<void> {
  return softDeleteRecord<WishlistItem>(db.wishlistItems, id)
}
