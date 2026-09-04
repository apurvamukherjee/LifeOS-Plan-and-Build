import { Button } from '@/components/ui/Button'
import { createTask } from '@/db/repositories/tasksRepo'
import type { RecurrenceRule, TaskPriority } from '@/db/schema'
import { type FormEvent, useState } from 'react'

const inputClass =
  'glass rounded-xl px-3 py-2 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none'

export function AddTaskForm({ onAdded }: { onAdded?: () => void }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [repeats, setRepeats] = useState(false)
  const [freq, setFreq] = useState<RecurrenceRule['freq']>('daily')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return

    const recurrenceRule: RecurrenceRule | null = repeats ? { freq, interval: 1 } : null

    await createTask({
      title: title.trim(),
      notes: '',
      dueAt: dueDate ? new Date(dueDate).toISOString() : null,
      priority,
      recurrenceRule,
      completedAt: null,
    })

    setTitle('')
    setDueDate('')
    onAdded?.()
  }

  return (
    <form onSubmit={handleSubmit} className="glass flex flex-col gap-3 rounded-3xl p-5">
      <span className="text-sm font-medium text-(--color-text-secondary)">Add task</span>
      <input
        className={inputClass}
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          className={inputClass}
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
        >
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>
        <input
          className={inputClass}
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-(--color-text-secondary)">
        <input type="checkbox" checked={repeats} onChange={(e) => setRepeats(e.target.checked)} />
        Repeats
      </label>
      {repeats && (
        <select
          className={inputClass}
          value={freq}
          onChange={(e) => setFreq(e.target.value as RecurrenceRule['freq'])}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      )}
      <Button type="submit" variant="primary">
        Add
      </Button>
    </form>
  )
}
