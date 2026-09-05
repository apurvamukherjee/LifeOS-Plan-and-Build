import { GlassCard } from '@/components/ui/GlassCard'
import { ReminderToggle } from '@/components/ui/ReminderToggle'
import { deleteTask } from '@/db/repositories/tasksRepo'
import type { Task } from '@/db/schema'
import clsx from 'clsx'
import { Check, Repeat, Trash2 } from 'lucide-react'
import { completeTask, uncompleteTask } from '../actions'

const PRIORITY_COLOR_VAR: Record<Task['priority'], string> = {
  low: '--color-water',
  medium: '--color-finance',
  high: '--color-action',
}

export function TaskListItem({ task }: { task: Task }) {
  const isCompleted = task.completedAt !== null

  return (
    <GlassCard className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => (isCompleted ? uncompleteTask(task.id) : completeTask(task.id))}
        className={clsx(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
          isCompleted ? 'border-streak bg-streak' : 'border-(--color-text-muted)',
        )}
        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {isCompleted && <Check size={14} style={{ color: 'var(--color-base)' }} strokeWidth={3} />}
      </button>
      <div className="flex flex-1 flex-col">
        <span
          className={clsx(
            'text-sm font-medium',
            isCompleted && 'text-(--color-text-muted) line-through',
          )}
        >
          {task.title}
        </span>
        <div className="flex items-center gap-2 text-xs text-(--color-text-secondary)">
          <span style={{ color: `var(${PRIORITY_COLOR_VAR[task.priority]})` }}>{task.priority}</span>
          {task.dueAt && <span>due {new Date(task.dueAt).toLocaleDateString()}</span>}
          {task.recurrenceRule && (
            <span className="flex items-center gap-0.5">
              <Repeat size={12} /> repeats
            </span>
          )}
          <ReminderToggle entityType="task" entityId={task.id} />
        </div>
      </div>
      <button
        type="button"
        onClick={() => deleteTask(task.id)}
        className="flex items-center gap-1 text-xs text-(--color-text-muted) underline"
      >
        <Trash2 size={12} /> remove
      </button>
    </GlassCard>
  )
}
