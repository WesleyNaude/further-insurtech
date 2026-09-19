import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tap, Goal, Household, Payout, EligibilityState } from './types'
import { defaultGoal, HANDBACK_GR, FARE_GR, LINES } from './data'
import { HOUSEHOLD, NEW_HOUSEHOLD, seedTaps } from './seed'

interface State {
  household: Household
  taps: Tap[]
  goal: Goal | null
  /** Grosz already moved into the goal. */
  savedGr: number
  /** Grosz already taken out as cash. */
  cashedGr: number
  payout: Payout
  onboarded: boolean

  setEligibility: (e: EligibilityState) => void
  approve: () => void
  /** A journey arriving from the operator. The member does nothing. */
  receiveTap: (leg?: Tap['leg']) => Tap
  setPayout: (p: Payout) => void
  moveToGoal: (gr: number) => void
  cashOut: (gr: number) => void
  setGoal: (g: Goal | null) => void
  setOnboarded: (v: boolean) => void
  reset: () => void
  resetEmpty: () => void
}

const seeded = () => ({
  household: HOUSEHOLD,
  taps: seedTaps(),
  goal: defaultGoal(),
  savedGr: 18_400,
  cashedGr: 6_000,
  payout: 'save' as Payout,
  onboarded: false,
})

const blank = () => ({
  household: NEW_HOUSEHOLD,
  taps: [] as Tap[],
  goal: null,
  savedGr: 0,
  cashedGr: 0,
  payout: 'save' as Payout,
  onboarded: false,
})

export const useHandbackStore = create<State>()(
  persist(
    (set) => ({
      ...seeded(),

      setEligibility: (eligibility) =>
        set((s) => ({ household: { ...s.household, eligibility } })),

      approve: () =>
        set((s) => ({
          household: {
            ...s.household,
            eligibility: 'approved',
            approvedOn: new Date().toISOString(),
            reference: 'KRK-SCP-4471',
          },
        })),

      receiveTap: (leg = 'other') => {
        const l = LINES[Math.floor(Math.random() * LINES.length)]
        const tap: Tap = {
          id: `tap_${Date.now()}`,
          at: new Date().toISOString(),
          mode: l.mode,
          line: l.line,
          stop: l.stop,
          fareGr: FARE_GR,
          backGr: HANDBACK_GR,
          leg,
        }
        set((s) => ({ taps: [tap, ...s.taps] }))
        return tap
      },

      setPayout: (payout) => set({ payout }),

      moveToGoal: (gr) => set((s) => ({ savedGr: s.savedGr + gr })),

      cashOut: (gr) => set((s) => ({ cashedGr: s.cashedGr + gr })),

      setGoal: (goal) => set({ goal }),

      setOnboarded: (v) => set({ onboarded: v }),

      reset: () => set(seeded()),
      resetEmpty: () => set(blank()),
    }),
    { name: 'further.handback.v1', version: 1, migrate: () => seeded() as never },
  ),
)
