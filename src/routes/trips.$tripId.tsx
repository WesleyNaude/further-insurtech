import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, Check, X, PencilLine } from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { RouteFigure } from '@/components/app/RouteFigure'
import { VerificationMark } from '@/components/app/TripRow'
import { ModeIcon, MODE_LABEL } from '@/components/app/icons'
import { Button, Divider, Pill } from '@/components/ui/primitives'
import { useStatement } from '@/lib/useStatement'
import { useStore } from '@/lib/store'
import { corridorById } from '@/lib/domain/corridors'
import { formatRand } from '@/lib/domain/money'
import { CO2_G_PER_KM, DISPLACING_MODES } from '@/lib/domain/engine'
import type { Mode } from '@/lib/domain/types'
import { cx } from '@/lib/cx'

export const Route = createFileRoute('/trips/$tripId')({ component: TripDetail })

function TripDetail() {
  const { tripId } = Route.useParams()
  const navigate = useNavigate()
  const { allTrips, monthTrips, statement } = useStatement()
  const reclassify = useStore((s) => s.reclassify)
  const [editing, setEditing] = React.useState(false)

  const trip = allTrips.find((t) => t.id === tripId)
  if (!trip) {
    return (
      <div className="grid h-full place-items-center gutter">
        <div className="text-center">
          <p className="text-[15px] text-ink-muted">That trip no longer exists.</p>
          <Button className="mt-4" onClick={() => navigate({ to: '/trips' })}>
            Back to trips
          </Button>
        </div>
      </div>
    )
  }

  const corridor = corridorById(trip.corridorId)
  const km = trip.metres / 1000
  const credited = monthTrips.find((t) => t.id === trip.id)?.creditedCents ?? 0
  const counted = DISPLACING_MODES.includes(trip.mode) && trip.verification !== 'unverified'

  const co2Delta = counted ? (km * (CO2_G_PER_KM.car - CO2_G_PER_KM[trip.mode])) / 1000 : 0

  return (
    <main className="w-full bg-paper pb-16">
      {/* map header, full bleed */}
      <div className="relative">
        <RouteFigure
          path={trip.path}
          corridor={corridor?.path}
          className="h-[42dvh] w-full bg-sunken"
          tone={trip.mode === 'car' ? 'car' : 'accent'}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-between px-5">
          <Endpoint label={trip.fromName} />
          <Endpoint label={trip.toName} />
        </div>

        <button
          onClick={() => navigate({ to: '/trips' })}
          aria-label="Back"
          className="safe-top absolute left-4 top-3 grid h-11 w-11 place-items-center rounded-full bg-paper/80 text-ink shadow-[--shadow-card] backdrop-blur-xl"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
      </div>

      {/* sheet over the map */}
      <div className="relative -mt-6 rounded-t-[--radius-sheet] bg-paper pt-6">
        <div className="gutter">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em]">
                {trip.fromName} to {trip.toName}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-[14px] text-ink-muted">
                <ModeIcon mode={trip.mode} size={15} />
                {MODE_LABEL[trip.mode]}
                <span className="text-ink-faint">·</span>
                {new Date(trip.startedAt).toLocaleString('en-ZA', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </p>
            </div>
            {credited > 0 && (
              <span className="tnum shrink-0 text-[22px] font-semibold text-accent">
                +{formatRand(credited, { decimals: true })}
              </span>
            )}
          </div>

          {/* figures */}
          <dl className="mt-6 grid grid-cols-3 gap-3">
            <Figure label="Distance" value={km.toFixed(1)} unit="km" />
            <Figure
              label="Rate applied"
              value={counted ? (statement.centsPerVerifiedKm / 100).toFixed(2) : '0.00'}
              unit="R/km"
            />
            <Figure
              label="CO2 avoided"
              value={co2Delta.toFixed(1)}
              unit="kg"
              muted
            />
          </dl>

          {/* verification */}
          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
              Evidence
            </h2>
            <VerificationMark level={trip.verification} withLabel />
          </div>

          <ul className="mt-3 overflow-hidden rounded-[--radius-card] bg-surface ring-1 ring-line">
            {trip.evidence.map((e, i) => (
              <motion.li
                key={e.kind + i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.07, duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              >
                {i > 0 && <Divider />}
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <span
                    className={cx(
                      'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full',
                      e.passed ? 'bg-accent-soft text-accent-ink' : 'bg-sunken text-ink-faint',
                    )}
                  >
                    {e.passed ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-ink">{e.label}</p>
                    <p className="mt-0.5 text-[13px] leading-[1.5] text-ink-muted">{e.detail}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>

          {trip.verification === 'unverified' && (
            <div className="mt-3 rounded-[--radius-card] bg-warn-soft p-4">
              <p className="text-[13px] leading-[1.55] text-warn">
                This trip did not meet the evidence bar, so it earned nothing and was excluded from
                your statement. Excluding it protects the reduction on trips that did.
              </p>
            </div>
          )}

          {/* reclassify */}
          <div className="mt-6">
            {!editing ? (
              <Button variant="ghost" className="px-0" onClick={() => setEditing(true)}>
                <PencilLine size={16} strokeWidth={1.9} />
                This was a different mode
              </Button>
            ) : (
              <div>
                <p className="mb-2 text-[13px] text-ink-muted">
                  Correcting the mode drops this trip to probable, because we can no longer stand
                  behind the classification ourselves.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(['car', 'train', 'bus', 'taxi', 'walk', 'cycle'] as Mode[])
                    .filter((m) => m !== trip.mode)
                    .map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          reclassify(trip.id, m)
                          setEditing(false)
                          toast.success(`Reclassified as ${MODE_LABEL[m].toLowerCase()}`)
                        }}
                        className="inline-flex items-center gap-2 rounded-[--radius-pill] bg-surface px-3.5 py-2 text-[14px] font-medium ring-1 ring-line"
                      >
                        <ModeIcon mode={m} size={15} />
                        {MODE_LABEL[m]}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {corridor && (
            <p className="mt-8 text-[12px] leading-[1.5] text-ink-faint">
              Matched against the published {corridor.name} alignment. We store the corridor and the
              time band, never a continuous location history.{' '}
              <Pill className="align-middle">Privacy</Pill>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

function Endpoint({ label }: { label: string }) {
  return (
    <span className="rounded-[--radius-pill] bg-paper/85 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur-md">
      {label}
    </span>
  )
}

function Figure({
  label,
  value,
  unit,
  muted,
}: {
  label: string
  value: string
  unit: string
  muted?: boolean
}) {
  return (
    <div className="rounded-[--radius-card] bg-surface px-3 py-3 ring-1 ring-line">
      <dd
        className={cx(
          'tnum text-[20px] font-semibold leading-none tracking-[-0.02em]',
          muted ? 'text-ink-muted' : 'text-ink',
        )}
      >
        {value}
        <span className="ml-0.5 text-[11px] font-medium text-ink-faint">{unit}</span>
      </dd>
      <dt className="mt-1.5 text-[12px] text-ink-faint">{label}</dt>
    </div>
  )
}
