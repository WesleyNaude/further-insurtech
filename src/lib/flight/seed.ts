import type { Enrolment, EvidenceItem, BillReading, Tenure } from './types'
import { GEYSER_KWH_MONTH } from './data'

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

export function evidenceFor(tenure: Tenure): EvidenceItem[] {
  const base: EvidenceItem[] = [
    {
      kind: 'coc',
      label: 'Certificate of Compliance',
      detail: 'Issued by the installer. It is the only proof of what was fitted and when.',
      suppliedAt: null,
      required: true,
    },
    {
      kind: 'bill-before',
      label: 'Bills from before',
      detail: 'Three months of readings set the baseline every later month is measured against.',
      suppliedAt: null,
      required: true,
    },
    {
      kind: 'bill-after',
      label: 'Bills since',
      detail: 'One reading a month. The saving is the difference, not the brochure figure.',
      suppliedAt: null,
      required: true,
    },
    {
      kind: 'install-photo',
      label: 'Photo of the unit',
      detail: 'Serial number visible. Stops one installation being claimed twice.',
      suppliedAt: null,
      required: false,
    },
  ]

  if (tenure === 'tenant') {
    base.push({
      kind: 'landlord',
      label: 'Landlord agreement',
      detail:
        'The owner installs and keeps the electricity saving. You earn the ticket. Both signatures.',
      suppliedAt: null,
      required: true,
    })
  }
  return base
}

/**
 * A demo part-way through: installed five months ago, certificate in, baseline
 * set, and five monthly readings since. Deterministic so the demo is identical
 * every time.
 */
export function seedEnrolment(now = new Date()): Enrolment {
  const installed = new Date(now.getFullYear(), now.getMonth() - 5, 12)
  const supplied = new Date(now.getFullYear(), now.getMonth() - 5, 14).toISOString()

  const readings: BillReading[] = []
  for (let i = 8; i >= 6; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    readings.push({ month: monthKey(d), kwh: GEYSER_KWH_MONTH + (i - 7) * 18, baseline: true })
  }
  // After the install: a heat pump leaves roughly a third of the load, with the
  // usual monthly wobble from weather and household size.
  const wobble = [0.36, 0.33, 0.39, 0.34, 0.31]
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    readings.push({
      month: monthKey(d),
      kwh: Math.round(GEYSER_KWH_MONTH * wobble[4 - i]),
      baseline: false,
    })
  }

  const evidence = evidenceFor('owner').map((e) =>
    e.kind === 'install-photo' ? e : { ...e, suppliedAt: supplied },
  )

  return {
    flightId: 'jnb-hre',
    intervention: 'heatpump',
    tenure: 'owner',
    installedOn: installed.toISOString(),
    evidence,
    readings,
    claimedOn: null,
  }
}
