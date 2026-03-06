import { describe, expect, it } from 'vitest'

import { computeCanonicalWeightedScore, normalizeScore } from './score'

describe('normalizeScore', () => {
  it('clamps scores into the 0-100 range', () => {
    expect(normalizeScore(-10)).toBe(0)
    expect(normalizeScore(42)).toBe(42)
    expect(normalizeScore(120)).toBe(100)
  })
})

describe('computeCanonicalWeightedScore', () => {
  const criteria = [
    { name: 'Impact Potential', weight: 0.3 },
    { name: 'Feasibility', weight: 0.25 },
    { name: 'Scalability', weight: 0.2 },
    { name: 'Innovation', weight: 0.15 },
    { name: 'Clarity', weight: 0.1 },
  ]

  it('computes deterministic weighted scores from numeric values', () => {
    const result = computeCanonicalWeightedScore(criteria, {
      'Impact Potential': 90,
      Feasibility: 80,
      Scalability: 70,
      Innovation: 60,
      Clarity: 50,
    })

    expect(result.score).toBe(75)
    expect(result.weightedScore).toBe(75)
    expect(result.modelOverallScore).toBeNull()
    expect(result.deltaFromModel).toBeNull()
    expect(result.hasMaterialMismatch).toBe(false)
  })

  it('supports object-style score payloads and tracks model mismatch', () => {
    const result = computeCanonicalWeightedScore(
      criteria,
      {
        'Impact Potential': { score: 100 },
        Feasibility: { score: 80 },
        Scalability: { score: 80 },
        Innovation: { score: 80 },
        Clarity: { score: 80 },
      },
      70
    )

    expect(result.score).toBe(86)
    expect(result.modelOverallScore).toBe(70)
    expect(result.deltaFromModel).toBe(16)
    expect(result.hasMaterialMismatch).toBe(true)
  })

  it('treats missing or invalid criteria as zero contribution', () => {
    const result = computeCanonicalWeightedScore(
      criteria,
      {
        'Impact Potential': null,
        Feasibility: undefined,
        Scalability: { score: null },
        Innovation: { score: -20 },
      },
      0
    )

    expect(result.weightedScore).toBe(0)
    expect(result.score).toBe(0)
    expect(result.modelOverallScore).toBe(0)
    expect(result.deltaFromModel).toBe(0)
    expect(result.hasMaterialMismatch).toBe(false)
  })
})
