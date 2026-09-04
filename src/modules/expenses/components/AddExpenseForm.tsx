import { Button } from '@/components/ui/Button'
import type { ExpenseDirection } from '@/db/schema'
import { useState } from 'react'
import { logExpense } from '../actions'

const inputClass =
  'glass rounded-xl px-3 py-2 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none'

export function AddExpenseForm({ onAdded }: { onAdded?: () => void }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('general')
  const [note, setNote] = useState('')

  async function submit(direction: ExpenseDirection) {
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) return
    await logExpense({ amount: value, direction, category, note })
    setAmount('')
    setNote('')
    onAdded?.()
  }

  return (
    <div className="glass flex flex-col gap-3 rounded-3xl p-5">
      <span className="text-sm font-medium text-(--color-text-secondary)">Log a transaction</span>
      <input
        className={inputClass}
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          className={inputClass}
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="glass" onClick={() => submit('in')} className="text-streak">
          Money In
        </Button>
        <Button variant="primary" onClick={() => submit('out')}>
          Money Out
        </Button>
      </div>
    </div>
  )
}
