import type { Tap, Household } from './types'
import { HANDBACK_GR, FARE_GR, LINES } from './data'

function mulberry(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const HOUSEHOLD: Household = {
  name: 'Marta Nowak',
  city: 'Kraków',
  people: 4,
  eligibility: 'approved',
  approvedOn: '2028-02-06T19:42:00+01:00',
  reference: 'KRK-SCP-4471',
}

export const NEW_HOUSEHOLD: Household = {
  name: 'Marta Nowak',
  city: 'Kraków',
  people: 4,
  eligibility: 'unknown',
  approvedOn: null,
  reference: null,
}

/**
 * Ten weeks of Marta's actual pattern.
 *
 * She drives in, because the first tram is too late for a six o'clock shift,
 * and trams home. Plus errands, and taking her mother places at weekends. That
 * shape is the point: it is what the app has to notice.
 */
export function seedTaps(now = new Date()): Tap[] {
  const rnd = mulberry(20280406)
  const taps: Tap[] = []

  for (let dayOffset = 69; dayOffset >= 0; dayOffset--) {
    const day = new Date(now)
    day.setDate(day.getDate() - dayOffset)
    const dow = day.getDay()

    const push = (hour: number, minute: number, leg: Tap['leg']) => {
      const l = LINES[Math.floor(rnd() * LINES.length)]
      const at = new Date(day)
      at.setHours(hour, minute, 0, 0)
      taps.push({
        id: `tap_${at.toISOString()}_${leg}`,
        at: at.toISOString(),
        mode: l.mode,
        line: l.line,
        stop: l.stop,
        fareGr: FARE_GR,
        backGr: HANDBACK_GR,
        leg,
      })
    }

    if (dow >= 1 && dow <= 5) {
      // The tram home from the hospital, every working day.
      push(14, 20 + Math.floor(rnd() * 25), 'pm')
      // An errand on the way, some days.
      if (rnd() < 0.3) push(16, 10 + Math.floor(rnd() * 40), 'other')
    } else {
      // Weekends: her mother, the shops, the kids.
      if (rnd() < 0.75) push(10, 15 + Math.floor(rnd() * 40), 'other')
      if (rnd() < 0.45) push(15, Math.floor(rnd() * 50), 'other')
    }
  }

  return taps.sort((a, b) => b.at.localeCompare(a.at))
}
