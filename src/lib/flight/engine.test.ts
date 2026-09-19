import { describe, it, expect } from 'vitest'
import {
  footprintFor,
  monthlyPreventedKg,
  monthsToEarn,
  progressFor,
  baselineKwh,
  blockReason,
  SEATS_COVERED,
} from './engine'
import {
  FLIGHTS,
  INTERVENTIONS,
  GRID_KG_PER_KWH,
  GEYSER_KWH_MONTH,
  NON_CO2_MULTIPLIER,
  flightById,
  interventionByKind,
} from './data'
import { evidenceFor } from './seed'
import { formatMass, formatRand } from './money'
import type { Enrolment, BillReading } from './types'

const flight = flightById('jnb-hre')!
const heatpump = interventionByKind('heatpump')!
const lpg = interventionByKind('lpg')!

const enrolment = (over: Partial<Enrolment> = {}): Enrolment => ({
  flightId: 'jnb-hre',
  intervention: 'heatpump',
  tenure: 'owner',
  installedOn: '2026-04-12T00:00:00.000Z',
  evidence: evidenceFor('owner').map((e) => ({ ...e, suppliedAt: '2026-04-14T00:00:00.000Z' })),
  readings: [],
  claimedOn: null,
  ...over,
})

const reading = (month: string, kwh: number, baseline = false): BillReading => ({
  month,
  kwh,
  baseline,
})

describe('footprint', () => {
  it('counts the return journey, not one way', () => {
    const f = footprintFor(flight)
    // 980 km each way at 0.151 kg per pax-km.
    expect(f.co2Kg).toBeCloseTo(980 * 2 * 0.151, 0)
  })

  it('shows CO2 and the multiplied total separately, never only the total', () => {
    const f = footprintFor(flight)
    expect(f.totalKg).toBeCloseTo(f.co2Kg * NON_CO2_MULTIPLIER, 0)
    expect(f.totalKg).toBeGreaterThan(f.co2Kg)
  })

  it('sets the target at two seats, because breaking even is not a contribution', () => {
    const f = footprintFor(flight)
    expect(SEATS_COVERED).toBe(2)
    expect(f.targetKg).toBeCloseTo(f.totalKg * 2, 0)
  })

  it('scales with distance', () => {
    const short = footprintFor(FLIGHTS.find((f) => f.id === 'jnb-mpm')!)
    const long = footprintFor(FLIGHTS.find((f) => f.id === 'cpt-jnb')!)
    expect(long.targetKg).toBeGreaterThan(short.targetKg)
  })
})

describe('what an appliance prevents', () => {
  it('nets off the emissions the replacement itself creates', () => {
    // Gas displaces all the grid load but burns LPG, so it cannot be the
    // full grid figure.
    const gridOnly = GEYSER_KWH_MONTH * lpg.gridDisplaced * GRID_KG_PER_KWH
    expect(monthlyPreventedKg(lpg)).toBeCloseTo(gridOnly - lpg.ownEmissionsKgMonth, 0)
    expect(monthlyPreventedKg(lpg)).toBeLessThan(gridOnly)
  })

  it('is well below the team brief’s 258 kg a month for every option', () => {
    // The brief's headline timing rests on 0.258 t a month. At a 350 kWh
    // geyser and 0.699 kg/kWh, nothing on the list gets close.
    for (const i of INTERVENTIONS) {
      expect(monthlyPreventedKg(i)).toBeLessThan(258)
    }
  })

  it('takes longer to earn than the brief claims', () => {
    // The brief says about 5.3 months. Honest figures say more.
    expect(monthsToEarn(flight, heatpump)).toBeGreaterThan(5)
  })

  it('never returns a finite month count for an appliance that saves nothing', () => {
    const useless = { ...heatpump, gridDisplaced: 0, ownEmissionsKgMonth: 0 }
    expect(monthsToEarn(flight, useless)).toBe(Infinity)
  })
})

