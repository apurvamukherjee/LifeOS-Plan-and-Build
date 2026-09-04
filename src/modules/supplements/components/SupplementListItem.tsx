import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { deleteSupplement } from '@/db/repositories/supplementsRepo'
import type { Supplement } from '@/db/schema'
import { Check, Trash2 } from 'lucide-react'
import { logSupplementDose } from '../actions'
import { isLowStock } from '../cycleLogic'
import { useSaturationPercent } from '../hooks/useSaturationPercent'

interface SupplementListItemProps {
  supplement: Supplement
  takenToday: boolean
}

export function SupplementListItem({ supplement, takenToday }: SupplementListItemProps) {
  const saturation = useSaturationPercent(supplement)
  const lowStock = isLowStock(supplement.currentStock, supplement.lowStockThreshold)

  return (
    <GlassCard className="flex items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{supplement.name}</span>
        <span className="text-xs text-(--color-text-secondary)">
          {supplement.doseAmount}
          {supplement.doseUnit} · {supplement.category}
        </span>
        <div className="flex items-center gap-2 text-xs">
          {saturation !== undefined && supplement.cycleConfig?.loadingPhase && (
            <span className="text-streak">{saturation}% saturated</span>
          )}
          {lowStock && (
            <span className="text-action">Low stock ({supplement.currentStock} left)</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => deleteSupplement(supplement.id)}
          className="flex items-center gap-1 text-xs text-(--color-text-muted) underline"
        >
          <Trash2 size={12} /> remove
        </button>
        <Button
          variant={takenToday ? 'glass' : 'primary'}
          onClick={() => logSupplementDose(supplement.id, supplement.doseAmount)}
          className="flex items-center gap-1"
        >
          {takenToday && <Check size={14} strokeWidth={3} />}
          {takenToday ? 'Taken' : 'Log dose'}
        </Button>
      </div>
    </GlassCard>
  )
}
