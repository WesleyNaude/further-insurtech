import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from './store'
import type { Trip } from './domain/types'

const sample = (over: Partial<Trip> = {}): Trip => ({
  id: 't_test',
  startedAt: new Date().toISOString(),
  mode: 'train',
  fromName: 'A',
  toName: 'B',
  metres: 10_000,
  corridorId: 'clar-cbd',
  path: [[18.46, -33.98], [18.42, -33.92]],
  verification: 'verified',
  evidence: [],
  creditedCents: 0,
  ...over,
})

describe('store', () => {
  beforeEach(() => useStore.getState().reset())

  it('seeds a demo with trips and a policy', () => {
    const s = useStore.getState()
    expect(s.trips.length).toBeGreaterThan(50)
    expect(s.policy.basePremiumCents).toBeGreaterThan(0)
    expect(s.onboarded).toBe(false)
  })

  it('starts genuinely empty when asked, so the first run is real', () => {
    useStore.getState().resetEmpty()
    const s = useStore.getState()
    expect(s.trips).toHaveLength(0)
    expect(s.commitments).toHaveLength(0)
    expect(s.onboarded).toBe(false)
    // The policy survives: it is the member's, not demo history.
    expect(s.policy.basePremiumCents).toBeGreaterThan(0)
  })

  it('adds a trip to the front', () => {
    const before = useStore.getState().trips.length
    useStore.getState().addTrip(sample())
    const s = useStore.getState()
    expect(s.trips).toHaveLength(before + 1)
    expect(s.trips[0].id).toBe('t_test')
  })

  it('never lets a self-correction reach verified', () => {
    useStore.getState().addTrip(sample({ verification: 'verified' }))
    useStore.getState().reclassify('t_test', 'bus')
    const t = useStore.getState().trips.find((x) => x.id === 't_test')!
    expect(t.mode).toBe('bus')
    expect(t.verification).toBe('probable')
    expect(t.evidence.some((e) => e.kind === 'self')).toBe(true)
  })

  it('leaves other trips alone when reclassifying', () => {
    useStore.getState().addTrip(sample({ id: 'a' }))
    useStore.getState().addTrip(sample({ id: 'b', mode: 'taxi' }))
    useStore.getState().reclassify('a', 'car')
    expect(useStore.getState().trips.find((t) => t.id === 'b')!.mode).toBe('taxi')
  })

  it('records and cancels a commitment', () => {
    const before = useStore.getState().commitments.length
    useStore.getState().commit({
      corridorId: 'bell-cbd',
      mode: 'train',
      departAt: new Date().toISOString(),
    })
    const added = useStore.getState().commitments
    expect(added).toHaveLength(before + 1)
    expect(added[0].status).toBe('open')

    useStore.getState().cancelCommitment(added[0].id)
    expect(useStore.getState().commitments).toHaveLength(before)
  })

  it('merges a partial policy change without dropping the rest', () => {
    const vehicle = useStore.getState().policy.vehicle
    useStore.getState().setPolicy({ basePremiumCents: 250_000 })
    const p = useStore.getState().policy
    expect(p.basePremiumCents).toBe(250_000)
    expect(p.vehicle).toBe(vehicle)
    expect(p.ratedAnnualKm).toBeGreaterThan(0)
  })
})
