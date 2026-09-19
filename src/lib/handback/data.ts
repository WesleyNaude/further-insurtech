import type { Goal } from './types'

/**
 * Kraków, 2028.
 *
 * Everything here is in grosz, the hundredth of a złoty, because money in a
 * wallet app must never be a float. The member sees złoty; the fund is
 * denominated in euro, so both appear where each belongs.
 */

/** A 60-minute KMK ticket, 2026 price. */
export const FARE_GR = 600

/**
 * The share of each fare the hand-back covers.
 *
 * The user journey quotes €0.34 a trip and €24.80 a month. Those two cannot
 * both be true: at €0.34 she would need 3.3 trips every working day, and she
 * drives in and only trams home. The monthly figure is the one she actually
 * reads, so that is the one we kept, and the rate follows from it: half of a
 * 6 złoty fare, about €0.70, which lands €24.80 at 1.6 trips a working day.
 */
export const HANDBACK_SHARE = 0.5

export const HANDBACK_GR = Math.round(FARE_GR * HANDBACK_SHARE)

/** Złoty per euro, for showing the fund side in its own currency. */
export const ZL_PER_EUR = 4.3

/** The first tram that would get her to a six o'clock shift. */
export const FIRST_TRAM = '05:12'

/** Lines she actually uses. */
export const LINES = [
  { mode: 'tram' as const, line: '52', stop: 'Rondo Mogilskie' },
  { mode: 'tram' as const, line: '52', stop: 'Szpital Rydygiera' },
  { mode: 'tram' as const, line: '4', stop: 'Nowy Kleparz' },
  { mode: 'bus' as const, line: '139', stop: 'Bronowice Małe' },
]

/** The next 18 May, so the school trip is always ahead rather than in a fixed
 *  year that drifts out of date. */
export function nextMay(now = new Date()): string {
  const year = now.getMonth() > 4 || (now.getMonth() === 4 && now.getDate() > 18)
    ? now.getFullYear() + 1
    : now.getFullYear()
  return `${year}-05-18`
}

export const defaultGoal = (now = new Date()): Goal => ({
  id: 'school-trip',
  label: 'School trip',
  targetGr: 32_000,
  dueOn: nextMay(now),
})
