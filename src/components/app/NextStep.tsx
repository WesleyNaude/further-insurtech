import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Target } from 'lucide-react'
import type { Statement } from '@/lib/domain/engine'
import { MAX_REDUCTION, MIN_EVIDENCE_DAYS, reductionFor } from '@/lib/domain/engine'
import type { Policy } from '@/lib/domain/types'
import { formatRand } from '@/lib/domain/money'

/**
 * The one thing worth doing next.
 *
 * A dashboard that only reports is a dashboard people stop opening. This
 * answers the question the figures provoke: what would actually move it? The
 * answer is always concrete, always a single action, and always priced.
 */
export function NextStep({
  statement,
  policy,
  daysLeft,
}: {
  statement: Statement
  policy: Policy
  daysLeft: number
}) {
  if (!statement.hasEnoughEvidence) {
    return (
      <Card
        title={`${MIN_EVIDENCE_DAYS - statement.measuredDays} more days of measurement`}
        body={`Nothing is paid until ${MIN_EVIDENCE_DAYS} days have been measured. A phone that has not been measuring looks exactly like a car that has not moved, and we will not pay for the difference.`}
      />
    )
  }

  const atCeiling = statement.premiumReduction >= MAX_REDUCTION - 0.001

  if (atCeiling) {
    return (
      <Card
        title="You are at the ceiling"
        body={`Nothing more to gain this month. You are taking back the full ${Math.round(MAX_REDUCTION * 100)}%, ${formatRand(statement.reductionCents)}. Drive as you like for the rest of it.`}
      />
    )
  }

  // What one more car-free day is worth at the margin. A day off the road both
  // avoids the drive and usually adds a return trip by another mode, so the
  // gain is measured against the rated figure the statement itself used.
  const TYPICAL_RETURN_KM = 46

  const here = reductionFor(statement.avoidedKm, statement.ratedKm)
  const next = reductionFor(statement.avoidedKm + TYPICAL_RETURN_KM, statement.ratedKm)
  const gain = Math.max(0, Math.round(policy.basePremiumCents * (next - here)))

  const toCeiling = Math.round(policy.basePremiumCents * (MAX_REDUCTION - here))
  const daysNeeded = gain > 0 ? Math.ceil(toCeiling / gain) : Infinity

  const reachable = Number.isFinite(daysNeeded) && daysNeeded <= daysLeft

  return (
    <Card
      title={`One more day off the road is worth ${formatRand(gain, { decimals: true })}`}
      body={
        reachable
          ? `Leave the car ${daysNeeded} more ${daysNeeded === 1 ? 'day' : 'days'} this month and you hit the ${Math.round(MAX_REDUCTION * 100)}% ceiling, the most this policy allows.`
          : `The ceiling is ${daysNeeded} car-free days away and there are ${daysLeft} left, so it is out of reach this month. Every day still counts.`
      }
    />
  )
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <Link
      to="/plan"
      className="flex items-start gap-3 rounded-[--radius-card] bg-accent-soft p-4 transition-opacity active:opacity-80"
    >
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
        <Target size={17} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-1">
          <span className="text-[15px] font-medium leading-[1.3] text-accent-ink">{title}</span>
          <ArrowUpRight size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-accent-ink/70" />
        </span>
        <span className="mt-1 block text-[13px] leading-[1.5] text-accent-ink/85">{body}</span>
      </span>
    </Link>
  )
}
