export type Tenure = 'owner' | 'tenant'

export type InterventionKind = 'lpg' | 'solar' | 'heatpump'

export interface Intervention {
  kind: InterventionKind
  name: string
  blurb: string
  /** Installed cost in cents, low and high. */
  costLowCents: number
  costHighCents: number
  /** Share of the geyser's grid electricity this removes, 0..1. */
  gridDisplaced: number
  /** Emissions the replacement itself creates, kg CO2e per month. LPG burns. */
  ownEmissionsKgMonth: number
  /** Rand saved on electricity per year, cents. */
  annualSavingCents: number
}

export interface Flight {
  id: string
  from: string
  to: string
  /** Great-circle each way, km. */
  km: number
  /** Typical economy return ticket, cents. */
  ticketCents: number
}

export type EvidenceKind = 'coc' | 'bill-before' | 'bill-after' | 'install-photo' | 'landlord'

export interface EvidenceItem {
  kind: EvidenceKind
  label: string
  detail: string
  /** Null until supplied. */
  suppliedAt: string | null
  required: boolean
}

export interface BillReading {
  /** Month this reading covers, YYYY-MM. */
  month: string
  kwh: number
  /** True for a reading from before the install, used to set the baseline. */
  baseline: boolean
}

export interface Enrolment {
  flightId: string
  intervention: InterventionKind
  tenure: Tenure
  /** ISO date the appliance was installed, or null before that. */
  installedOn: string | null
  evidence: EvidenceItem[]
  readings: BillReading[]
  /** Set once the ticket has been issued. The account then closes. */
  claimedOn: string | null
}
