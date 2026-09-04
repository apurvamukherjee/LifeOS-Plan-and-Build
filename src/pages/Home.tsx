import { NotificationPermissionBanner } from '@/components/ui/NotificationPermissionBanner'
import { SupplementDashboardCard } from '@/modules/supplements/components/SupplementDashboardCard'
import { TaskDashboardCard } from '@/modules/tasks/components/TaskDashboardCard'
import { WaterDashboardCard } from '@/modules/water/components/WaterDashboardCard'

export function Home() {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1 pb-2">
        <span className="text-sm text-(--color-text-secondary)">Welcome back</span>
        <h1 className="text-2xl font-semibold">LifeOS</h1>
      </header>
      <NotificationPermissionBanner />
      <div className="grid grid-cols-1 gap-3">
        <WaterDashboardCard />
        <SupplementDashboardCard />
        <TaskDashboardCard />
      </div>
    </div>
  )
}
