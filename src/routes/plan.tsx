import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, TrendingDown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { confirm as buzzConfirm } from '@/lib/haptics'
import { TopBar } from '@/components/app/AppShell'
import { Card, Button, Pill, Divider } from '@/components/ui/primitives'
import { CORRIDORS, corridorById } from '@/lib/domain/corridors'
import { formatRand } from '@/lib/domain/money'
import { useStore } from '@/lib/store'
import { useStatement } from '@/lib/useStatement'
import { ModeIcon, MODE_LABEL } from '@/components/app/icons'
import type { Mode } from '@/lib/domain/types'
import { cx } from '@/lib/cx'

export const Route = createFileRoute('/plan')({ component: PlanScreen })

/** Petrol plus running cost for a small hatch, cents per km. Sourced figure, shown. */
const DRIVING_COST_C_PER_KM = 285

const SLOTS = [
  { at: '06:40', band: 'peak' as const },
  { at: '07:20', band: 'peak' as const },
  { at: '09:40', band: 'offPeak' as const },
  { at: '10:20', band: 'offPeak' as const },
  { at: '13:10', band: 'offPeak' as const },
  { at: '16:50', band: 'peak' as const },
  { at: '19:30', band: 'offPeak' as const },
]

function PlanScreen() {
  const navigate = useNavigate()
  const commit = useStore((s) => s.commit)
  const cancelCommitment = useStore((s) => s.cancelCommitment)
  const commitments = useStore((s) => s.commitments)
  const { statement } = useStatement()

  const [corridorId, setCorridorId] = React.useState(CORRIDORS[1].id)
  const corridor = corridorById(corridorId)!
  const [mode, setMode] = React.useState<Mode>(corridor.modes[0])
  const [slot, setSlot] = React.useState(SLOTS[2])

  React.useEffect(() => {
    if (!corridor.modes.includes(mode)) setMode(corridor.modes[0])
  }, [corridorId]) // eslint-disable-line react-hooks/exhaustive-deps

  const km = corridor.metres / 1000
  const fare = corridor.fares[slot.band]
  const drivingCost = Math.round(km * DRIVING_COST_C_PER_KM)
  const earn = Math.round(km * statement.centsPerVerifiedKm)
  const net = drivingCost - fare + earn

  function makeCommitment() {
    const [h, m] = slot.at.split(':').map(Number)
    const when = new Date()
    when.setDate(when.getDate() + 1)
    when.setHours(h, m, 0, 0)
    commit({ corridorId, mode, departAt: when.toISOString() })
    buzzConfirm()
    toast.success('Committed', { description: 'We will look for this trip tomorrow.' })
    navigate({ to: '/' })
  }

  return (
    <main className="mx-auto w-full max-w-md pb-10">
      <TopBar
        title="Plan a trip"
        leading={
          <button
            onClick={() => navigate({ to: '/' })}
            aria-label="Back"
            className="-ml-2 grid h-11 w-11 place-items-center rounded-full text-ink"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
        }
      />

      <div className="gutter pt-2">
        <p className="text-[14px] leading-[1.55] text-ink-muted">
          We do not sell tickets and we do not set fares. This shows the operator&rsquo;s own
          off-peak price next to what driving the same trip costs you, and holds you to the plan.
        </p>
      </div>

      {/* corridor */}
      <div className="gutter mt-6">
        <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
          Route
        </p>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {CORRIDORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCorridorId(c.id)}
              className={cx(
                'tap tap-wide shrink-0 rounded-[--radius-pill] px-3.5 py-2 text-[13px] font-medium ring-1 transition-colors',
                corridorId === c.id
                  ? 'bg-ink text-paper ring-ink'
                  : 'bg-surface text-ink-muted ring-line',
              )}
            >
              {c.fromName}
            </button>
          ))}
        </div>
      </div>

      {/* mode */}
      <div className="gutter mt-6">
        <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
          Mode
        </p>
        <div className="flex flex-wrap gap-2">
          {corridor.modes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cx(
                'tap tap-wide inline-flex items-center gap-2 rounded-[--radius-pill] px-3.5 py-2 text-[13px] font-medium ring-1 transition-colors',
                mode === m ? 'bg-ink text-paper ring-ink' : 'bg-surface text-ink ring-line',
              )}
            >
              <ModeIcon mode={m} size={15} />
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>
      </div>

      {/* departure */}
      <div className="gutter mt-6">
        <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
          Departure tomorrow
        </p>
        <div className="grid grid-cols-4 gap-2">
          {SLOTS.map((s) => (
            <button
              key={s.at}
              onClick={() => setSlot(s)}
              className={cx(
                'rounded-[12px] py-2.5 text-center ring-1 transition-colors',
                slot.at === s.at ? 'bg-ink text-paper ring-ink' : 'bg-surface ring-line',
              )}
            >
              <span className="tnum block text-[14px] font-medium">{s.at}</span>
              <span
                className={cx(
                  'mt-0.5 block text-[10px]',
                  slot.at === s.at
                    ? 'text-paper/70'
                    : s.band === 'offPeak'
                      ? 'text-accent'
                      : 'text-ink-faint',
                )}
              >
                {s.band === 'offPeak' ? 'off-peak' : 'peak'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* the maths */}
      <div className="gutter mt-6">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-ink-muted">Driving it yourself</span>
            <span className="tnum text-[15px] text-ink">{formatRand(drivingCost, { decimals: true })}</span>
          </div>
          <Divider className="my-3" />
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-ink-muted">
              {corridor.name} fare
              {slot.band === 'offPeak' && (
                <Pill tone="accent" className="ml-2">
                  <TrendingDown size={11} strokeWidth={2.2} />
                  off-peak
                </Pill>
              )}
            </span>
            <span className="tnum text-[15px] text-ink">{formatRand(fare, { decimals: true })}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[14px] text-ink-muted">You earn back</span>
            <span className="tnum text-[15px] text-accent">
              +{formatRand(earn, { decimals: true })}
            </span>
          </div>
          <Divider className="my-3" />
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-medium">Better off by</span>
            <span className="tnum text-[22px] font-semibold text-accent">
              {formatRand(net, { decimals: true })}
            </span>
          </div>
          <p className="mt-3 text-[12px] leading-[1.5] text-ink-faint">
            Driving cost uses {(DRIVING_COST_C_PER_KM / 100).toFixed(2)} R/km for fuel, tyres and
            servicing on your {useStore.getState().policy.vehicle}. Fares are the operator&rsquo;s
            published prices.
          </p>
        </Card>

        <Button variant="accent" size="lg" className="mt-4 w-full" onClick={makeCommitment}>
          Commit to this trip
        </Button>
        <p className="mt-2 text-center text-[12px] text-ink-faint">
          Committing does not buy a ticket. It tells us to look for this trip.
        </p>
      </div>

      {/* open commitments */}
      {commitments.length > 0 && (
        <div className="gutter mt-8">
          <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
            Open commitments
          </p>
          <div className="overflow-hidden rounded-[--radius-card] bg-surface ring-1 ring-line">
            {commitments.map((c, i) => (
              <React.Fragment key={c.id}>
                {i > 0 && <Divider />}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-accent-ink">
                    <Check size={15} strokeWidth={2.4} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">
                      {corridorById(c.corridorId)?.fromName} to {corridorById(c.corridorId)?.toName}
                    </p>
                    <p className="text-[12px] text-ink-faint">
                      {new Date(c.departAt).toLocaleString('en-ZA', {
                        weekday: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      cancelCommitment(c.id)
                      toast('Commitment cancelled')
                    }}
                    className="tap tap-wide text-[13px] text-ink-muted"
                  >
                    Cancel
                  </button>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
