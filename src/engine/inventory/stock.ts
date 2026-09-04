/** Shared between Supplements and Medication — both track currentStock/lowStockThreshold. */
export function isLowStock(currentStock: number, lowStockThreshold: number): boolean {
  return currentStock <= lowStockThreshold
}
