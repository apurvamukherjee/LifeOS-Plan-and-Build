import type { ModuleWeeklyStat } from '@/modules/insights/weeklySummary'

export type CompanionMood = 'thriving' | 'content' | 'resting'

const THRIVING_THRESHOLD = 0.6

/**
 * Derives an overall mood from the same weekly stats the coaching summary already computes —
 * no new data collection needed. 'resting' covers "no activity at all" and is deliberately
 * framed as sleepy/waiting rather than sad or disappointed, per the app's shame-free tone
 * (Finch-style: a companion never punishes a quiet week, it just waits for you).
 */
export function getCompanionMood(stats: ModuleWeeklyStat[]): CompanionMood {
  const totalPossible = stats.reduce((sum, stat) => sum + stat.totalDays, 0)
  const totalMet = stats.reduce((sum, stat) => sum + stat.daysMet, 0)

  if (totalPossible === 0 || totalMet === 0) return 'resting'
  const ratio = totalMet / totalPossible
  return ratio >= THRIVING_THRESHOLD ? 'thriving' : 'content'
}

const MOOD_MESSAGES: Record<CompanionMood, string[]> = {
  thriving: ["You're on fire this week!", 'Look at you go — keep it up.', 'Strong week all around.'],
  content: ["You're building momentum.", 'Steady progress this week.', "Nice — you're on your way."],
  resting: [
    "I'm here whenever you're ready.",
    'Log something today to wake me up.',
    'Taking a quiet moment — say hi anytime.',
  ],
}

/** Deterministic per day (not truly random) so the message stays stable across re-renders and
 * only changes once daily, via a caller-supplied day-of-month seed. */
export function pickCompanionMessage(mood: CompanionMood, seed: number): string {
  const messages = MOOD_MESSAGES[mood]
  return messages[((seed % messages.length) + messages.length) % messages.length]
}
