# Module: Shopping Cart / Wishlist (Stage 2 — not built)

## Framing goal

Reduce impulse purchases, encourage "want vs need" discipline — this is a reflection tool, not
a shopping cart in the checkout sense.

## Feature spec

- Bullet-list items with price and quantity; quantity × price computed subtotal per item.
- **Running total / estimated wishlist value** across all active items — called out in the
  research as an under-served, high-value feature.
- **Want-vs-need level** per item (e.g. a 1-5 scale or a simple want/need toggle) — the core
  intentionality mechanic.
- Category/store/brand grouping with per-category subtotals.
- Drag-drop manual sort (priority ordering).
- "Move to out-of-stock/archived bin" flow for items no longer available or already bought,
  rather than deleting them outright.

## Data model sketch

- `wishlistItems`: `name, price: number, quantity: number, category: string, store: string,
  wantNeedLevel: number, sortOrder: number, status: 'active'|'archived'|'purchased'`
- No streak/reminder engine involvement makes sense for this module by default — it's a
  reflective tool, not a daily habit. Revisit only if a "review your wishlist weekly" nudge
  turns out to be wanted.
