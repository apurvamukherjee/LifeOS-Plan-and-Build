import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { GlassCard } from './GlassCard'

/**
 * Whoop-style three-tier disclosure: headline -> trend -> detail. Strictly presentational —
 * module hooks are responsible for producing this shape from live Dexie queries; this
 * component never reads from the db itself. See docs/ARCHITECTURE.md ("UI: Glass Design
 * System").
 */
export interface StatCardData {
  headline: { value: string; label: string }
  trend?: { delta: string; period: string }
  detail?: ReactNode
}

interface StatCardProps {
  data: StatCardData
  /** A CSS custom property name from src/styles/index.css, e.g. '--color-water'. */
  accentVar?: string
  icon?: ReactNode
  className?: string
}

export function StatCard({ data, accentVar = '--color-water', icon, className }: StatCardProps) {
  const [expanded, setExpanded] = useState(false)
  const hasDetail = Boolean(data.detail)

  return (
    <GlassCard
      interactive={hasDetail}
      className={clsx('flex flex-col gap-1', className)}
      onClick={hasDetail ? () => setExpanded((prev) => !prev) : undefined}
      role={hasDetail ? 'button' : undefined}
      tabIndex={hasDetail ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-(--color-text-secondary)">{data.headline.label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold" style={{ color: `var(${accentVar})` }}>
          {data.headline.value}
        </span>
        {data.trend && (
          <span className="text-xs text-(--color-text-muted)">
            {data.trend.delta} · {data.trend.period}
          </span>
        )}
      </div>
      <AnimatePresence initial={false}>
        {expanded && data.detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pt-2 text-sm text-(--color-text-secondary)"
          >
            {data.detail}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
