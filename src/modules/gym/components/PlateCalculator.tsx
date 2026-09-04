import { GlassCard } from '@/components/ui/GlassCard'
import { useState } from 'react'
import { calculatePlates } from '../plateCalculator'

export function PlateCalculator() {
  const [target, setTarget] = useState('60')
  const [bar, setBar] = useState('20')
  const result = calculatePlates(Number(target) || 0, Number(bar) || 20)

  return (
    <GlassCard className="flex flex-col gap-2">
      <span className="text-sm text-(--color-text-secondary)">Plate calculator</span>
      <div className="flex gap-2">
        <input
          type="number"
          className="glass flex-1 rounded-lg px-2 py-1 text-sm text-(--color-text-primary) focus:outline-none"
          placeholder="Target weight (kg)"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
        <input
          type="number"
          className="glass w-20 rounded-lg px-2 py-1 text-sm text-(--color-text-primary) focus:outline-none"
          placeholder="Bar"
          value={bar}
          onChange={(e) => setBar(e.target.value)}
        />
      </div>
      <span className="text-xs text-(--color-text-secondary)">
        {result.plates.length > 0 ? `Per side: ${result.plates.join(' + ')} kg` : 'Just the bar'}
      </span>
    </GlassCard>
  )
}
