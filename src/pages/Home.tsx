import { LazyOnVisible } from '@/components/ui/LazyOnVisible'
import { NativeReminderPermissionBanner } from '@/components/ui/NativeReminderPermissionBanner'
import { NotificationPermissionBanner } from '@/components/ui/NotificationPermissionBanner'
import { CorrelationsCard } from '@/modules/insights/components/CorrelationsCard'
import { WeeklyOverviewCard } from '@/modules/insights/components/WeeklyOverviewCard'
import { lazy, Suspense } from 'react'

// Each dashboard card is its own chunk — Home is the landing page (so it can't be lazy itself),
// but there's no reason every module's card-specific code (hooks, repos, goal logic it pulls in
// transitively) needs to be in the *same* chunk as Home. See docs/ARCHITECTURE.md
// ("Performance: route-level code-splitting").
const WaterDashboardCard = lazy(() =>
  import('@/modules/water/components/WaterDashboardCard').then((m) => ({ default: m.WaterDashboardCard })),
)
const SupplementDashboardCard = lazy(() =>
  import('@/modules/supplements/components/SupplementDashboardCard').then((m) => ({
    default: m.SupplementDashboardCard,
  })),
)
const TaskDashboardCard = lazy(() =>
  import('@/modules/tasks/components/TaskDashboardCard').then((m) => ({ default: m.TaskDashboardCard })),
)
const MedicationDashboardCard = lazy(() =>
  import('@/modules/medication/components/MedicationDashboardCard').then((m) => ({
    default: m.MedicationDashboardCard,
  })),
)
const GymDashboardCard = lazy(() =>
  import('@/modules/gym/components/GymDashboardCard').then((m) => ({ default: m.GymDashboardCard })),
)
const FoodDashboardCard = lazy(() =>
  import('@/modules/food/components/FoodDashboardCard').then((m) => ({ default: m.FoodDashboardCard })),
)
const ExpensesDashboardCard = lazy(() =>
  import('@/modules/expenses/components/ExpensesDashboardCard').then((m) => ({
    default: m.ExpensesDashboardCard,
  })),
)
const WishlistDashboardCard = lazy(() =>
  import('@/modules/wishlist/components/WishlistDashboardCard').then((m) => ({
    default: m.WishlistDashboardCard,
  })),
)
const NotesDashboardCard = lazy(() =>
  import('@/modules/notes/components/NotesDashboardCard').then((m) => ({ default: m.NotesDashboardCard })),
)

function CardFallback() {
  return <div className="glass h-24 animate-pulse rounded-3xl" />
}

export function Home() {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1 pb-2">
        <span className="text-sm text-(--color-text-secondary)">Welcome back</span>
        <h1 className="text-2xl font-semibold">LifeOS</h1>
      </header>
      <NotificationPermissionBanner />
      <NativeReminderPermissionBanner />
      <WeeklyOverviewCard />
      <CorrelationsCard />
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Suspense fallback={<CardFallback />}>
            <WaterDashboardCard />
          </Suspense>
        </div>
        <LazyOnVisible placeholder={<CardFallback />}>
          <Suspense fallback={<CardFallback />}>
            <SupplementDashboardCard />
          </Suspense>
        </LazyOnVisible>
        <LazyOnVisible placeholder={<CardFallback />}>
          <Suspense fallback={<CardFallback />}>
            <TaskDashboardCard />
          </Suspense>
        </LazyOnVisible>
        <LazyOnVisible placeholder={<CardFallback />}>
          <Suspense fallback={<CardFallback />}>
            <MedicationDashboardCard />
          </Suspense>
        </LazyOnVisible>
        <LazyOnVisible placeholder={<CardFallback />}>
          <Suspense fallback={<CardFallback />}>
            <GymDashboardCard />
          </Suspense>
        </LazyOnVisible>
        <LazyOnVisible placeholder={<CardFallback />}>
          <Suspense fallback={<CardFallback />}>
            <FoodDashboardCard />
          </Suspense>
        </LazyOnVisible>
        <LazyOnVisible placeholder={<CardFallback />}>
          <Suspense fallback={<CardFallback />}>
            <ExpensesDashboardCard />
          </Suspense>
        </LazyOnVisible>
        <LazyOnVisible placeholder={<CardFallback />}>
          <Suspense fallback={<CardFallback />}>
            <WishlistDashboardCard />
          </Suspense>
        </LazyOnVisible>
        <LazyOnVisible placeholder={<CardFallback />}>
          <Suspense fallback={<CardFallback />}>
            <NotesDashboardCard />
          </Suspense>
        </LazyOnVisible>
      </div>
    </div>
  )
}
