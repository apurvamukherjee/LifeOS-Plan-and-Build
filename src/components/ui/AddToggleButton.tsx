import { Plus, X } from 'lucide-react'
import { Button } from './Button'

/** The "+ Add" / "Close" toggle repeated at the top of every add-a-thing page. */
export function AddToggleButton({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <Button variant="glass" onClick={onToggle} className="flex items-center gap-1">
      {isOpen ? <X size={16} /> : <Plus size={16} />}
      {isOpen ? 'Close' : 'Add'}
    </Button>
  )
}
