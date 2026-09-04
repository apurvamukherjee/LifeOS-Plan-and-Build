import { GlassCard } from '@/components/ui/GlassCard'
import { StreakBadge } from '@/components/ui/StreakBadge'
import { getCurrentTimeZone, toLocalDateString } from '@/engine/streak/dateUtils'
import { useStreak } from '@/hooks/useStreak'
import { Link } from 'react-router-dom'
import { isMedicationDueToday } from '../goal'
import { useMedicationLogsToday } from '../hooks/useMedicationLogsToday'
import { useMedications } from '../hooks/useMedications'

export function MedicationDashboardCard() {
  const medications = useMedications()
  const takenIds = useMedicationLogsToday()
  const streak = useStreak('medication')

  const today = toLocalDateString(new Date().toISOString(), getCurrentTimeZone())
  const due = medications?.filter((medication) => isMedicationDueToday(medication, today)) ?? []
  const takenCount = due.filter((medication) => takenIds?.has(medication.id)).length

  return (
    <Link to="/medication">
      <GlassCard interactive className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-(--color-text-secondary)">Medication</span>
          <StreakBadge streak={streak} />
        </div>
        <span className="text-lg font-semibold">
          {due.length > 0
            ? `${takenCount} / ${due.length} taken today`
            : `${medications?.length ?? 0} tracked`}
        </span>
      </GlassCard>
    </Link>
  )
}
