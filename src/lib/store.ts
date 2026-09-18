import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Trip, Commitment, Policy } from './domain/types'
import { POLICY, seedTrips, seedCommitments } from './domain/seed'

/**
 * Local-first data layer.
 *
 * Everything lives behind this store so a real backend can be dropped in by
 * swapping the actions for network calls. Nothing else in the app touches storage.
 */
interface State {
  policy: Policy
  trips: Trip[]
  commitments: Commitment[]
  /** Cents already paid out, as opposed to accrued this month. */
  paidOutCents: number
  onboarded: boolean

  setPolicy: (p: Partial<Policy>) => void
  addTrip: (t: Trip) => void
  reclassify: (tripId: string, mode: Trip['mode']) => void
  commit: (c: Omit<Commitment, 'id' | 'createdAt' | 'status'>) => void
  cancelCommitment: (id: string) => void
  setOnboarded: (v: boolean) => void
  reset: () => void
  resetEmpty: () => void
}

const fresh = () => ({
  policy: POLICY,
  trips: seedTrips(),
  commitments: seedCommitments(),
  paidOutCents: 128_400,
  onboarded: false,
})

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...fresh(),

      setPolicy: (p) => set((s) => ({ policy: { ...s.policy, ...p } })),

      addTrip: (t) => set((s) => ({ trips: [t, ...s.trips] })),

      reclassify: (tripId, mode) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  mode,
                  verification: 'probable',
                  evidence: [
                    ...t.evidence,
                    {
                      kind: 'self' as const,
                      label: 'You corrected this',
                      detail: 'Self-reported mode. Counts at probable, never at verified.',
                      passed: true,
                    },
                  ],
                }
              : t,
          ),
        })),

      commit: (c) =>
        set((s) => ({
          commitments: [
            { ...c, id: `c_${Date.now()}`, createdAt: new Date().toISOString(), status: 'open' },
            ...s.commitments,
          ],
        })),

      cancelCommitment: (id) =>
        set((s) => ({ commitments: s.commitments.filter((c) => c.id !== id) })),

      setOnboarded: (v) => set({ onboarded: v }),

      reset: () => set(fresh()),

      // A real day one: no history, no commitments, onboarding from the top.
      resetEmpty: () =>
        set({ ...fresh(), trips: [], commitments: [], paidOutCents: 0, onboarded: false }),
    }),
    {
      name: 'further.v1',
      // Bumped whenever the seeded shape or copy changes, so a returning demo
      // does not sit on stale data. Persisted state is discarded on mismatch.
      version: 2,
      migrate: () => fresh() as never,
    },
  ),
)
