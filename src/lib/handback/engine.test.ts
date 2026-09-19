import { describe, it, expect } from 'vitest'
import { totals, startOfWeek, oneWayPattern, goalProgress, weeklyRate } from './engine'
import { formatZl, formatEur, sum } from './money'
import { HANDBACK_GR, FARE_GR, HANDBACK_SHARE, ZL_PER_EUR, nextMay } from './data'
import type { Tap, Goal } from './types'

const NOW = new Date(2028, 3, 12, 18, 0) // Wednesday 12 April 2028

const tap = (daysAgo: number, leg: Tap['leg'], hour = 14): Tap => {
  const at = new Date(NOW)
  at.setDate(at.getDate() - daysAgo)
  at.setHours(hour, 30, 0, 0)
  return {
    id: `t${daysAgo}${leg}${hour}`,
    at: at.toISOString(),
    mode: 'tram',
    line: '52',
    stop: 'Rondo Mogilskie',
    fareGr: FARE_GR,
    backGr: HANDBACK_GR,
    leg,
  }
}

describe('the hand-back rate', () => {
  it('is half a fare, which is what makes the journey’s monthly figure possible', () => {
    expect(HANDBACK_GR).toBe(Math.round(FARE_GR * HANDBACK_SHARE))
    expect(HANDBACK_GR).toBe(300)
  })

  it('lands near the journey’s €24.80 a month at a believable trip count', () => {
    const monthlyEur = (35 * HANDBACK_GR) / 100 / ZL_PER_EUR
    expect(monthlyEur).toBeGreaterThan(22)
    expect(monthlyEur).toBeLessThan(28)
  })
})

describe('totals', () => {
  it('adds up today, the week, the month and all of it', () => {
    const taps = [tap(0, 'pm'), tap(1, 'pm'), tap(40, 'pm')]
    const t = totals(taps, NOW)
    expect(t.today).toBe(HANDBACK_GR)
    expect(t.all).toBe(HANDBACK_GR * 3)
    expect(t.week).toBe(HANDBACK_GR * 2) // Wednesday, so Monday's is in
    expect(t.tripsMonth).toBe(2)
  })

  it('is zero across the board with no journeys', () => {
    const t = totals([], NOW)
    expect([t.today, t.week, t.month, t.all, t.tripsMonth]).toEqual([0, 0, 0, 0, 0])
  })

  it('starts the week on Monday', () => {
    expect(startOfWeek(NOW).getDay()).toBe(1)
  })
})

describe('the one-way pattern, which is the point of the whole app', () => {
  /** Ten working days of coming home by tram and driving in. */
  const homeOnly = () => {
    const out: Tap[] = []
    for (let d = 1; d <= 16; d++) {
      const day = new Date(NOW)
      day.setDate(day.getDate() - d)
      const dow = day.getDay()
      if (dow === 0 || dow === 6) continue
      out.push(tap(d, 'pm'))
    }
    return out
  }

  it('spots that she comes home by tram but drives in', () => {
    const p = oneWayPattern(homeOnly(), NOW)
    expect(p.homeOnlyDays).toBeGreaterThanOrEqual(8)
    expect(p.bothWaysDays).toBe(0)
    expect(p.clear).toBe(true)
  })

  it('prices the missing mornings', () => {
    const p = oneWayPattern(homeOnly(), NOW)
    expect(p.missedGr).toBe(p.homeOnlyDays * HANDBACK_GR)
  })

  it('says nothing once she travels both ways', () => {
    const both = homeOnly().flatMap((t) => {
      const am = { ...t, id: t.id + 'am', leg: 'am' as const }
      return [t, am]
    })
    const p = oneWayPattern(both, NOW)
    expect(p.bothWaysDays).toBeGreaterThan(0)
    expect(p.homeOnlyDays).toBe(0)
    expect(p.clear).toBe(false)
  })

  it('says nothing on two days of evidence, because that is not a pattern', () => {
    const p = oneWayPattern([tap(1, 'pm'), tap(2, 'pm')], NOW)
    expect(p.clear).toBe(false)
  })

  it('ignores weekends, which are not a commute', () => {
    const sat = new Date(NOW)
    sat.setDate(sat.getDate() - ((sat.getDay() + 1) % 7)) // back to a Saturday
    const weekendOnly: Tap[] = [{ ...tap(0, 'pm'), at: sat.toISOString() }]
    const p = oneWayPattern(weekendOnly, NOW)
    expect(p.homeOnlyDays).toBe(0)
  })
})

describe('the goal', () => {
  const goal: Goal = { id: 'g', label: 'School trip', targetGr: 32_000, dueOn: '2028-05-18' }

  it('reports progress as a fraction of the target', () => {
    const p = goalProgress(goal, 16_000, 3_000, NOW)
    expect(p.fraction).toBeCloseTo(0.5, 5)
  })

  it('never exceeds one, however much is saved', () => {
    expect(goalProgress(goal, 99_000, 3_000, NOW).fraction).toBe(1)
  })

  it('is on track when the weekly rate covers what is still needed', () => {
    // Five weeks to go, 10,000 gr short: needs 2,000 a week.
    const p = goalProgress(goal, 22_000, 3_000, NOW)
    expect(p.neededPerWeekGr).toBeLessThanOrEqual(3_000)
    expect(p.onTrack).toBe(true)
  })

  it('is not on track when it is not', () => {
    const p = goalProgress(goal, 0, 500, NOW)
    expect(p.onTrack).toBe(false)
  })

  it('counts a covered goal as on track even with nothing coming in', () => {
    expect(goalProgress(goal, 32_000, 0, NOW).onTrack).toBe(true)
  })

  it('always falls due on a May still ahead of us', () => {
    expect(nextMay(new Date(2028, 0, 4))).toBe('2028-05-18')
    expect(nextMay(new Date(2028, 7, 4))).toBe('2029-05-18')
    // On the day itself it has not passed yet.
    expect(nextMay(new Date(2028, 4, 18))).toBe('2028-05-18')
  })
})

describe('weekly rate', () => {
  it('averages the last four weeks', () => {
    const taps = [0, 7, 14, 21].map((d) => tap(d, 'pm'))
    expect(weeklyRate(taps, NOW)).toBe(Math.round((HANDBACK_GR * 4) / 4))
  })

  it('is zero with nothing recent', () => {
    expect(weeklyRate([tap(200, 'pm')], NOW)).toBe(0)
  })
})

describe('money', () => {
  it('formats złoty the Polish way, with a comma', () => {
    expect(formatZl(300)).toBe('3,00 zł')
    expect(formatZl(8_700)).toBe('87,00 zł')
    expect(formatZl(123_456)).toBe('1 234,56 zł')
  })

  it('shows the fund side in its own currency', () => {
    expect(formatEur(HANDBACK_GR, ZL_PER_EUR)).toBe('€0.70')
  })

  it('sums in grosz, never floats', () => {
    expect(sum([10, 20, 30])).toBe(60)
    // The classic float trap, avoided by staying in integers.
    expect(sum([10, 20])).toBe(30)
  })
})
