import clsx from 'clsx'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface ProgressRingProps {
  /** 0-1, clamped. Values above 1 (over-goal) are visually capped at a full ring. */
  progress: number
  size?: number
  strokeWidth?: number
  /** One of the CSS custom properties defined in src/styles/index.css, e.g. '--color-water'. */
  colorVar?: string
  className?: string
  children?: ReactNode
}

export function ProgressRing({
  progress,
  size = 96,
  strokeWidth = 8,
  colorVar = '--color-water',
  className,
  children,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, progress))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div
      className={clsx('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="color-mix(in srgb, white 12%, transparent)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`var(${colorVar})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: circumference * (1 - clamped) }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}