describe('progress is blocked until there is evidence', () => {
  it('counts nothing without an install date', () => {
    const p = progressFor(enrolment({ installedOn: null }), flight, heatpump)
    expect(p.blocked).toBe('no-install')
    expect(p.preventedKg).toBe(0)
  })

  it('counts nothing without the certificate', () => {
    const e = enrolment({
      evidence: evidenceFor('owner').map((x) =>
        x.kind === 'coc' ? { ...x, suppliedAt: null } : { ...x, suppliedAt: 'x' },
      ),
    })
    expect(blockReason(e)).toBe('no-certificate')
  })

  it('counts nothing without a pre-install baseline', () => {
    const p = progressFor(
      enrolment({ readings: [reading('2026-05', 120)] }),
      flight,
      heatpump,
    )
    expect(p.blocked).toBe('no-baseline')
  })

  it('counts nothing until there is a reading after the install', () => {
    const p = progressFor(
      enrolment({ readings: [reading('2026-01', 350, true)] }),
      flight,
      heatpump,
    )
    expect(p.blocked).toBe('no-reading-after')
  })
})

describe('progress comes from the bills, not the model', () => {
  const withBills = (afterKwh: number[], baseKwh = 350) =>
    enrolment({
      readings: [
        reading('2026-01', baseKwh, true),
        reading('2026-02', baseKwh, true),
        ...afterKwh.map((k, i) => reading(`2026-0${i + 4}`, k)),
      ],
    })

  it('measures the saving as the difference from the baseline', () => {
    const p = progressFor(withBills([150]), flight, heatpump)
    // 200 kWh saved, less nothing for a heat pump's own emissions.
    expect(p.preventedKg).toBeCloseTo(200 * GRID_KG_PER_KWH, 0)
    expect(p.blocked).toBeNull()
  })

  it('prefers the measured rate over the modelled one once bills exist', () => {
    const p = progressFor(withBills([150, 160]), flight, heatpump)
    expect(p.measuredKgMonth).not.toBeNull()
    expect(p.measuredKgMonth).not.toBe(p.modelledKgMonth)
  })

  it('does not pay for a month where usage went up', () => {
    const p = progressFor(withBills([400]), flight, heatpump)
    expect(p.preventedKg).toBe(0)
  })

  it('reaches earned only when both seats are covered', () => {
    const target = footprintFor(flight).targetKg
    const perMonth = 200 * GRID_KG_PER_KWH
    const monthsNeeded = Math.ceil(target / perMonth)

    const short = progressFor(withBills(Array(monthsNeeded - 1).fill(150)), flight, heatpump)
    expect(short.earned).toBe(false)

    const enough = progressFor(withBills(Array(monthsNeeded).fill(150)), flight, heatpump)
    expect(enough.earned).toBe(true)
    expect(enough.fraction).toBe(1)
  })

  it('never reports a fraction above one', () => {
    const p = progressFor(withBills(Array(40).fill(0)), flight, heatpump)
    expect(p.fraction).toBe(1)
  })
})

describe('baseline', () => {
  it('is null with no pre-install readings', () => {
    expect(baselineKwh([reading('2026-05', 100)])).toBeNull()
  })

  it('averages the pre-install readings only', () => {
    const b = baselineKwh([
      reading('2026-01', 300, true),
      reading('2026-02', 400, true),
      reading('2026-05', 100),
    ])
    expect(b).toBe(350)
  })
})

describe('tenure changes what must be proved', () => {
  it('asks a tenant for a landlord agreement, and an owner not', () => {
    expect(evidenceFor('owner').some((e) => e.kind === 'landlord')).toBe(false)
    const tenant = evidenceFor('tenant').find((e) => e.kind === 'landlord')
    expect(tenant?.required).toBe(true)
  })
})

describe('formatting', () => {
  it('switches to tonnes once the number earns them', () => {
    expect(formatMass(640)).toEqual({ value: '640', unit: 'kg CO2e' })
    expect(formatMass(1360)).toEqual({ value: '1.36', unit: 't CO2e' })
  })

  it('formats rand without a stray decimal', () => {
    expect(formatRand(600_000)).toBe('R6 000')
    expect(formatRand(1234, { decimals: true })).toBe('R12.34')
  })
})

describe('the arithmetic the brief warns about', () => {
  it('shows the carbon is worth far less than the ticket', () => {
    const target = footprintFor(flight).targetKg
    const carbonValueCents = Math.round((target / 1000) * 30_800) // R308/t
    expect(carbonValueCents).toBeLessThan(flight.ticketCents / 5)
  })
})
