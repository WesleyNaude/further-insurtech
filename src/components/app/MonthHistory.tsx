import * as React from 'react'
import { motion } from 'motion/react'
import { buildStatement } from '@/lib/domain/engine'
import type { Trip, Policy } from '@/lib/domain/types'
import { formatRand } from '@/lib/domain/money'
import { cx } from '@/lib/cx'

/**
 * Month-on-month statements.
 *
 * Each one is rebuilt from that month's trips by the same engine, rather than
 * stored, so a change to the policy or the constants re-derives history too. A
 * figure you cannot recompute is a figure nobody should trust.
 */
export interface MonthRow {
  label: string
  cents: number
  pct: number
  current: boolean
}

/** Rebuilds each month's statement from its own trips, using the same engine. */
export function monthlyStatements(
  trips: Trip[],
  policy: Policy,
  months: number,
  now = new Date(),
): MonthRow[] {
  const out: MonthRow[] = []

  for (let back = 0; back < months; back++) {
    const anchor = new Date(now.getFullYear(), now.getMonth() - back, 1)
    const next = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1)
    const inMonth = trips.filter((t) => {
      const d = new Date(t.startedAt)
      return d >= anchor && d < next
    })
    if (!inMonth.length) continue

    const current = back === 0
    // The current month is only part-elapsed, so rate it pro rata.
    const fraction = current
      ? (now.getTime() - anchor.getTime()) / (next.getTime() - anchor.getTime())
      : 1

    const s = buildStatement(inMonth, policy, fraction)
    out.push({
      label: anchor.toLocaleDateString('en-ZA', { month: 'long' }),
      cents: s.reductionCents,
      pct: s.premiumReduction,
      current,
    })
  }
  return out
}

export function MonthHistory({
  trips,
  policy,
  months = 5,
}: {
  trips: Trip[]
  policy: Policy
  months?: number
}) {
  const rows = React.useMemo(
    () => monthlyStatements(trips, policy, months),
    [trips, policy, months],
  )

  const peak = Math.max(1, ...rows.map((r) => r.cents))

  return (
    <div className="overflow-hidden rounded-[--radius-card] bg-surface ring-1 ring-line">
      {rows.map((r, i) => (
        <div
          key={r.label}
          className={cx('relative px-4 py-3', i > 0 && 'border-t border-line')}
        >
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: `${(r.cents / peak) * 100}%` }}
            transition={{ delay: i * 0.05, duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-y-0 left-0 bg-accent/10"
            aria-hidden
          />
          <div className="relative flex items-baseline justify-between gap-3">
            <span className="text-[14px] font-medium text-ink">
              {r.label}
              {r.current && (
                <span className="ml-2 text-[12px] font-normal text-ink-faint">so far</span>
              )}
            </span>
            <span className="flex items-baseline gap-2">
              <span className="tnum text-[12px] text-ink-faint">
                {Math.round(r.pct * 100)}%
              </span>
              <span className="tnum text-[15px] font-semibold text-accent">
                {formatRand(r.cents)}
              </span>
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
