import { describe, expect, it } from 'vitest'
import { calculatePlates } from './plateCalculator'

describe('calculatePlates', () => {
  it('splits an even target weight into whole plates per side', () => {
    expect(calculatePlates(100, 20)).toEqual({ weightPerSide: 40, plates: [20, 20] })
  })

  it('handles a weight requiring mixed plate sizes', () => {
    expect(calculatePlates(62.5, 20)).toEqual({ weightPerSide: 21.25, plates: [20, 1.25] })
  })

  it('returns no plates when the target is at or below the bar weight', () => {
    expect(calculatePlates(20, 20)).toEqual({ weightPerSide: 0, plates: [] })
    expect(calculatePlates(10, 20)).toEqual({ weightPerSide: 0, plates: [] })
  })

  it('defaults to a 20kg bar', () => {
    expect(calculatePlates(60)).toEqual({ weightPerSide: 20, plates: [20] })
  })
})
