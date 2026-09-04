import { GlassCard } from '@/components/ui/GlassCard'
import { FoodLogList } from '@/modules/food/components/FoodLogList'
import { QuickAddFoodForm } from '@/modules/food/components/QuickAddFoodForm'
import { SavedMealsQuickLog } from '@/modules/food/components/SavedMealsQuickLog'
import { useFoodToday } from '@/modules/food/hooks/useFoodToday'

export function FoodPage() {
  const today = useFoodToday()
  const totals = today?.totals

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Food</h1>

      <GlassCard className="flex flex-col gap-2">
        <span className="text-sm text-(--color-text-secondary)">Today</span>
        <span className="text-3xl font-semibold">{Math.round(totals?.calories ?? 0)} cal</span>
        <span className="text-xs text-(--color-text-secondary)">
          {Math.round(totals?.proteinG ?? 0)}g protein · {Math.round(totals?.carbsG ?? 0)}g carbs ·{' '}
          {Math.round(totals?.fatG ?? 0)}g fat
        </span>
      </GlassCard>

      <SavedMealsQuickLog />
      <QuickAddFoodForm />
      <FoodLogList data={today} />
    </div>
  )
}
