import { createNote, updateNote } from '@/db/repositories/notesRepo'
import { useEffect, useRef, useState } from 'react'

const AUTO_SAVE_DEBOUNCE_MS = 500

/**
 * Sub-second quick capture, per docs/modules/notes.md: no explicit save action — typing
 * auto-creates a draft note and keeps updating that same note as you continue typing. "Start a
 * new note" finalizes the current draft and opens a fresh, empty capture box.
 */
export function QuickCaptureInbox() {
  const [text, setText] = useState('')
  const draftIdRef = useRef<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  function handleChange(value: string) {
    setText(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => void commit(value), AUTO_SAVE_DEBOUNCE_MS)
  }

  async function commit(value: string) {
    if (!value.trim()) return
    if (draftIdRef.current) {
      await updateNote(draftIdRef.current, { body: value })
    } else {
      const note = await createNote({ title: null, body: value, tags: [], color: null, isPinned: false })
      draftIdRef.current = note.id
    }
  }

  function startNew() {
    clearTimeout(debounceRef.current)
    setText('')
    draftIdRef.current = null
  }

  return (
    <div className="glass flex flex-col gap-2 rounded-3xl p-5">
      <textarea
        className="min-h-24 resize-none bg-transparent text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none"
        placeholder="Capture a thought..."
        value={text}
        onChange={(e) => handleChange(e.target.value)}
      />
      {text.trim().length > 0 && (
        <button
          type="button"
          onClick={startNew}
          className="self-end text-xs text-(--color-text-muted) underline"
        >
          done — start a new note
        </button>
      )}
    </div>
  )
}
