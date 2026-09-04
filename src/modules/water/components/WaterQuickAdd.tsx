import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { logWater } from '../actions'
import { WATER_QUICK_ADD_PRESETS_ML } from '../goal'

export function WaterQuickAdd() {
  const [customAmount, setCustomAmount] = useState('')

  async function handleQuickAdd(amountMl: number) {
    await logWater(amountMl)
  }

  async function handleCustomAdd() {
    const amount = Number(customAmount)
    if (!Number.isFinite(amount) || amount <= 0) return
    await logWater(amount)
    setCustomAmount('')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2">
        {WATER_QUICK_ADD_PRESETS_ML.map((amount) => (
          <Button key={amount} variant="glass" onClick={() => handleQuickAdd(amount)}>
            +{amount}ml
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          placeholder="Custom amount (ml)"
          value={customAmount}
          onChange={(event) => setCustomAmount(event.target.value)}
          className="glass flex-1 rounded-full px-4 py-2 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none"
        />
        <Button variant="primary" onClick={handleCustomAdd}>
          Add
        </Button>
      </div>
    </div>
  )
}
