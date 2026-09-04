import { Button } from '@/components/ui/Button'
import { createMedication } from '@/db/repositories/medicationRepo'
import type { ScheduleRule } from '@/db/schema'
import { type FormEvent, useState } from 'react'

const inputClass =
  'glass rounded-xl px-3 py-2 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none'

export function AddMedicationForm({ onAdded }: { onAdded?: () => void }) {
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [shape, setShape] = useState('round')
  const [color, setColor] = useState('white')
  const [scheduleType, setScheduleType] = useState<ScheduleRule['type']>('daily')
  const [currentStock, setCurrentStock] = useState('30')
  const [lowStockThreshold, setLowStockThreshold] = useState('5')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return

    await createMedication({
      name: name.trim(),
      dosage,
      shape,
      color,
      instructions: '',
      scheduleRule: { type: scheduleType, times: ['08:00'] },
      currentStock: Number(currentStock) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 0,
    })

    setName('')
    setDosage('')
    onAdded?.()
  }

  return (
    <form onSubmit={handleSubmit} className="glass flex flex-col gap-3 rounded-3xl p-5">
      <span className="text-sm font-medium text-(--color-text-secondary)">Add medication</span>
      <div className="grid grid-cols-2 gap-2">
        <input
          className={inputClass}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Dosage (e.g. 10mg)"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Shape (e.g. round)"
          value={shape}
          onChange={(e) => setShape(e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="Color (e.g. white)"
          value={color}
          onChange={(e) => setColor(e.target.value)}
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
      <Button type="submit" variant="primary">
        Add
      </Button>
    </form>
  )
}
