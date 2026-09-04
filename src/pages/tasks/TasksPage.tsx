import { Button } from '@/components/ui/Button'
import { AddTaskForm } from '@/modules/tasks/components/AddTaskForm'
import { TaskListItem } from '@/modules/tasks/components/TaskListItem'
import { useTasks } from '@/modules/tasks/hooks/useTasks'
import { useState } from 'react'

export function TasksPage() {
  const tasks = useTasks()
  const [showAddForm, setShowAddForm] = useState(false)

  const open = tasks?.filter((task) => task.completedAt === null) ?? []
  const completed = tasks?.filter((task) => task.completedAt !== null) ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tasks</h1>
        <Button variant="glass" onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? 'Close' : '+ Add'}
        </Button>
      </div>

      {showAddForm && <AddTaskForm onAdded={() => setShowAddForm(false)} />}

      <div className="flex flex-col gap-2">
        {open.length ? (
          open.map((task) => <TaskListItem key={task.id} task={task} />)
        ) : (
          <span className="text-sm text-(--color-text-muted)">
            Nothing due — add a task to get started.
          </span>
        )}
      </div>

      {completed.length > 0 && (
        <details className="text-sm text-(--color-text-secondary)">
          <summary>Completed ({completed.length})</summary>
          <div className="mt-2 flex flex-col gap-2">
            {completed.map((task) => (
              <TaskListItem key={task.id} task={task} />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
