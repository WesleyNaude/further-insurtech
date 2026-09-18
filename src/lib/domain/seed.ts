import type { Trip, Policy, Mode, Evidence, Commitment } from './types'
import { CORRIDORS, corridorById } from './corridors'

/** Deterministic PRNG so the demo is identical on every load. */
function mulberry(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const POLICY: Policy = {
  insurer: 'Cornerstone Insure',
  product: 'Comprehensive, behaviour-linked',
  basePremiumCents: 189_000, // R1,890 a month
  ratedAnnualKm: 22_000,
  vehicle: '2019 VW Polo 1.0 TSI',
  linkedAt: '2026-06-02T09:12:00+02:00',
}

const evidenceFor = (mode: Mode, corridorName: string, verified: boolean): Evidence[] => {
  if (mode === 'car') {
    return [
      { kind: 'speed', label: 'Speed profile', detail: 'Sustained road speeds with vehicle-like acceleration', passed: true },
      { kind: 'vehicle-idle', label: 'Idle signature', detail: 'Stop-start pattern consistent with traffic, not stations', passed: true },
    ]
  }
  const base: Evidence[] = [
    { kind: 'corridor', label: 'Corridor match', detail: `Path stayed within 120 m of the ${corridorName} alignment`, passed: true },
    { kind: 'stop-dwell', label: 'Stop dwell', detail: 'Paused at scheduled stops for 20 to 60 seconds', passed: verified },
    { kind: 'cadence', label: 'Motion cadence', detail: 'No walking cadence at road speed, so not a handheld device in a car', passed: true },
  ]
  if (mode === 'train' || mode === 'bus') {
    base.push({ kind: 'fare-tap', label: 'Fare tap', detail: verified ? 'Matched a card tap within 90 seconds of boarding' : 'No tap found, corridor evidence only', passed: verified })
  }
  return base
}

function jitter(path: [number, number][], rnd: () => number): [number, number][] {
  return path.map(([lng, lat]) => [lng + (rnd() - 0.5) * 0.0016, lat + (rnd() - 0.5) * 0.0016] as [number, number])
}

export function seedTrips(now = new Date()): Trip[] {
  const rnd = mulberry(20260918)
  const trips: Trip[] = []
  // 38 days of history so the month view and the trend charts have shape.
  for (let dayOffset = 37; dayOffset >= 0; dayOffset--) {
    const day = new Date(now)
    day.setDate(day.getDate() - dayOffset)
    const dow = day.getDay()
    if (dow === 0) continue // no commute on Sundays
    const weekend = dow === 6

    // Behaviour improves over the history: more displacing trips recently.
    const recency = 1 - dayOffset / 37
    const switchChance = weekend ? 0.25 : 0.42 + recency * 0.4

    const legs = weekend ? 1 : 2
    for (let leg = 0; leg < legs; leg++) {
      const switched = rnd() < switchChance
      const corridor = CORRIDORS[Math.floor(rnd() * (weekend ? CORRIDORS.length : 4))]
      const mode: Mode = switched
        ? (corridor.modes[Math.floor(rnd() * corridor.modes.length)] as Mode)
        : 'car'

      const verifiedRoll = rnd()
      const verification = mode === 'car'
        ? 'verified'
        : verifiedRoll > 0.16 ? 'verified' : verifiedRoll > 0.06 ? 'probable' : 'unverified'

      const hour = leg === 0 ? 6 + Math.floor(rnd() * 3) : 16 + Math.floor(rnd() * 3)
      const startedAt = new Date(day)
      startedAt.setHours(hour, Math.floor(rnd() * 60), 0, 0)

      const forward = leg === 0
      const path = jitter(forward ? corridor.path : [...corridor.path].reverse(), rnd)

      trips.push({
        id: `t_${day.toISOString().slice(0, 10)}_${leg}`,
        startedAt: startedAt.toISOString(),
        mode,
        fromName: forward ? corridor.fromName : corridor.toName,
        toName: forward ? corridor.toName : corridor.fromName,
        metres: Math.round(corridor.metres * (0.94 + rnd() * 0.12)),
        corridorId: corridor.id,
        path,
        verification: verification as Trip['verification'],
        evidence: evidenceFor(mode, corridor.name, verification === 'verified'),
        creditedCents: 0, // assigned by the engine at read time, never stored stale
      })
    }
  }
  return trips.sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

export function seedCommitments(now = new Date()): Commitment[] {
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 40, 0, 0)
  const c = corridorById('bell-cbd')!
  return [
    {
      id: 'c_1',
      corridorId: c.id,
      mode: 'train',
      departAt: tomorrow.toISOString(),
      createdAt: now.toISOString(),
      status: 'open',
    },
  ]
}
