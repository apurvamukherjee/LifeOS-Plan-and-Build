import type { ModuleKey } from '@/db/schema'
import type { GoalEvaluator } from '@/engine/logging/logEvent'

export interface ModuleCorrelation {
  moduleA: ModuleKey
  labelA: string
  moduleB: ModuleKey
  labelB: string
  /** Phi coefficient (binary Pearson correlation), -1..1. */
  strength: number
  direction: 'positive' | 'negative'
  sampleSize: number
}

/** Per-module goal-met/not series across a shared set of dates, oldest first. */
export async function getDailyGoalMetSeries(
  modules: { moduleKey: ModuleKey; evaluator: GoalEvaluator }[],
  dates: string[],
  timeZone: string,
): Promise<Record<ModuleKey, boolean[]>> {
  const entries = await Promise.all(
    modules.map(async ({ moduleKey, evaluator }) => {
      const series = await Promise.all(dates.map((date) => evaluator.isGoalMet(date, timeZone)))
      return [moduleKey, series] as const
    }),
  )
  return Object.fromEntries(entries) as Record<ModuleKey, boolean[]>
}

function countTrue(series: boolean[]): number {
  return series.filter(Boolean).length
}

/**
 * Phi coefficient (the binary-variable form of Pearson correlation) between two equal-length
 * boolean series. Returns null — not 0 — when either series has zero variance (all-true or
 * all-false across the whole window), since correlation is genuinely undefined there, not
 * "no relationship."
 */
export function phiCoefficient(a: boolean[], b: boolean[]): number | null {
  if (a.length !== b.length || a.length === 0) return null

  let n11 = 0
  let n10 = 0
  let n01 = 0
  let n00 = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] && b[i]) n11++
    else if (a[i] && !b[i]) n10++
    else if (!a[i] && b[i]) n01++
    else n00++
  }

  const n1x = n11 + n10
  const n0x = n01 + n00
  const nx1 = n11 + n01
  const nx0 = n10 + n00
  const denominator = Math.sqrt(n1x * n0x * nx1 * nx0)
  if (denominator === 0) return null

  return (n11 * n00 - n10 * n01) / denominator
}

export interface CorrelationOptions {
  /** Each module in a pair must have been goal-met on at least this many days in the window,
   * otherwise a barely-used module could spuriously "correlate" by chance alignment. */
  minActiveDays?: number
  /** Minimum |phi coefficient| to surface — below this reads as noise, not a real pattern. */
  minStrength?: number
}

const DEFAULT_MIN_ACTIVE_DAYS = 5
const DEFAULT_MIN_STRENGTH = 0.35

/**
 * Finds the strongest cross-module relationships in a boolean-series window, sorted strongest
 * first. Deliberately returns [] rather than a low-confidence guess when nothing clears the
 * thresholds — a fresh install or a quiet stretch should show nothing here, not a fabricated
 * "insight."
 */
export function computeModuleCorrelations(
  series: Record<ModuleKey, boolean[]>,
  labels: Record<ModuleKey, string>,
  options: CorrelationOptions = {},
): ModuleCorrelation[] {
  const minActiveDays = options.minActiveDays ?? DEFAULT_MIN_ACTIVE_DAYS
  const minStrength = options.minStrength ?? DEFAULT_MIN_STRENGTH
  const keys = Object.keys(series) as ModuleKey[]
  const results: ModuleCorrelation[] = []

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = series[keys[i]]
      const b = series[keys[j]]
      if (countTrue(a) < minActiveDays || countTrue(b) < minActiveDays) continue

      const strength = phiCoefficient(a, b)
      if (strength === null || Math.abs(strength) < minStrength) continue

      results.push({
        moduleA: keys[i],
        labelA: labels[keys[i]],
        moduleB: keys[j],
        labelB: labels[keys[j]],
        strength,
        direction: strength > 0 ? 'positive' : 'negative',
        sampleSize: a.length,
      })
    }
  }

  return results.sort((x, y) => Math.abs(y.strength) - Math.abs(x.strength))
}

/** Shame-free, plain-language framing — no correlation coefficients in the UI copy. */
export function describeCorrelation(correlation: ModuleCorrelation): string {
  return correlation.direction === 'positive'
    ? `${correlation.labelA} and ${correlation.labelB} tend to go together — when one goes well, the other usually does too.`
    : `${correlation.labelA} and ${correlation.labelB} rarely land on the same day — might be worth noticing if that's a trade-off for you.`
}
