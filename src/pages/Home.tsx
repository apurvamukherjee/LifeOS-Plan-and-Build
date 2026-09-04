import { NotificationPermissionBanner } from '@/components/ui/NotificationPermissionBanner'
import { ExpensesDashboardCard } from '@/modules/expenses/components/ExpensesDashboardCard'
import { FoodDashboardCard } from '@/modules/food/components/FoodDashboardCard'
import { GymDashboardCard } from '@/modules/gym/components/GymDashboardCard'
import { MedicationDashboardCard } from '@/modules/medication/components/MedicationDashboardCard'
import { NotesDashboardCard } from '@/modules/notes/components/NotesDashboardCard'
import { SupplementDashboardCard } from '@/modules/supplements/components/SupplementDashboardCard'
import { TaskDashboardCard } from '@/modules/tasks/components/TaskDashboardCard'
import { WaterDashboardCard } from '@/modules/water/components/WaterDashboardCard'
import { WishlistDashboardCard } from '@/modules/wishlist/components/WishlistDashboardCard'

export function Home() {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1 pb-2">
        <span className="text-sm text-(--color-text-secondary)">Welcome back</span>
        <h1 className="text-2xl font-semibold">LifeOS</h1>
      </header>
      <NotificationPermissionBanner />
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <WaterDashboardCard />
        </div>
        <SupplementDashboardCard />
        <TaskDashboardCard />
        <MedicationDashboardCard />
        <GymDashboardCard />
        <FoodDashboardCard />
        <ExpensesDashboardCard />
        <WishlistDashboardCard />
        <NotesDashboardCard />
      </div>
    </div>
  )
}
