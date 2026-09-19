import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Enrolment, InterventionKind, Tenure, BillReading, EvidenceKind } from './types'
import { seedEnrolment, evidenceFor } from './seed'

interface State {
  enrolment: Enrolment
  onboarded: boolean

  chooseFlight: (flightId: string) => void
  chooseIntervention: (kind: InterventionKind) => void
  setTenure: (t: Tenure) => void
  markInstalled: (iso: string) => void
  supplyEvidence: (kind: EvidenceKind) => void
  addReading: (r: BillReading) => void
  claim: () => void
  setOnboarded: (v: boolean) => void
  reset: () => void
  resetEmpty: () => void
}

const fresh = () => ({ enrolment: seedEnrolment(), onboarded: false })

const empty = (): { enrolment: Enrolment; onboarded: boolean } => ({
  enrolment: {
    flightId: 'jnb-hre',
    intervention: 'heatpump',
    tenure: 'owner',
    installedOn: null,
    evidence: evidenceFor('owner'),
    readings: [],
    claimedOn: null,
  },
  onboarded: false,
})

export const useFlightStore = create<State>()(
  persist(
    (set) => ({
      ...fresh(),

      chooseFlight: (flightId) =>
        set((s) => ({ enrolment: { ...s.enrolment, flightId } })),

      chooseIntervention: (kind) =>
        set((s) => ({ enrolment: { ...s.enrolment, intervention: kind } })),

      // Changing tenure changes what has to be proved, so the checklist is rebuilt
      // while keeping anything already supplied.
      setTenure: (tenure) =>
        set((s) => {
          const supplied = new Map(s.enrolment.evidence.map((e) => [e.kind, e.suppliedAt]))
          return {
            enrolment: {
              ...s.enrolment,
              tenure,
              evidence: evidenceFor(tenure).map((e) => ({
                ...e,
                suppliedAt: supplied.get(e.kind) ?? null,
              })),
            },
          }
        }),

      markInstalled: (iso) => set((s) => ({ enrolment: { ...s.enrolment, installedOn: iso } })),

      supplyEvidence: (kind) =>
        set((s) => ({
          enrolment: {
            ...s.enrolment,
            evidence: s.enrolment.evidence.map((e) =>
              e.kind === kind ? { ...e, suppliedAt: new Date().toISOString() } : e,
            ),
          },
        })),

      addReading: (r) =>
        set((s) => ({
          enrolment: {
            ...s.enrolment,
            readings: [...s.enrolment.readings.filter((x) => x.month !== r.month), r].sort((a, b) =>
              a.month.localeCompare(b.month),
            ),
          },
        })),

      claim: () =>
        set((s) => ({ enrolment: { ...s.enrolment, claimedOn: new Date().toISOString() } })),

      setOnboarded: (v) => set({ onboarded: v }),
      reset: () => set(fresh()),
      resetEmpty: () => set(empty()),
    }),
    { name: 'further.flight.v1', version: 1, migrate: () => fresh() as never },
  ),
)
