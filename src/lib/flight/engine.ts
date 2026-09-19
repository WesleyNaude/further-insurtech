import type { Enrolment, Flight, Intervention, BillReading } from './types'
import {
  GRID_KG_PER_KWH,
  GEYSER_KWH_MONTH,
  KG_CO2_PER_PAX_KM,
  NON_CO2_MULTIPLIER,
} from './data'

/**
 * The reward engine.
 *
 * One flight is earned by preventing enough warming to cover the member's own
 * seat and one more passenger's. That doubling is the whole point: breaking
 * even is not a contribution, so the bar is deliberately twice the obvious one.
 *
 * Everything here is derived and every constant is surfaced in the UI.
 */

/** Seats covered: the member's, plus one other passenger's. */
export const SEATS_COVERED = 2

export interface Footprint {
  /** Fuel-burn CO2 for one passenger, return, kg. */
  co2Kg: number
  /** With contrails and the rest of the non-CO2 forcing, kg CO2e. */
  totalKg: number
  /** The target: both seats. */
  targetKg: number
}

export function footprintFor(flight: Flight): Footprint {
  const co2Kg = flight.km * 2 * KG_CO2_PER_PAX_KM
  const totalKg = co2Kg * NON_CO2_MULTIPLIER
  return {
    co2Kg: round1(co2Kg),
    totalKg: round1(totalKg),
    targetKg: round1(totalKg * SEATS_COVERED),
  }
}

/** What the appliance prevents each month, kg CO2e. */
export function monthlyPreventedKg(i: Intervention): number {
  const gridAvoided = GEYSER_KWH_MONTH * i.gridDisplaced * GRID_KG_PER_KWH
  return round1(gridAvoided - i.ownEmissionsKgMonth)
}

/** Months to cover both seats at the modelled rate. */
export function monthsToEarn(flight: Flight, i: Intervention): number {
  const perMonth = monthlyPreventedKg(i)
  if (perMonth <= 0) return Infinity
  return Math.ceil(footprintFor(flight).targetKg / perMonth)
}

export interface Progress {
  /** Months of verified saving so far. */
  verifiedMonths: number
  /** Prevented so far, kg CO2e, from matched bills only. */
  preventedKg: number
  targetKg: number
  /** 0..1 */
  fraction: number
  /** Whole months still to go, or null once earned. */
  monthsRemaining: number | null
  earned: boolean
  /** Measured saving per month from the member's own bills, kg. Null until
   *  there is a baseline and at least one month after the install. */
  measuredKgMonth: number | null
  /** The modelled rate, used before there is enough measurement. */
  modelledKgMonth: number
  blocked: BlockReason | null
}

export type BlockReason =
  | 'no-install'
  | 'no-certificate'
  | 'no-baseline'
  | 'no-reading-after'

/**
 * Progress is counted from matched electricity bills, never from the model.
 *
 * The model says what an appliance should save. The bills say what this
 * household actually saved. Only the second is evidence, so only the second
 * moves the number.
 */
export function progressFor(
  enrolment: Enrolment,
  flight: Flight,
  intervention: Intervention,
): Progress {
  const targetKg = footprintFor(flight).targetKg
  const modelled = monthlyPreventedKg(intervention)

  const blocked = blockReason(enrolment)
  if (blocked) {
    return {
      verifiedMonths: 0,
      preventedKg: 0,
      targetKg,
      fraction: 0,
      monthsRemaining: null,
      earned: false,
      measuredKgMonth: null,
      modelledKgMonth: modelled,
      blocked,
    }
  }

  const baseline = baselineKwh(enrolment.readings)!
  const after = enrolment.readings.filter((r) => !r.baseline)

  // Each month after the install contributes what that month actually saved.
  let preventedKg = 0
  for (const r of after) {
    const savedKwh = Math.max(0, baseline - r.kwh)
    preventedKg += savedKwh * GRID_KG_PER_KWH - intervention.ownEmissionsKgMonth
  }
  preventedKg = Math.max(0, round1(preventedKg))

  const measured = after.length > 0 ? round1(preventedKg / after.length) : null
  const rate = measured && measured > 0 ? measured : modelled
  const remainingKg = Math.max(0, targetKg - preventedKg)

  return {
    verifiedMonths: after.length,
    preventedKg,
    targetKg,
    fraction: Math.min(1, preventedKg / targetKg),
    monthsRemaining: remainingKg === 0 ? null : Math.ceil(remainingKg / rate),
    earned: preventedKg >= targetKg,
    measuredKgMonth: measured,
    modelledKgMonth: modelled,
    blocked: null,
  }
}

export function blockReason(e: Enrolment): BlockReason | null {
  if (!e.installedOn) return 'no-install'
  const coc = e.evidence.find((x) => x.kind === 'coc')
  if (coc?.required && !coc.suppliedAt) return 'no-certificate'
  if (baselineKwh(e.readings) === null) return 'no-baseline'
  if (!e.readings.some((r) => !r.baseline)) return 'no-reading-after'
  return null
}

/** The pre-install average, which every later month is measured against. */
export function baselineKwh(readings: BillReading[]): number | null {
  const before = readings.filter((r) => r.baseline)
  if (before.length === 0) return null
  return round1(before.reduce((a, r) => a + r.kwh, 0) / before.length)
}

const round1 = (n: number) => Math.round(n * 10) / 10
