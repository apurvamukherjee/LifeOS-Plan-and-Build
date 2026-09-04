import { GlassCard } from '@/components/ui/GlassCard'
import { StreakBadge } from '@/components/ui/StreakBadge'
import { useStreak } from '@/hooks/useStreak'
import { Link } from 'react-router-dom'
import { useTasks } from '../hooks/useTasks'

export function TaskDashboardCard() {
  const tasks = useTasks()
  const streak = useStreak('tasks')
  const openCount = tasks?.filter((task) => task.completedAt === null).length ?? 0

  return (
    <Link to="/tasks">
      <GlassCard interactive className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-(--color-text-secondary)">Tasks</span>
          <StreakBadge streak={streak} />
        </div>
        <span className="text-lg font-semibold">{openCount} open</span>
      </GlassCard>
    </Link>
  )
}
