import { Button } from '@/components/ui/Button'
import { createWishlistItem } from '@/db/repositories/wishlistRepo'
import { type FormEvent, useState } from 'react'

const inputClass =
  'glass rounded-xl px-3 py-2 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none'

export function AddWishlistItemForm({ onAdded }: { onAdded?: () => void }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [category, setCategory] = useState('general')
  const [store, setStore] = useState('')
  const [wantNeedLevel, setWantNeedLevel] = useState('3')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return

    await createWishlistItem({
      name: name.trim(),
      price: Number(price) || 0,
      quantity: Number(quantity) || 1,
      category,
      store,
      wantNeedLevel: Number(wantNeedLevel),
      sortOrder: Date.now(),
      status: 'active',
    })

    setName('')
    setPrice('')
    setQuantity('1')
    onAdded?.()
  }

  return (
    <form onSubmit={handleSubmit} className="glass flex flex-col gap-3 rounded-3xl p-5">
      <span className="text-sm font-medium text-(--color-text-secondary)">Add to wishlist</span>
      <div className="grid grid-cols-2 gap-2">
        <input
          className={inputClass}
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={inputClass}
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          className={inputClass}
          type="number"
          min="1"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Store (optional)"
          value={store}
          onChange={(e) => setStore(e.target.value)}
        />
        <select
          className={inputClass}
          value={wantNeedLevel}
          onChange={(e) => setWantNeedLevel(e.target.value)}
        >
          <option value="1">1 — pure want</option>
          <option value="2">2</option>
          <option value="3">3 — undecided</option>
          <option value="4">4</option>
          <option value="5">5 — genuine need</option>
        </select>
      </div>
      <Button type="submit" variant="primary">
        Add
      </Button>
    </form>
  )
}
