import type { Flight, Intervention } from './types'

/**
 * Every constant here is sourced, and the UI shows the source. Where the team
 * brief's figure disagrees with the literature, the literature wins and the
 * difference is stated rather than quietly split.
 */

/** Eskom grid, kg CO2e per kWh. South Africa is roughly 80% coal. */
export const GRID_KG_PER_KWH = 0.699

/** A typical household electric geyser, kWh a month (range 240 to 450). */
export const GEYSER_KWH_MONTH = 350

/** Municipal tariff, cents per kWh, 2026. */
export const TARIFF_C_PER_KWH = 320

/**
 * Non-CO2 warming from a flight, as a multiplier on its CO2.
 *
 * Contrail cirrus is the single largest component of aviation's effective
 * radiative forcing, larger than CO2 itself. Applying it as a flat multiplier
 * is contested: CO2 persists for centuries and contrails for hours, so a single
 * number conflates a stock with a flow, and researchers have called the naive
 * RFI multiplication incorrect.
 *
 * We use it anyway, because ignoring two thirds of aviation's forcing is worse
 * than approximating it. The app always shows the CO2 figure separately so the
 * multiplier is never hidden inside a total.
 */
export const NON_CO2_MULTIPLIER = 1.9

/** Economy short-haul, kg CO2 per passenger-km. Higher than long-haul: the
 *  climb burns disproportionately on a short sector. */
export const KG_CO2_PER_PAX_KM = 0.151

export const FLIGHTS: Flight[] = [
  { id: 'jnb-hre', from: 'Johannesburg', to: 'Harare', km: 980, ticketCents: 600_000 },
  { id: 'cpt-jnb', from: 'Cape Town', to: 'Johannesburg', km: 1_270, ticketCents: 320_000 },
  { id: 'jnb-mpm', from: 'Johannesburg', to: 'Maputo', km: 450, ticketCents: 480_000 },
  { id: 'jnb-lun', from: 'Johannesburg', to: 'Lusaka', km: 1_140, ticketCents: 720_000 },
  { id: 'cpt-wdh', from: 'Cape Town', to: 'Windhoek', km: 1_200, ticketCents: 690_000 },
]

export const INTERVENTIONS: Intervention[] = [
  {
    kind: 'lpg',
    name: 'Gas geyser',
    blurb: 'Takes water heating off the grid entirely, then burns LPG instead.',
    costLowCents: 800_000,
    costHighCents: 1_500_000,
    gridDisplaced: 1,
    // LPG water heating for a household: roughly 13 kg a month at 2.98 kg CO2e/kg.
    ownEmissionsKgMonth: 39,
    annualSavingCents: 310_000,
  },
  {
    kind: 'solar',
    name: 'Solar geyser',
    blurb: 'Heats from the sun, with an electric element for cloudy stretches.',
    costLowCents: 2_250_000,
    costHighCents: 4_250_000,
    gridDisplaced: 0.65,
    ownEmissionsKgMonth: 0,
    annualSavingCents: 1_120_000,
  },
  {
    kind: 'heatpump',
    name: 'Heat pump',
    blurb: 'Moves heat rather than making it, for about a third of the electricity.',
    costLowCents: 2_750_000,
    costHighCents: 4_800_000,
    gridDisplaced: 0.63,
    ownEmissionsKgMonth: 0,
    annualSavingCents: 1_160_000,
  },
]

export const flightById = (id: string) => FLIGHTS.find((f) => f.id === id)
export const interventionByKind = (k: string) => INTERVENTIONS.find((i) => i.kind === k)
