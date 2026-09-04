import { createSupplement } from '@/db/repositories/supplementsRepo'
import { createTask } from '@/db/repositories/tasksRepo'
import { logSupplementDose } from '@/modules/supplements/actions'
import { completeTask } from '@/modules/tasks/actions'
import { logWater } from '@/modules/water/actions'

/**
 * Dev-only sample data, exposed on window.__lifeosSeed (see main.tsx). Runs against the real
 * Dexie/IndexedDB in whatever browser you call it from — open the devtools console and run
 * `__lifeosSeed()`.
 */
export async function seedSampleData(): Promise<void> {
  await logWater(250)
  await logWater(350)

  const creatine = await createSupplement({
    name: 'Creatine',
    doseAmount: 5,
    doseUnit: 'g',
    category: 'performance',
    scheduleRule: { type: 'daily', times: ['08:00'] },
    cycleConfig: { loadingPhase: { durationDays: 7, dosesPerDay: 1, doseAmount: 5 } },
    currentStock: 60,
    lowStockThreshold: 10,
  })
  await logSupplementDose(creatine.id, 5)

  await createSupplement({
    name: 'Vitamin D',
    doseAmount: 2000,
    doseUnit: 'IU',
    category: 'vitamin',
    scheduleRule: { type: 'daily', times: ['08:00'] },
    cycleConfig: null,
    currentStock: 3,
    lowStockThreshold: 5, // intentionally at low-stock, to demo the warning badge
  })

  const morningStretch = await createTask({
    title: 'Morning stretch',
    notes: '',
    dueAt: new Date().toISOString(),
    priority: 'medium',
    recurrenceRule: { freq: 'daily', interval: 1 },
    completedAt: null,
  })
  await completeTask(morningStretch.id)

  await createTask({
    title: 'Reply to emails',
    notes: '',
    dueAt: null,
    priority: 'low',
    recurrenceRule: null,
    completedAt: null,
  })

  console.info('[LifeOS] Seeded sample data.')
}
