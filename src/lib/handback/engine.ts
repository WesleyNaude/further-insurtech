import type { Tap, Goal } from './types'
import { HANDBACK_GR } from './data'
import { localDateKey } from '../date'
import { sum, type Grosz } from './money'

/**
 * The hand-back engine.
 *
 * Marta does nothing to earn this. She taps her card the way she always has,
 * the operator tells us a valid journey happened, and the money follows. So
 * there is no verification burden here at all: the fare system already did it.
 *
 * That is the whole design. If the system needs her to remember something at
 * twenty past four in the morning, it has already failed.
 */

export interface Totals {
  today: Grosz
  week: Grosz
  month: Grosz
  all: Grosz
  tripsMonth: number
}

export function totals(taps: Tap[], now = new Date()): Totals {
  const todayKey = localDateKey(now)
  const weekStart = startOfWeek(now)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const inWeek = taps.filter((t) => new Date(t.at) >= weekStart)
  const inMonth = taps.filter((t) => new Date(t.at) >= monthStart)

  return {
    today: sum(taps.filter((t) => localDateKey(new Date(t.at)) === todayKey).map((t) => t.backGr)),
    week: sum(inWeek.map((t) => t.backGr)),
    month: sum(inMonth.map((t) => t.backGr)),
    all: sum(taps.map((t) => t.backGr)),
    tripsMonth: inMonth.length,
  }
}

/** Monday. Poland starts its week there and so does the fare period. */
export function startOfWeek(d: Date): Date {
  const c = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  c.setDate(c.getDate() - ((c.getDay() + 6) % 7))
  return c
}

export interface OneWayPattern {
  /** Working days in the window where she travelled home but not in. */
  homeOnlyDays: number
  /** Days she travelled both ways. */
  bothWaysDays: number
  /** What the missing morning legs would have been worth. */
  missedGr: Grosz
  /** True once the pattern is clear enough to say something about it. */
  clear: boolean
}

/**
 * The most important thing this app can notice.
 *
 * Marta drives in and trams home, because the first tram is too late for a six
 * o'clock shift. If she moved her shift by half an hour she could tram both
 * ways, and her hand-back would roughly double while her petrol bill fell by
 * far more.
 *
 * We cannot make that decision for her. We can make it legible, in money, and
 * then stay out of the way.
 */
export function oneWayPattern(taps: Tap[], now = new Date(), windowDays = 28): OneWayPattern {
  const from = new Date(now)
  from.setDate(from.getDate() - windowDays)

  const byDay = new Map<string, Set<'am' | 'pm' | 'other'>>()
  for (const t of taps) {
    const d = new Date(t.at)
    if (d < from) continue
    const day = d.getDay()
    if (day === 0 || day === 6) continue // working pattern only
    const key = localDateKey(d)
    if (!byDay.has(key)) byDay.set(key, new Set())
    byDay.get(key)!.add(t.leg)
  }

  let homeOnly = 0
  let both = 0
  for (const legs of byDay.values()) {
    if (legs.has('pm') && !legs.has('am')) homeOnly++
    else if (legs.has('pm') && legs.has('am')) both++
  }

  return {
    homeOnlyDays: homeOnly,
    bothWaysDays: both,
    missedGr: homeOnly * HANDBACK_GR,
    // Two working weeks of the same shape is enough to mean something.
    clear: homeOnly >= 8 && homeOnly > both,
  }
}

export interface GoalProgress {
  goal: Goal
  savedGr: Grosz
  fraction: number
  /** Weeks left until it is needed. */
  weeksLeft: number
  /** At the current weekly rate, is she going to make it? */
  onTrack: boolean
  /** What she still needs each week. */
  neededPerWeekGr: Grosz
}

export function goalProgress(
  goal: Goal,
  savedGr: Grosz,
  weeklyRateGr: Grosz,
  now = new Date(),
): GoalProgress {
  const due = new Date(`${goal.dueOn}T00:00:00`)
  const weeksLeft = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / (7 * 864e5)))
  const remaining = Math.max(0, goal.targetGr - savedGr)
  const neededPerWeek = weeksLeft > 0 ? Math.ceil(remaining / weeksLeft) : remaining

  return {
    goal,
    savedGr,
    fraction: goal.targetGr > 0 ? Math.min(1, savedGr / goal.targetGr) : 0,
    weeksLeft,
    onTrack: remaining === 0 || (weeksLeft > 0 && weeklyRateGr >= neededPerWeek),
    neededPerWeekGr: neededPerWeek,
  }
}

/** A plain weekly average over the last four weeks, for projecting a goal. */
export function weeklyRate(taps: Tap[], now = new Date()): Grosz {
  const from = new Date(now)
  from.setDate(from.getDate() - 28)
  const recent = taps.filter((t) => new Date(t.at) >= from)
  return Math.round(sum(recent.map((t) => t.backGr)) / 4)
}
