import * as React from 'react'
import { useFlightStore } from './store'
import { flightById, interventionByKind, FLIGHTS, INTERVENTIONS } from './data'
import { progressFor, footprintFor, monthlyPreventedKg, monthsToEarn } from './engine'

/** One hook, one source of truth for every figure the app shows. */
export function useProgress() {
  const enrolment = useFlightStore((s) => s.enrolment)

  return React.useMemo(() => {
    const flight = flightById(enrolment.flightId) ?? FLIGHTS[0]
    const intervention = interventionByKind(enrolment.intervention) ?? INTERVENTIONS[0]
    return {
      enrolment,
      flight,
      intervention,
      footprint: footprintFor(flight),
      progress: progressFor(enrolment, flight, intervention),
      perMonthKg: monthlyPreventedKg(intervention),
      monthsNeeded: monthsToEarn(flight, intervention),
    }
  }, [enrolment])
}
