import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Check, X, Plus, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { TopBar, Screen } from '@/components/app/AppShell'
import { Card, Section, Button, Divider, Pill } from '@/components/ui/primitives'
import { BarChart } from '@/components/app/BarChart'
import { useProgress } from '@/lib/flight/useProgress'
import { useFlightStore } from '@/lib/flight/store'
import { baselineKwh } from '@/lib/flight/engine'
import { GRID_KG_PER_KWH } from '@/lib/flight/data'
import { tap, confirm as buzz } from '@/lib/haptics'
import { cx } from '@/lib/cx'

export const Route = createFileRoute('/evidence')({ component: EvidenceScreen })

function EvidenceScreen() {
  const { enrolment, progress, intervention } = useProgress()
  const supply = useFlightStore((s) => s.supplyEvidence)
  const markInstalled = useFlightStore((s) => s.markInstalled)
  const addReading = useFlightStore((s) => s.addReading)

  const baseline = baselineKwh(enrolment.readings)
  const after = enrolment.readings.filter((r) => !r.baseline)
  const locked = Boolean(enrolment.claimedOn)

  const chart = React.useMemo(
    () =>
      enrolment.readings.map((r) => ({
        label: r.month.slice(5),
        values: { kwh: r.kwh },
      })),
    [enrolment.readings],
  )

  function addNextMonth() {
    const last = after.at(-1)
    const base = last ? new Date(`${last.month}-01T00:00:00`) : new Date()
    base.setMonth(base.getMonth() + 1)
    const month = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}`
    // A plausible reading for the fitted appliance, not a perfect one.
    const kwh = Math.round((baseline ?? 350) * (1 - intervention.gridDisplaced) * (0.92 + Math.random() * 0.18))
    addReading({ month, kwh, baseline: false })
    buzz()
    toast.success(`${month} added`, { description: `${kwh} kWh, against a ${baseline} kWh baseline.` })
  }

  return (
    <Screen>
      <TopBar
        title="Evidence"
        trailing={
          progress.blocked ? (
            <Pill tone="warn">Incomplete</Pill>
          ) : (
            <Pill tone="accent">
              <Check size={12} strokeWidth={2.4} />
              Counting
            </Pill>
          )
        }
      />

      <div className="gutter pt-2">
        <p className="text-[14px] leading-[1.55] text-ink-muted">
          The saving is the difference between your own bills, not the figure on the box. That is
          the only version of this an airline could stand behind.
        </p>
      </div>

      {/* install date */}
      <Section title="The install">
        <div className="gutter">
          <Card className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunken text-ink-muted">
              <CalendarDays size={18} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium">
                {enrolment.installedOn
                  ? new Date(enrolment.installedOn).toLocaleDateString('en-ZA', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Not recorded'}
              </p>
              <p className="mt-0.5 text-[13px] text-ink-muted">
                Nothing before this date can count.
              </p>
            </div>
            {!enrolment.installedOn && !locked && (
              <Button
                onClick={() => {
                  const d = new Date()
                  d.setMonth(d.getMonth() - 1)
                  markInstalled(d.toISOString())
                  tap()
                  toast.success('Install date recorded')
                }}
              >
                Set
              </Button>
            )}
          </Card>
        </div>
      </Section>

      {/* the checklist */}
      <Section title="What has to be proved">
        <div className="gutter">
          <Card inset={false} className="overflow-hidden">
            {enrolment.evidence.map((e, i) => {
              const done = Boolean(e.suppliedAt)
              return (
                <React.Fragment key={e.kind}>
                  {i > 0 && <Divider />}
                  <div className="flex items-start gap-3 px-4 py-3.5">
                    <span
                      className={cx(
                        'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full',
                        done
                          ? 'bg-accent-soft text-accent-ink'
                          : e.required
                            ? 'bg-warn-soft text-warn'
                            : 'bg-sunken text-ink-faint',
                      )}
                    >
                      {done ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-[14px] font-medium text-ink">
                        {e.label}
                        {!e.required && <Pill>optional</Pill>}
                      </p>
                      <p className="mt-0.5 text-[13px] leading-[1.5] text-ink-muted">{e.detail}</p>
                    </div>
                    {!done && !locked && (
                      <Button
                        className="shrink-0"
                        onClick={() => {
                          supply(e.kind)
                          tap()
                          toast.success(`${e.label} added`)
                        }}
                      >
                        <Plus size={15} strokeWidth={2} />
                        Add
                      </Button>
                    )}
                  </div>
                </React.Fragment>
              )
            })}
          </Card>
          <p className="mt-2 text-[12px] leading-[1.5] text-ink-faint">
            In a real build these are uploads. Here they are marked supplied so the flow can be
            walked end to end.
          </p>
        </div>
      </Section>

      {/* the readings */}
      <Section
        title="Your meter"
        action={
          !locked && baseline !== null ? (
            <button onClick={addNextMonth} className="tap tap-wide text-[13px] font-medium text-ink-muted">
              Add a month
            </button>
          ) : undefined
        }
      >
        <div className="gutter">
          {enrolment.readings.length > 0 ? (
            <Card>
              <BarChart
                data={chart}
                series={[{ key: 'kwh', label: 'kWh billed', colour: 'var(--color-accent)' }]}
                unit="kWh"
                height={170}
              />
              {baseline !== null && (
                <>
                  <Divider className="my-3" />
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] text-ink-muted">Baseline, before the install</span>
                    <span className="tnum text-[14px] font-medium">{baseline} kWh</span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-[13px] text-ink-muted">Average since</span>
                    <span className="tnum text-[14px] font-medium">
                      {after.length
                        ? Math.round(after.reduce((a, r) => a + r.kwh, 0) / after.length)
                        : '—'}{' '}
                      kWh
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-[13px] text-ink-muted">
                      Prevented, at {GRID_KG_PER_KWH} kg per kWh
                    </span>
                    <span className="tnum text-[14px] font-semibold text-accent">
                      {progress.preventedKg} kg
                    </span>
                  </div>
                </>
              )}
            </Card>
          ) : (
            <Card>
              <p className="text-[14px] text-ink-muted">
                No readings yet. Three months from before the install set the baseline.
              </p>
            </Card>
          )}
        </div>
      </Section>
    </Screen>
  )
}
