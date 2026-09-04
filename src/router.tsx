import { Home } from '@/pages/Home'
import { SupplementsPage } from '@/pages/supplements/SupplementsPage'
import { TasksPage } from '@/pages/tasks/TasksPage'
import { WaterPage } from '@/pages/water/WaterPage'
import { Route, Routes } from 'react-router-dom'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/water" element={<WaterPage />} />
      <Route path="/supplements" element={<SupplementsPage />} />
      <Route path="/tasks" element={<TasksPage />} />
    </Routes>
  )
}
