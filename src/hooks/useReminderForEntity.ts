import { getReminderForEntity } from '@/db/repositories/remindersRepo'
import type { ReminderEntityType } from '@/db/schema'
import { useLiveQuery } from 'dexie-react-hooks'

export function useReminderForEntity(entityType: ReminderEntityType, entityId: string) {
  return useLiveQuery(() => getReminderForEntity(entityType, entityId), [entityType, entityId])
}
