import { Button } from '@/components/ui/Button'
import { createSupplement } from '@/db/repositories/supplementsRepo'
import type { CycleConfig, ScheduleRule } from '@/db/schema'
import { type FormEvent, useState } from 'react'

const inputClass =
  'glass rounded-xl px-3 py-2 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none'

export function AddSupplementForm({ onAdded }: { onAdded?: () => void }) {
  const [name, setName] = useState('')
  const [doseAmount, setDoseAmount] = useState('')
  const [doseUnit, setDoseUnit] = useState('g')
  const [category, setCategory] = useState('general')
  const [scheduleType, setScheduleType] = useState<ScheduleRule['type']>('daily')
  const [currentStock, setCurrentStock] = useState('30')
  const [lowStockThreshold, setLowStockThreshold] = useState('5')
  const [hasLoadingPhase, setHasLoadingPhase] = useState(false)
  const [loadingDurationDays, setLoadingDurationDays] = useState('7')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return

    const scheduleRule: ScheduleRule = { type: scheduleType, times: ['08:00'] }
    const cycleConfig: CycleConfig | null = hasLoadingPhase
      ? {
          loadingPhase: {
            durationDays: Number(loadingDurationDays) || 7,
            dosesPerDay: 1,
            doseAmount: Number(doseAmount) || 0,
          },
        }
      : null

    await createSupplement({
      name: name.trim(),
      doseAmount: Number(doseAmount) || 0,
      doseUnit,
      category,
      scheduleRule,
      cycleConfig,
      currentStock: Number(currentStock) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 0,
    })

    setName('')
    setDoseAmount('')
    onAdded?.()
  }

  return (
    <form onSubmit={handleSubmit} className="glass flex flex-col gap-3 rounded-3xl p-5">
      <span className="text-sm font-medium text-(--color-text-secondary)">Add supplement</span>
      <div className="grid grid-cols-2 gap-2">
        <input
          className={inputClass}
          placeholder="Name (e.g. Creatine)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          className={inputClass}
          type="number"
          placeholder="Dose amount"
          value={doseAmount}
          onChange={(e) => setDoseAmount(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Unit (g, mg, capsule)"
          value={doseUnit}
          onChange={(e) => setDoseUnit(e.target.value)}
        />
        <select
          className={inputClass}
          value={scheduleType}
          onChange={(e) => setScheduleType(e.target.value as ScheduleRule['type'])}
        >
          <option value="daily">Every day</option>
          <option value="weekdays">Weekdays only</option>
        </select>
        <input
          className={inputClass}
          type="number"
          placeholder="Current stock"
          value={currentStock}
          onChange={(e) => setCurrentStock(e.target.value)}
        />
        <input
          className={inputClass}
          type="number"
          placeholder="Low stock alert at"
          value={lowStockThreshold}
          onChange={(e) => setLowStockThreshold(e.target.value)}
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-(--color-text-secondary)">
        <input
          type="checkbox"
          checked={hasLoadingPhase}
          onChange={(e) => setHasLoadingPhase(e.target.checked)}
        />
        Has a loading phase (e.g. creatine)
      </label>
      {hasLoadingPhase && (
        <input
          className={inputClass}
          type="number"
          placeholder="Loading phase duration (days)"
          value={loadingDurationDays}
          onChange={(e) => setLoadingDurationDays(e.target.value)}
        />
      )}
      <Button type="submit" variant="primary">
        Add
      </Button>
    </form>
  )
}
