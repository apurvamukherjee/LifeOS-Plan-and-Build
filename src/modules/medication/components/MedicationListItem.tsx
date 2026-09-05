import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { ReminderToggle } from '@/components/ui/ReminderToggle'
import { deleteMedication } from '@/db/repositories/medicationRepo'
import type { Medication } from '@/db/schema'
import { isLowStock } from '@/engine/inventory/stock'
import { Check, Trash2 } from 'lucide-react'
import { logMedicationDose } from '../actions'
import { useAdherencePercent } from '../hooks/useAdherence'

interface MedicationListItemProps {
  medication: Medication
  takenToday: boolean
}

/**
 * Deliberately shame-free per docs/modules/medication.md: no red/failure styling for a missed
 * dose, and the adherence % renders in a neutral-to-positive tone rather than a warning color.
 */
export function MedicationListItem({ medication, takenToday }: MedicationListItemProps) {
  const adherence = useAdherencePercent(medication.id)
  const lowStock = isLowStock(medication.currentStock, medication.lowStockThreshold)

  return (
    <GlassCard className="flex items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">
          {medication.name} {medication.dosage && `· ${medication.dosage}`}
        </span>
        <span className="text-xs text-(--color-text-secondary)">
          {medication.shape} · {medication.color}
        </span>
        <div className="flex items-center gap-2 text-xs">
          {adherence !== undefined && <span className="text-streak">{adherence}% adherence</span>}
          {lowStock && (
            <span className="text-action">Low stock ({medication.currentStock} left)</span>
          )}
          <ReminderToggle entityType="medication" entityId={medication.id} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => deleteMedication(medication.id)}
          className="flex items-center gap-1 text-xs text-(--color-text-muted) underline"
        >
          <Trash2 size={12} /> remove
        </button>
        <Button
          variant={takenToday ? 'glass' : 'primary'}
          onClick={() => logMedicationDose(medication.id, 'taken')}
          className="flex items-center gap-1"
        >
          {takenToday && <Check size={14} strokeWidth={3} />}
          {takenToday ? 'Taken' : 'Log dose'}
        </Button>
      </div>
    </GlassCard>
  )
}
