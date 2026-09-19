export type Mode = 'tram' | 'bus' | 'train'

/** How the money leaves the wallet when she decides. */
export type Payout = 'save' | 'cash'

export interface Tap {
  id: string
  /** ISO timestamp of the validation, from the operator. */
  at: string
  mode: Mode
  line: string
  /** Where she boarded, as the operator names the stop. */
  stop: string
  /** The fare that would have been charged, in grosz. */
  fareGr: number
  /** What came back, in grosz. */
  backGr: number
  /** Morning or evening leg, used to spot a one-way pattern. */
  leg: 'am' | 'pm' | 'other'
}

export interface Goal {
  id: string
  label: string
  /** Target in grosz. */
  targetGr: number
  /** Date it is needed by. */
  dueOn: string
}

export type EligibilityState = 'unknown' | 'checking' | 'approved' | 'declined'

export interface Household {
  name: string
  city: string
  /** Adults plus children in the household. */
  people: number
  eligibility: EligibilityState
  /** ISO date the household was approved. Null until then. */
  approvedOn: string | null
  /** The reference the city issued. She never needs it, but it reassures. */
  reference: string | null
}
