import * as React from 'react'
import { useStore } from './store'
import { buildStatement, currentStreak, DISPLACING_MODES } from './domain/engine'
import type { Trip } from './domain/types'

export const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1)

/** Fraction of the current month elapsed, so a mid-month statement is honest. */
export function monthFraction(now = new Date()) {
  const start = startOfMonth(now)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return (now.getTime() - start.getTime()) / (end.getTime() - start.getTime())
}

export function tripsInMonth(trips: Trip[], now = new Date()) {
  const from = startOfMonth(now).toISOString()
  return trips.filter((t) => t.startedAt >= from)
}

/** One hook, one source of truth for every rand shown in the app. */
export function useStatement() {
  const trips = useStore((s) => s.trips)
  const policy = useStore((s) => s.policy)

  return React.useMemo(() => {
    const now = new Date()
    const monthTrips = tripsInMonth(trips, now)
    const statement = buildStatement(monthTrips, policy, monthFraction(now))

    // Credit is attributed to trips at read time so it can never go stale.
    const credited = monthTrips.map((t) => ({
      ...t,
      creditedCents:
        DISPLACING_MODES.includes(t.mode) && t.verification !== 'unverified'
          ? Math.round((t.metres / 1000) * statement.centsPerVerifiedKm)
          : 0,
    }))

    return {
      statement,
      policy,
      monthTrips: credited,
      allTrips: trips,
      streak: currentStreak(trips, now),
    }
  }, [trips, policy])
}
