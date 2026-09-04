import { db } from '@/db'
import { beforeEach, describe, expect, it } from 'vitest'
import { logEvent } from './logEvent'

describe('logEvent', () => {
  beforeEach(async () => {
    await db.waterLogs.clear()
    await db.streaks.clear()
  })

  it('reports goalNewlyMet only on the crossing edge, not on repeat logs the same day', async () => {
    let total = 0
    const goalEvaluator = {
      async isGoalMet() {
        return total >= 500
      },
    }

    async function log(amount: number) {
      total += amount
      return logEvent({
        moduleKey: 'water',
        tablesInvolved: [db.waterLogs],
        writeLog: async () => {
          const now = new Date().toISOString()
          await db.waterLogs.add({
            id: crypto.randomUUID(),
            amountMl: amount,
            loggedAt: now,
            createdAt: now,
            updatedAt: now,
            syncStatus: 'pending',
            deleted: false,
          })
        },
        goalEvaluator,
      })
    }

    const first = await log(300) // total=300, goal not yet met
    expect(first.goalNewlyMet).toBe(false)

    const second = await log(300) // total=600, goal now met -> the crossing edge
    expect(second.goalNewlyMet).toBe(true)

    const third = await log(100) // total=700, still met but not a new crossing
    expect(third.goalNewlyMet).toBe(false)
  })

  it('never reports goalNewlyMet when the goal is not met at all', async () => {
    const goalEvaluator = { async isGoalMet() { return false } }

    const outcome = await logEvent({
      moduleKey: 'water',
      tablesInvolved: [db.waterLogs],
      writeLog: async () => {
        const now = new Date().toISOString()
        await db.waterLogs.add({
          id: crypto.randomUUID(),
          amountMl: 50,
          loggedAt: now,
          createdAt: now,
          updatedAt: now,
          syncStatus: 'pending',
          deleted: false,
        })
      },
      goalEvaluator,
    })

    expect(outcome.goalNewlyMet).toBe(false)
  })
})
