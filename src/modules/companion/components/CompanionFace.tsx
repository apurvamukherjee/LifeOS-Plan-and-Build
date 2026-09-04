import { motion } from 'motion/react'
import type { CompanionMood } from '../mood'

const MOOD_COLOR_VAR: Record<CompanionMood, string> = {
  thriving: '--color-streak',
  content: '--color-water',
  resting: '--color-mind',
}

const FACE_STROKE = '#0b0b14'

/**
 * A simple SVG blob face, not an illustrated character — no art assets exist for this project,
 * and a full Finch-style companion is deliberately out of scope for now (see docs/ROADMAP.md).
 * This is the cheap version of the same idea: a gentle "breathing" animation plus three moods
 * derived from real weekly data, framed non-judgmentally (resting, never sad).
 */
export function CompanionFace({ mood, size = 72 }: { mood: CompanionMood; size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      animate={{ scaleY: [1, 1.04, 1], scaleX: [1, 0.98, 1] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <circle cx="50" cy="52" r="38" fill={`var(${MOOD_COLOR_VAR[mood]})`} opacity={0.9} />
      {mood === 'resting' ? (
        <>
          <path d="M32 48 q6 6 12 0" stroke={FACE_STROKE} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M56 48 q6 6 12 0" stroke={FACE_STROKE} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M42 66 q8 4 16 0" stroke={FACE_STROKE} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="38" cy="48" r={mood === 'thriving' ? 5 : 4} fill={FACE_STROKE} />
          <circle cx="62" cy="48" r={mood === 'thriving' ? 5 : 4} fill={FACE_STROKE} />
          <path
            d={mood === 'thriving' ? 'M36 64 q14 14 28 0' : 'M40 64 q10 6 20 0'}
            stroke={FACE_STROKE}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
    </motion.svg>
  )
}
