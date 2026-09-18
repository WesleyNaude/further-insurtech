import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import NumberFlow from '@number-flow/react'
import { motion } from 'motion/react'
import { ChevronRight, Info, Flame, CalendarCheck2 } from 'lucide-react'
import { TopBar, Screen } from '@/components/app/AppShell'
import { Card, Section, Pill, Divider } from '@/components/ui/primitives'
import { DerivationSheet } from '@/components/app/DerivationSheet'
import { TripRow } from '@/components/app/TripRow'
import { useStatement } from '@/lib/useStatement'
import { useStore } from '@/lib/store'
import { formatRand } from '@/lib/domain/money'
import { MAX_REDUCTION } from '@/lib/domain/engine'
import { corridorById } from '@/lib/domain/corridors'
import { MODE_LABEL } from '@/components/app/icons'

export const Route = createFileRoute('/')({ component: Today })

function Today() {
  const { statement, policy, monthTrips, streak } = useStatement()
  const commitments = useStore((s) => s.commitments)
  const [sheet, setSheet] = React.useState(false)

  const openCommitment = commitments.find((c) => c.status === 'open')
  const recent = monthTrips.slice(0, 4)
  const progress = Math.min(1, statement.premiumReduction / MAX_REDUCTION)

  const monthName = new Date().toLocaleDateString('en-ZA', { month: 'long' })

  return (
    <Screen>
      <TopBar
        title="Further"
        trailing={
          streak > 0 ? (
            <Pill tone="accent">
              <Flame size={12} strokeWidth={2.2} />
              {streak} day{streak === 1 ? '' : 's'}
            </Pill>
          ) : undefined
        }
      />

      {/* ------------------------------------------------------------ hero */}
      <div className="gutter pb-2 pt-4">
        <button onClick={() => setSheet(true)} className="block w-full text-left">
          <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
            Off your {monthName} premium
          </p>

          <div className="mt-2 flex items-end gap-2">
            <span className="tnum text-[56px] font-semibold leading-[1] tracking-[-0.03em] text-ink">
              <NumberFlow
                value={statement.reductionCents / 100}
                format={{ style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }}
                locales="en-ZA"
              />
            </span>
            <span className="mb-2 inline-flex items-center gap-1 text-[13px] text-ink-faint">
              <Info size={13} strokeWidth={2} />
              How
            </span>
          </div>

          <p className="mt-2 text-[14px] leading-[1.5] text-ink-muted">
            {formatRand(policy.basePremiumCents)} becomes{' '}
            <span className="font-medium text-ink">
              {formatRand(policy.basePremiumCents - statement.reductionCents)}
            </span>{' '}
            on your next debit order.
          </p>
        </button>

        {/* progress to the ceiling */}
        <div className="mt-5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-sunken">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
              className="h-full rounded-full bg-accent"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[12px] text-ink-faint">
            <span className="tnum">{Math.round(statement.premiumReduction * 100)}% reduction</span>
            <span className="tnum">{Math.round(MAX_REDUCTION * 100)}% ceiling</span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- stats */}
      <div className="gutter mt-6 grid grid-cols-3 gap-3">
        <Stat
          value={Math.round(statement.avoidedKm).toLocaleString('en-ZA')}
          unit="km"
          label="Under your rating"
        />
        <Stat
          value={Math.round(statement.displacedKm).toLocaleString('en-ZA')}
          unit="km"
          label="Not driven"
        />
        <Stat
          value={
            statement.centsPerVerifiedKm > 0
              ? `${(statement.centsPerVerifiedKm / 100).toFixed(2)}`
              : '0.00'
          }
          unit="R/km"
          label="Worth to you"
        />
      </div>

      {/* ------------------------------------------------------ commitment */}
      {openCommitment && (
        <Section title="Planned">
          <div className="gutter">
            <Card className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunken text-ink-muted">
                <CalendarCheck2 size={18} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">
                  {corridorById(openCommitment.corridorId)?.fromName} to{' '}
                  {corridorById(openCommitment.corridorId)?.toName}
                </p>
                <p className="mt-0.5 text-[13px] text-ink-muted">
                  {MODE_LABEL[openCommitment.mode]} ·{' '}
                  {new Date(openCommitment.departAt).toLocaleString('en-ZA', {
                    weekday: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </p>
              </div>
              <Link to="/plan" className="shrink-0 text-ink-faint">
                <ChevronRight size={18} strokeWidth={2} />
              </Link>
            </Card>
          </div>
        </Section>
      )}

      {/* ---------------------------------------------------------- recent */}
      <Section
        title="Recent"
        action={
          <Link to="/trips" className="text-[13px] font-medium text-ink-muted">
            All trips
          </Link>
        }
      >
        <div className="bg-surface ring-1 ring-line">
          {recent.map((t, i) => (
            <React.Fragment key={t.id}>
              {i > 0 && <Divider className="ml-[68px]" />}
              <TripRow trip={t} />
            </React.Fragment>
          ))}
        </div>
      </Section>

      <p className="gutter mt-6 text-[12px] leading-[1.5] text-ink-faint">
        Figures update as trips are verified. Nothing here offsets emissions or constitutes a
        carbon credit.
      </p>

      <DerivationSheet open={sheet} onOpenChange={setSheet} statement={statement} />
    </Screen>
  )
}

function Stat({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div className="rounded-[--radius-card] bg-surface px-3 py-3 ring-1 ring-line">
      <p className="tnum text-[22px] font-semibold leading-none tracking-[-0.02em] text-ink">
        {value}
        <span className="ml-0.5 text-[12px] font-medium text-ink-faint">{unit}</span>
      </p>
      <p className="mt-1.5 text-[12px] leading-[1.3] text-ink-faint">{label}</p>
    </div>
  )
}
