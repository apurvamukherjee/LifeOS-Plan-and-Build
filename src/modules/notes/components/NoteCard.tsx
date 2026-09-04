import { GlassCard } from '@/components/ui/GlassCard'
import { deleteNote, updateNote } from '@/db/repositories/notesRepo'
import type { Note } from '@/db/schema'
import { Pin, PinOff, Trash2 } from 'lucide-react'
import { useState } from 'react'

const COLOR_OPTIONS: { name: string; value: string | null }[] = [
  { name: 'none', value: null },
  { name: 'water', value: '--color-water' },
  { name: 'streak', value: '--color-streak' },
  { name: 'action', value: '--color-action' },
  { name: 'mind', value: '--color-mind' },
  { name: 'finance', value: '--color-finance' },
]

export function NoteCard({ note }: { note: Note }) {
  const [tagsInput, setTagsInput] = useState(note.tags.join(', '))

  function commitTags() {
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    void updateNote(note.id, { tags })
  }

  return (
    <GlassCard
      className="flex flex-col gap-2"
      style={note.color ? { borderColor: `var(${note.color})` } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="flex-1 whitespace-pre-wrap text-sm">{note.body}</p>
        <button
          type="button"
          onClick={() => updateNote(note.id, { isPinned: !note.isPinned })}
          className={note.isPinned ? 'shrink-0 text-action' : 'shrink-0 text-(--color-text-muted)'}
          aria-label={note.isPinned ? 'Unpin' : 'Pin'}
        >
          {note.isPinned ? <Pin size={16} fill="currentColor" /> : <PinOff size={16} />}
        </button>
      </div>
      <input
        className="glass rounded-lg px-2 py-1 text-xs text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none"
        placeholder="tags, comma, separated"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        onBlur={commitTags}
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {COLOR_OPTIONS.map((option) => (
            <button
              key={option.name}
              type="button"
              onClick={() => updateNote(note.id, { color: option.value })}
              className="h-4 w-4 rounded-full border border-white/20"
              style={{ background: option.value ? `var(${option.value})` : 'transparent' }}
              aria-label={option.name}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => deleteNote(note.id)}
          className="flex items-center gap-1 text-xs text-(--color-text-muted) underline"
        >
          <Trash2 size={12} /> delete
        </button>
      </div>
    </GlassCard>
  )
}
