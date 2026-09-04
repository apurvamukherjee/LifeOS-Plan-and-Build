import { GlassCard } from '@/components/ui/GlassCard'
import { Link } from 'react-router-dom'
import { useNotes } from '../hooks/useNotes'

export function NotesDashboardCard() {
  const notes = useNotes()

  return (
    <Link to="/notes">
      <GlassCard interactive className="flex flex-col gap-2">
        <span className="text-sm text-(--color-text-secondary)">Notes</span>
        <span className="text-lg font-semibold">{notes?.length ?? 0} captured</span>
      </GlassCard>
    </Link>
  )
}
