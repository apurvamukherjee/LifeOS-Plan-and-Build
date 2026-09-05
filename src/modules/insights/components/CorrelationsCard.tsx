import { GlassCard } from '@/components/ui/GlassCard'
import { describeCorrelation } from '../correlations'
import { useModuleCorrelations } from '../hooks/useModuleCorrelations'

/**
 * Silent by design until there's a genuine pattern to show — see correlations.ts's threshold
 * comments. No "not enough data yet" placeholder: an empty card would just be noise on a fresh
 * install or a quiet month, and this isn't a feature a user needs to be told is "coming."
 */
export function CorrelationsCard() {
  const correlations = useModuleCorrelations()
  if (!correlations?.length) return null

  return (
    <GlassCard className="flex flex-col gap-2">
      <span className="text-sm text-(--color-text-secondary)">Patterns worth noticing</span>
      {correlations.slice(0, 2).map((correlation) => (
        <p key={`${correlation.moduleA}-${correlation.moduleB}`} className="text-xs text-(--color-text-secondary)">
          {describeCorrelation(correlation)}
        </p>
      ))}
    </GlassCard>
  )
}
