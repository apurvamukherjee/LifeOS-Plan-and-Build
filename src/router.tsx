import { Home } from '@/pages/Home'
import { ExpensesPage } from '@/pages/expenses/ExpensesPage'
import { FoodPage } from '@/pages/food/FoodPage'
import { GymPage } from '@/pages/gym/GymPage'
import { MedicationPage } from '@/pages/medication/MedicationPage'
import { NotesPage } from '@/pages/notes/NotesPage'
import { SupplementsPage } from '@/pages/supplements/SupplementsPage'
import { TasksPage } from '@/pages/tasks/TasksPage'
import { WaterPage } from '@/pages/water/WaterPage'
import { WishlistPage } from '@/pages/wishlist/WishlistPage'
import { Route, Routes } from 'react-router-dom'

export function AppRoutes() {
  return (
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
  )
}
