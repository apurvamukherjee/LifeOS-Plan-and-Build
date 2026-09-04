import type { Streak } from '@/db/schema'
import { streakIsAtRisk } from '@/hooks/useStreak'

export function StreakBadge({ streak }: { streak: Streak | undefined }) {
  if (!streak || streak.currentStreak <= 0) return null

  if (streakIsAtRisk(streak)) {
    return <span className="text-xs text-action">⚠ log today to keep your streak</span>
  }

  return <span className="text-xs text-streak">🔥 {streak.currentStreak}-day streak</span>
}
