import { settleStreak } from '@/db/repositories/streaksRepo'
import type { ModuleKey } from '@/db/schema'
import { startReminderScheduler } from '@/engine/reminders/reminderScheduler'
import { useEffect } from 'react'

// Every ModuleKey that participates in the streak engine. Notes and Wishlist deliberately have
// no streak (see docs/modules/notes.md and docs/modules/wishlist.md).
const MODULE_KEYS: ModuleKey[] = ['water', 'supplements', 'tasks', 'medication', 'gym', 'food', 'expenses']

/**
 * Runs on every app mount and whenever the tab becomes visible again: reconciles each module's
 * streak against an elapsed, uncovered gap (see streakEngine.settleToDate), and (re)starts the
 * in-app reminder poll. Call once near the root (see App.tsx).
 */
export function useAppForegroundEffects(): void {
  useEffect(() => {
    function settleAll() {
      for (const moduleKey of MODULE_KEYS) {
        void settleStreak(moduleKey)
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') settleAll()
    }

    settleAll()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    const stopReminders = startReminderScheduler()

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      stopReminders()
    }
  }, [])
}
