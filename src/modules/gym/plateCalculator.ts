const AVAILABLE_PLATES_KG = [20, 15, 10, 5, 2.5, 1.25]
const EPSILON = 0.001

export interface PlateBreakdown {
  weightPerSide: number
  /** One entry per plate needed on ONE side of the bar, heaviest first. */
  plates: number[]
}

/** Given a target total weight and the bar's own weight, greedily breaks down the weight-per-side
 * into standard plate sizes. Any remainder smaller than the smallest plate is silently dropped
 * (can't be represented) rather than producing a fractional "plate". */
export function calculatePlates(targetWeightKg: number, barWeightKg = 20): PlateBreakdown {
  const weightPerSide = Math.max(0, (targetWeightKg - barWeightKg) / 2)
  let remaining = weightPerSide
  const plates: number[] = []

  for (const plate of AVAILABLE_PLATES_KG) {
    while (remaining >= plate - EPSILON) {
      plates.push(plate)
      remaining -= plate
    }
  }

  return { weightPerSide, plates }
}
