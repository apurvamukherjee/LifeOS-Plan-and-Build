import { db } from '../index'
import type { BaseRecord, Note } from '../schema'
import { insertRecord, softDeleteRecord, updateRecord } from './baseRepo'

export async function listNotes(): Promise<Note[]> {
  const all = await db.notes.toArray()
  return all
    .filter((note) => !note.deleted)
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return b.updatedAt.localeCompare(a.updatedAt)
    })
}

export async function createNote(fields: Omit<Note, keyof BaseRecord>): Promise<Note> {
  return insertRecord<Note>(db.notes, fields)
}

export async function updateNote(
  id: string,
  changes: Partial<Omit<Note, keyof BaseRecord>>,
): Promise<void> {
  return updateRecord<Note>(db.notes, id, changes)
}

export async function deleteNote(id: string): Promise<void> {
  return softDeleteRecord<Note>(db.notes, id)
}
