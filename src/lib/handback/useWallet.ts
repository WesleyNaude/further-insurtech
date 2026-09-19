import * as React from 'react'
import { useHandbackStore } from './store'
import { totals, oneWayPattern, goalProgress, weeklyRate } from './engine'

/** One hook, one source of truth for every figure the app shows. */
export function useWallet() {
  const household = useHandbackStore((s) => s.household)
  const taps = useHandbackStore((s) => s.taps)
  const goal = useHandbackStore((s) => s.goal)
  const savedGr = useHandbackStore((s) => s.savedGr)
  const cashedGr = useHandbackStore((s) => s.cashedGr)
  const payout = useHandbackStore((s) => s.payout)

  return React.useMemo(() => {
    const t = totals(taps)
    const rate = weeklyRate(taps)
    return {
      household,
      taps,
      totals: t,
      payout,
      savedGr,
      cashedGr,
      /** Not yet allocated to the goal or taken as cash. */
      availableGr: Math.max(0, t.all - savedGr - cashedGr),
      weeklyRateGr: rate,
      pattern: oneWayPattern(taps),
      goal: goal ? goalProgress(goal, savedGr, rate) : null,
    }
  }, [household, taps, goal, savedGr, cashedGr, payout])
}
