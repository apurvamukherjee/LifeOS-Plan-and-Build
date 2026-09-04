import { Home } from '@/pages/Home'
import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

// Route-level code splitting: Home (and the small *DashboardCard components it renders) stays
// in the main bundle since it's the landing page, but each detail page — with its forms, lists,
// and module-specific logic — only loads when actually navigated to. This is what keeps adding
// a 10th module from growing the initial bundle, addressing the ~550KB flagged in
// docs/BUILD_LOG.md after Stage 2.
const WaterPage = lazy(() => import('@/pages/water/WaterPage').then((m) => ({ default: m.WaterPage })))
const SupplementsPage = lazy(() =>
  import('@/pages/supplements/SupplementsPage').then((m) => ({ default: m.SupplementsPage })),
)
const TasksPage = lazy(() => import('@/pages/tasks/TasksPage').then((m) => ({ default: m.TasksPage })))
const MedicationPage = lazy(() =>
  import('@/pages/medication/MedicationPage').then((m) => ({ default: m.MedicationPage })),
)
const FoodPage = lazy(() => import('@/pages/food/FoodPage').then((m) => ({ default: m.FoodPage })))
const GymPage = lazy(() => import('@/pages/gym/GymPage').then((m) => ({ default: m.GymPage })))
const ExpensesPage = lazy(() =>
  import('@/pages/expenses/ExpensesPage').then((m) => ({ default: m.ExpensesPage })),
)
const WishlistPage = lazy(() =>
  import('@/pages/wishlist/WishlistPage').then((m) => ({ default: m.WishlistPage })),
)
const NotesPage = lazy(() => import('@/pages/notes/NotesPage').then((m) => ({ default: m.NotesPage })))

function RouteFallback() {
  return <div className="glass animate-pulse rounded-3xl p-5 text-sm text-(--color-text-muted)">Loading…</div>
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/water" element={<WaterPage />} />
        <Route path="/supplements" element={<SupplementsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/medication" element={<MedicationPage />} />
        <Route path="/food" element={<FoodPage />} />
        <Route path="/gym" element={<GymPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/notes" element={<NotesPage />} />
      </Routes>
    </Suspense>
  )
}
