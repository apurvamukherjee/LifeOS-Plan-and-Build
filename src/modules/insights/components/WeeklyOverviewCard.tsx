import { GlassCard } from '@/components/ui/GlassCard'
import { CompanionFace } from '@/modules/companion/components/CompanionFace'
import { getCompanionMood, pickCompanionMessage } from '@/modules/companion/mood'
import { useWeeklySummary } from '../hooks/useWeeklySummary'
import { generateCoachingHeadline } from '../weeklySummary'

export function WeeklyOverviewCard() {
  const summary = useWeeklySummary()
  if (!summary) return null

  const headline = generateCoachingHeadline(summary.stats)
  const mood = getCompanionMood(summary.stats)
  const message = pickCompanionMessage(mood, new Date().getDate())

  return (
    <GlassCard className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <CompanionFace mood={mood} />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-(--color-text-secondary)">This week</span>
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
      <p className="text-xs text-(--color-text-secondary)">{headline}</p>
      <div className="flex flex-wrap gap-2">
        {summary.stats.map((stat) => (
          <span
            key={stat.moduleKey}
            className="glass rounded-full px-2.5 py-1 text-xs text-(--color-text-secondary)"
          >
            {stat.label} {stat.daysMet}/{stat.totalDays}
          </span>
        ))}
      </div>
    </GlassCard>
  )
}
