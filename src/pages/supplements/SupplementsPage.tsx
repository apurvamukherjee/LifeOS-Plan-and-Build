import { Button } from '@/components/ui/Button'
import { AddSupplementForm } from '@/modules/supplements/components/AddSupplementForm'
import { SupplementListItem } from '@/modules/supplements/components/SupplementListItem'
import { useSupplementLogsToday } from '@/modules/supplements/hooks/useSupplementLogsToday'
import { useSupplements } from '@/modules/supplements/hooks/useSupplements'
import { useState } from 'react'

export function SupplementsPage() {
  const supplements = useSupplements()
  const loggedIds = useSupplementLogsToday()
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Supplements</h1>
        <Button variant="glass" onClick={() => setShowAddForm((prev) => !prev)}>
          {showAddForm ? 'Close' : '+ Add'}
        </Button>
      </div>

      {showAddForm && <AddSupplementForm onAdded={() => setShowAddForm(false)} />}

      <div className="flex flex-col gap-2">
        {supplements?.length ? (
          supplements.map((supplement) => (
            <SupplementListItem
              key={supplement.id}
              supplement={supplement}
              takenToday={loggedIds?.has(supplement.id) ?? false}
            />
          ))
        ) : (
          <span className="text-sm text-(--color-text-muted)">
            No supplements yet — add one to get started.
          </span>
        )}
      </div>
    </div>
  )
}
