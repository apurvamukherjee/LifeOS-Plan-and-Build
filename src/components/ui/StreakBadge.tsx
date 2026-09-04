import type { Streak } from '@/db/schema'
import { streakIsAtRisk } from '@/hooks/useStreak'
import { Flame, TriangleAlert } from 'lucide-react'

export function StreakBadge({ streak }: { streak: Streak | undefined }) {
  if (!streak || streak.currentStreak <= 0) return null

  if (streakIsAtRisk(streak)) {
    return (
      <span className="flex items-center gap-1 text-xs text-action">
        <TriangleAlert size={14} /> log today to keep your streak
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1 text-xs text-streak">
      <Flame size={14} /> {streak.currentStreak}-day streak
    </span>
  )
}
