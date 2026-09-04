import { GlassCard } from '@/components/ui/GlassCard'
import { deleteFoodLog } from '@/db/repositories/foodRepo'
import { Undo2 } from 'lucide-react'
import type { FoodTodayData } from '../hooks/useFoodToday'

export function FoodLogList({ data }: { data: FoodTodayData | undefined }) {
  if (!data?.logs.length) {
    return <span className="text-sm text-(--color-text-muted)">No meals logged yet today.</span>
  }

  return (
    <div className="flex flex-col gap-2">
      {data.logs.map((log) => {
        const food = log.foodId ? data.foodsById.get(log.foodId) : undefined
        return (
          <GlassCard key={log.id} className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{food?.name ?? log.freeTextName ?? 'Untitled'}</span>
              <span className="text-xs text-(--color-text-secondary)">
                {log.mealSlot} · {food ? Math.round(food.caloriesPerServing * log.servings) : 0} cal
              </span>
            </div>
            <button
              type="button"
              onClick={() => deleteFoodLog(log.id)}
              className="flex items-center gap-1 text-xs text-(--color-text-muted) underline"
            >
              <Undo2 size={12} /> undo
            </button>
          </GlassCard>
        )
      })}
    </div>
  )
}
