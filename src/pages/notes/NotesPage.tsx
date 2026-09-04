import { NoteCard } from '@/modules/notes/components/NoteCard'
import { QuickCaptureInbox } from '@/modules/notes/components/QuickCaptureInbox'
import { useNotes } from '@/modules/notes/hooks/useNotes'

export function NotesPage() {
  const notes = useNotes()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Notes</h1>

      <QuickCaptureInbox />

      <div className="flex flex-col gap-2">
        {notes?.length ? (
          notes.map((note) => <NoteCard key={note.id} note={note} />)
        ) : (
          <span className="text-sm text-(--color-text-muted)">
            Nothing captured yet — start typing above.
          </span>
        )}
      </div>
    </div>
  )
}
