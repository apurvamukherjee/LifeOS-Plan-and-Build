import { GlassCard } from '@/components/ui/GlassCard'
import { useWeeklySummary } from '../hooks/useWeeklySummary'
import { generateCoachingHeadline } from '../weeklySummary'

export function WeeklyOverviewCard() {
  const summary = useWeeklySummary()
  if (!summary) return null

  const headline = generateCoachingHeadline(summary.stats)

  return (
    <GlassCard className="flex flex-col gap-3">
      <span className="text-sm text-(--color-text-secondary)">This week</span>
      <p className="text-sm">{headline}</p>
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
