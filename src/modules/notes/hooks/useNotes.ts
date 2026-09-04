import { listNotes } from '@/db/repositories/notesRepo'
import { useLiveQuery } from 'dexie-react-hooks'

export function useNotes() {
  return useLiveQuery(() => listNotes(), [])
}
