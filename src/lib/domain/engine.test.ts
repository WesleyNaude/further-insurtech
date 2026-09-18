import { describe, it, expect } from 'vitest'
import { buildStatement, currentStreak, MAX_REDUCTION, MEMBER_SHARE, MILEAGE_VARIABLE_SHARE } from './engine'
import type { Trip, Policy } from './types'
import { formatRand, rand, sum } from './money'

const policy: Policy = {
  insurer: 'Test',
  product: 'Comprehensive',
  basePremiumCents: 200_000,
  ratedAnnualKm: 12_000, // 1,000 km a month
  vehicle: 'Test car',
  linkedAt: '2026-01-01T00:00:00Z',
}

const trip = (over: Partial<Trip>): Trip => ({
  id: Math.random().toString(36),
  startedAt: new Date().toISOString(),
  mode: 'train',
  fromName: 'A',
  toName: 'B',
  metres: 10_000,
  corridorId: 'x',
  path: [[0, 0], [1, 1]],
  verification: 'verified',
  evidence: [],
  creditedCents: 0,
  ...over,
})

describe('money', () => {
  it('keeps cents as integers', () => {
    expect(rand(12.34)).toBe(1234)
    expect(rand(0.1) + rand(0.2)).toBe(rand(0.3)) // the float trap
  })
  it('formats South African rand', () => {
    expect(formatRand(189_000)).toBe('R1\u2009890')
    expect(formatRand(1234, { decimals: true })).toBe('R12.34')
    expect(formatRand(-500)).toBe('-R5')
  })
  it('sums', () => expect(sum([100, 250, 25])).toBe(375))
})

describe('buildStatement', () => {
  it('gives no reduction when you drive exactly what you were rated for', () => {
    const s = buildStatement([trip({ mode: 'car', metres: 1_000_000 })], policy)
    expect(s.avoidedKm).toBe(0)
    expect(s.reductionCents).toBe(0)
  })

  it('reduces the premium in proportion to exposure avoided', () => {
    // Drove 500 of 1,000 rated km: half the exposure avoided.
    const s = buildStatement([trip({ mode: 'car', metres: 500_000 })], policy)
    expect(s.exposureReduction).toBeCloseTo(0.5, 5)
    expect(s.premiumReduction).toBeCloseTo(0.5 * MILEAGE_VARIABLE_SHARE * MEMBER_SHARE, 5)
  })

  it('never exceeds the ceiling', () => {
    const s = buildStatement([], policy) // drove nothing at all
    expect(s.premiumReduction).toBe(MAX_REDUCTION)
    expect(s.cappedByCeiling).toBe(true)
    expect(s.reductionCents).toBe(policy.basePremiumCents * MAX_REDUCTION)
  })

  it('excludes unverified trips from driven kilometres, in the member’s favour', () => {
    const withUnverified = buildStatement(
      [trip({ mode: 'car', metres: 500_000, verification: 'unverified' })],
      policy,
    )
    expect(withUnverified.drivenKm).toBe(0)
  })

  it('only credits displacing modes', () => {
    const s = buildStatement(
      [trip({ mode: 'car', metres: 500_000 }), trip({ mode: 'train', metres: 100_000 })],
      policy,
    )
    expect(s.displacedKm).toBe(100)
    expect(s.centsPerVerifiedKm).toBeGreaterThan(0)
  })

  it('does not divide by zero when nothing was displaced', () => {
    const s = buildStatement([trip({ mode: 'car', metres: 500_000 })], policy)
    expect(s.centsPerVerifiedKm).toBe(0)
    expect(Number.isFinite(s.centsPerVerifiedKm)).toBe(true)
  })

  it('reports carbon as a consequence, never as the basis', () => {
    const s = buildStatement([trip({ mode: 'train', metres: 100_000 })], policy)
    // 100 km at (192 - 41) g/km
    expect(s.co2KgAvoided).toBeCloseTo(15.1, 1)
  })

  it('prorates the rated mileage for a partial month', () => {
    const half = buildStatement([], policy, 0.5)
    expect(half.ratedKm).toBe(500)
  })

  it('publishes a complete derivation for every figure shown', () => {
    const s = buildStatement([trip({ mode: 'car', metres: 400_000 })], policy)
    expect(s.derivation).toHaveLength(6)
    expect(s.derivation.every((d) => d.label && d.value && d.note)).toBe(true)
  })
})

describe('currentStreak', () => {
  const day = (offset: number) => {
    const d = new Date('2026-09-18T08:00:00Z')
    d.setDate(d.getDate() - offset)
    return d.toISOString()
  }
  const now = new Date('2026-09-18T20:00:00Z')

  it('counts consecutive days with a displacing trip', () => {
    const trips = [0, 1, 2].map((i) => trip({ startedAt: day(i) }))
    expect(currentStreak(trips, now)).toBe(3)
  })

  it('breaks on a gap', () => {
    const trips = [0, 1, 3].map((i) => trip({ startedAt: day(i) }))
    expect(currentStreak(trips, now)).toBe(2)
  })

  it('does not count car trips', () => {
    expect(currentStreak([trip({ startedAt: day(0), mode: 'car' })], now)).toBe(0)
  })

  it('survives a day with no trip yet, counting from yesterday', () => {
    const trips = [1, 2].map((i) => trip({ startedAt: day(i) }))
    expect(currentStreak(trips, now)).toBe(2)
  })
})
