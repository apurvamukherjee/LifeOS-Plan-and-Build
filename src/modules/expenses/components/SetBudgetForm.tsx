import { Button } from '@/components/ui/Button'
import { setBudget } from '@/db/repositories/expensesRepo'
import { type FormEvent, useState } from 'react'

const inputClass =
  'glass rounded-xl px-3 py-2 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none'

export function SetBudgetForm() {
  const [category, setCategory] = useState('')
  const [monthlyLimit, setMonthlyLimit] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!category.trim()) return
    await setBudget(category.trim(), Number(monthlyLimit) || 0)
    setCategory('')
    setMonthlyLimit('')
  }

  return (
    <form onSubmit={handleSubmit} className="glass flex items-center gap-2 rounded-3xl p-4">
      <input
        className={inputClass + ' flex-1'}
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <input
        className={inputClass + ' w-28'}
        type="number"
        placeholder="Limit"
        value={monthlyLimit}
        onChange={(e) => setMonthlyLimit(e.target.value)}
      />
      <Button type="submit" variant="glass">
        Set budget
      </Button>
    </form>
  )
}
