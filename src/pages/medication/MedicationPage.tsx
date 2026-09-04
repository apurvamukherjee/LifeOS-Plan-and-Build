import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { AddMedicationForm } from '@/modules/medication/components/AddMedicationForm'
import { MedicationListItem } from '@/modules/medication/components/MedicationListItem'
import { useMedicationLogsToday } from '@/modules/medication/hooks/useMedicationLogsToday'
import { useMedications } from '@/modules/medication/hooks/useMedications'
import { useState } from 'react'

export function MedicationPage() {
  const medications = useMedications()
  const takenIds = useMedicationLogsToday()
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Medication</h1>
        <Button variant="glass" onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? 'Close' : '+ Add'}
        </Button>
      </div>

      <GlassCard className="text-xs text-(--color-text-secondary)">
        Reminders here are in-app only — they fire while LifeOS is open, not in the background.
        Don't rely on them alone for time-sensitive doses.
      </GlassCard>

      {showAddForm && <AddMedicationForm onAdded={() => setShowAddForm(false)} />}

      <div className="flex flex-col gap-2">
        {medications?.length ? (
          medications.map((medication) => (
            <MedicationListItem
              key={medication.id}
              medication={medication}
              takenToday={takenIds?.has(medication.id) ?? false}
            />
          ))
        ) : (
          <span className="text-sm text-(--color-text-muted)">
            No medications yet — add one to get started.
          </span>
        )}
      </div>
    </div>
  )
}
