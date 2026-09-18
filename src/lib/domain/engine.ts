import type { Trip, Policy, Mode } from './types'
import { localDateKey } from '../date'
import type { Cents } from './money'

/**
 * The reward engine.
 *
 * Everything the user sees in rand is derived here from one honest premise:
 * the insurer rated your premium on an assumed annual mileage. Drive fewer
 * kilometres than you were rated for and your expected claims cost falls.
 * We return a share of that fall to you.
 *
 * We do NOT price carbon. A commuter's annual carbon saving is worth roughly
 * R300, which cannot fund anything. Exposure reduction can.
 *
 * Every constant below is declared, bounded, and surfaced in the UI.
 */

/** Claims cost does not fall 1:1 with mileage. Fixed risks (theft, hail, parked
 *  damage) persist at zero kilometres, so only part of the premium is mileage-variable. */
export const MILEAGE_VARIABLE_SHARE = 0.55

/** The share of the modelled saving passed back to the member. The rest is the
 *  insurer's margin and our fee. Stated plainly rather than buried. */
export const MEMBER_SHARE = 0.60

/** Nobody's premium goes to zero. Hard ceiling on the monthly reduction. */
export const MAX_REDUCTION = 0.30

/** Only trips on a corridor you could plausibly have driven count as displaced. */
export const DISPLACING_MODES: Mode[] = ['train', 'bus', 'taxi']

/** SA grid and fleet factors, grams CO2e per passenger-km. Secondary metric only. */
export const CO2_G_PER_KM: Record<Mode, number> = {
  car: 192,
  taxi: 68,
  bus: 89,
  train: 41,
  walk: 0,
  cycle: 0,
}

export interface DerivationStep {
  label: string
  value: string
  note: string
}

export interface Statement {
  /** Kilometres the policy assumed you would drive this month. */
  ratedKm: number
  /** Kilometres actually driven, from verified car trips. */
  drivenKm: number
  /** Kilometres travelled by a mode that displaced a drive. */
  displacedKm: number
  /** Kilometres under the rated assumption. Never negative. */
  avoidedKm: number
  /** Share of rated exposure avoided, 0..1. */
  exposureReduction: number
  /** Share of premium reduced, 0..1, after damping and the ceiling. */
  premiumReduction: number
  /** Rand off this month's premium. */
  reductionCents: Cents
  /** What a verified kilometre was worth this month. */
  centsPerVerifiedKm: number
  co2KgAvoided: number
  /** The full chain, for the transparency sheet. */
  derivation: DerivationStep[]
  cappedByCeiling: boolean
}

const km = (metres: number) => metres / 1000
const round2 = (n: number) => Math.round(n * 100) / 100

export function buildStatement(trips: Trip[], policy: Policy, monthFraction = 1): Statement {
  const ratedKm = (policy.ratedAnnualKm / 12) * monthFraction

  const counted = trips.filter((t) => t.verification !== 'unverified')

  const drivenKm = km(
    counted.filter((t) => t.mode === 'car').reduce((a, t) => a + t.metres, 0),
  )

  const displacedKm = km(
    counted
      .filter((t) => DISPLACING_MODES.includes(t.mode))
      .reduce((a, t) => a + t.metres, 0),
  )

  const avoidedKm = Math.max(0, ratedKm - drivenKm)
  const exposureReduction = ratedKm > 0 ? Math.min(1, avoidedKm / ratedKm) : 0

  const rawReduction = exposureReduction * MILEAGE_VARIABLE_SHARE * MEMBER_SHARE
  const premiumReduction = Math.min(MAX_REDUCTION, rawReduction)
  const cappedByCeiling = rawReduction > MAX_REDUCTION

  const reductionCents = Math.round(policy.basePremiumCents * premiumReduction)

  const centsPerVerifiedKm = displacedKm > 0 ? Math.round(reductionCents / displacedKm) : 0

  const co2KgAvoided = counted
    .filter((t) => DISPLACING_MODES.includes(t.mode) || t.mode === 'walk' || t.mode === 'cycle')
    .reduce((a, t) => a + (km(t.metres) * (CO2_G_PER_KM.car - CO2_G_PER_KM[t.mode])) / 1000, 0)

  const pct = (n: number) => `${Math.round(n * 100)}%`

  const derivation: DerivationStep[] = [
    {
      label: 'Your policy was rated on',
      value: `${policy.ratedAnnualKm.toLocaleString('en-ZA')} km a year`,
      note: `That is ${Math.round(policy.ratedAnnualKm / 12).toLocaleString('en-ZA')} km a month, the exposure ${policy.insurer} priced.`,
    },
    {
      label: 'You actually drove',
      value: `${Math.round(drivenKm).toLocaleString('en-ZA')} km`,
      note: 'Measured from verified car trips only. Unverified trips are excluded in your favour.',
    },
    {
      label: 'Exposure avoided',
      value: pct(exposureReduction),
      note: `${Math.round(avoidedKm).toLocaleString('en-ZA')} km under what you were rated for.`,
    },
    {
      label: 'Mileage-variable share of premium',
      value: pct(MILEAGE_VARIABLE_SHARE),
      note: 'Theft, hail and parked damage do not fall when you drive less, so only part of the premium moves.',
    },
    {
      label: 'Your share of the saving',
      value: pct(MEMBER_SHARE),
      note: 'The remainder covers the insurer’s margin and our verification fee. We never take a cut of your reduction.',
    },
    {
      label: 'Premium reduction',
      value: pct(premiumReduction),
      note: cappedByCeiling
        ? `Capped at ${pct(MAX_REDUCTION)}. You earned more than the ceiling allows this month.`
        : 'Applied to your next debit order.',
    },
  ]

  return {
    ratedKm: round2(ratedKm),
    drivenKm: round2(drivenKm),
    displacedKm: round2(displacedKm),
    avoidedKm: round2(avoidedKm),
    exposureReduction,
    premiumReduction,
    reductionCents,
    centsPerVerifiedKm,
    co2KgAvoided: round2(co2KgAvoided),
    derivation,
    cappedByCeiling,
  }
}

/**
 * Premium reduction for a given number of avoided kilometres against a given
 * rated exposure. Extracted so callers cannot accidentally recompute the rated
 * figure without the month proration, which silently produces nonsense.
 */
export function reductionFor(avoidedKm: number, ratedKm: number): number {
  if (ratedKm <= 0) return 0
  const exposure = Math.min(1, Math.max(0, avoidedKm) / ratedKm)
  return Math.min(MAX_REDUCTION, exposure * MILEAGE_VARIABLE_SHARE * MEMBER_SHARE)
}

/** Streak of consecutive days with at least one displacing trip. */
export function currentStreak(trips: Trip[], now = new Date()): number {
  const days = new Set(
    trips
      .filter((t) => DISPLACING_MODES.includes(t.mode) && t.verification !== 'unverified')
      .map((t) => localDateKey(new Date(t.startedAt))),
  )
  let streak = 0
  const cursor = new Date(now)
  // Today only counts if it has a trip; otherwise start from yesterday.
  if (!days.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (days.has(localDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
