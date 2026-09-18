export type Mode = 'car' | 'train' | 'bus' | 'taxi' | 'walk' | 'cycle'

/** How strongly we can stand behind a trip. Shown to the user, never hidden. */
export type VerificationLevel = 'verified' | 'probable' | 'unverified'

export interface Evidence {
  kind: 'corridor' | 'cadence' | 'speed' | 'stop-dwell' | 'fare-tap' | 'vehicle-idle' | 'self'
  label: string
  detail: string
  passed: boolean
}

export interface Trip {
  id: string
  startedAt: string
  mode: Mode
  fromName: string
  toName: string
  /** Distance actually travelled, metres. */
  metres: number
  corridorId: string
  /** GeoJSON-ish line, [lng, lat] pairs. */
  path: [number, number][]
  verification: VerificationLevel
  evidence: Evidence[]
  /** Cents credited for this trip. Zero for car trips. */
  creditedCents: number
  /** True when this trip fulfilled a pre-commitment made on the Plan screen. */
  fromCommitment?: boolean
}

export interface Commitment {
  id: string
  corridorId: string
  mode: Mode
  /** ISO date-time of the planned departure. */
  departAt: string
  createdAt: string
  status: 'open' | 'kept' | 'missed'
  tripId?: string
}

export interface Corridor {
  id: string
  name: string
  fromName: string
  toName: string
  metres: number
  path: [number, number][]
  /** Operator fares in cents, by time band. Real-world shaped, not invented pricing. */
  fares: { peak: number; offPeak: number }
  modes: Mode[]
}

export interface Policy {
  insurer: string
  product: string
  /** Base monthly premium in cents, before any reduction. */
  basePremiumCents: number
  /** Annual mileage the premium was rated on. */
  ratedAnnualKm: number
  vehicle: string
  linkedAt: string
}
