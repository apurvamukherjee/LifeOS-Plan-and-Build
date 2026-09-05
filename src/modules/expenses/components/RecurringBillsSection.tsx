import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { createRecurringBill, deleteRecurringBill } from '@/db/repositories/expensesRepo'
import { Trash2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useRecurringBills } from '../hooks/useRecurringBills'

const inputClass =
  'glass rounded-xl px-3 py-2 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none'

/**
 * Manage recurring bills — auto-generation itself happens on app foreground
 * (see useAppForegroundEffects -> expenses/actions.generateDueRecurringBills), this is just the
 * CRUD UI for defining them.
 */
export function RecurringBillsSection() {
  const bills = useRecurringBills()
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [category, setCategory] = useState('bills')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!label.trim() || !amount) return
    await createRecurringBill({
      label: label.trim(),
      amount: Number(amount) || 0,
      dayOfMonth: Math.min(31, Math.max(1, Number(dayOfMonth) || 1)),
      category,
    })
    setLabel('')
    setAmount('')
  }

  return (
    <GlassCard className="flex flex-col gap-3">
      <span className="text-sm text-(--color-text-secondary)">Recurring bills</span>
      {bills?.length ? (
        <div className="flex flex-col gap-2">
          {bills.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between text-sm">
              <span>
                {bill.label} · ${bill.amount.toFixed(2)} · day {bill.dayOfMonth}
              </span>
              <button
                type="button"
                onClick={() => deleteRecurringBill(bill.id)}
                className="flex items-center gap-1 text-xs text-(--color-text-muted) underline"
              >
                <Trash2 size={12} /> remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <span className="text-xs text-(--color-text-muted)">
          None yet — add one and it'll auto-log itself each month on the day you pick.
        </span>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
        <input
          className={inputClass}
          placeholder="Label (e.g. Rent)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          className={inputClass}
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className={inputClass}
          type="number"
          min="1"
          max="31"
          placeholder="Day of month"
          value={dayOfMonth}
          onChange={(e) => setDayOfMonth(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <div className="col-span-2">
          <Button type="submit" variant="glass" className="w-full">
            Add recurring bill
          </Button>
        </div>
      </form>
    </GlassCard>
  )
}
