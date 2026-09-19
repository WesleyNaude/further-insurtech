import { createFileRoute } from '@tanstack/react-router'
import { Plane, Check } from 'lucide-react'
import { TopBar, Screen } from '@/components/app/AppShell'
import { Card, Section, Divider } from '@/components/ui/primitives'
import { useProgress } from '@/lib/flight/useProgress'
import { useFlightStore } from '@/lib/flight/store'
import { FLIGHTS, KG_CO2_PER_PAX_KM, NON_CO2_MULTIPLIER } from '@/lib/flight/data'
import { footprintFor, SEATS_COVERED } from '@/lib/flight/engine'
import { formatRand, formatMass } from '@/lib/flight/money'
import { tap } from '@/lib/haptics'
import { cx } from '@/lib/cx'

export const Route = createFileRoute('/flight')({ component: FlightScreen })

function FlightScreen() {
  const { flight, footprint, enrolment } = useProgress()
  const chooseFlight = useFlightStore((s) => s.chooseFlight)
  const locked = Boolean(enrolment.claimedOn)

  return (
    <Screen>
      <TopBar title="Your flight" />

      <div className="gutter pt-2">
        <p className="text-[14px] leading-[1.55] text-ink-muted">
          Flying warms the planet by more than the fuel suggests. Planes leave contrails, and
          those trap heat. So the target is the whole warming effect, for two seats.
        </p>
      </div>

      {/* the maths, in the open */}
      <Section title="What you must prevent">
        <div className="gutter">
          <Card inset={false} className="overflow-hidden">
            <div className="px-5 py-1">
              <Row
                label="Fuel-burn CO2, one passenger"
                value={`${Math.round(footprint.co2Kg)} kg`}
              />
              <Divider />
              <Row
                label="Contrails and the rest"
                value={`×${NON_CO2_MULTIPLIER}`}
                muted
              />
              <Divider />
              <Row
                label="All warming, one passenger"
                value={`${Math.round(footprint.totalKg)} kg`}
              />
              <Divider />
              <Row label="Seats covered" value={`${SEATS_COVERED}`} muted />
            </div>
            <div className="bg-accent-soft px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[14px] font-medium text-accent-ink">Your target</span>
                <span className="tnum text-[22px] font-semibold text-accent-ink">
                  {formatMass(footprint.targetKg).value} {formatMass(footprint.targetKg).unit}
                </span>
              </div>
            </div>
          </Card>

          <p className="mt-3 text-[12px] leading-[1.55] text-ink-faint">
            {KG_CO2_PER_PAX_KM} kg per passenger-kilometre for short-haul economy. The ×
            {NON_CO2_MULTIPLIER} covers contrail cirrus and other non-CO2 forcing, which is
            larger than the CO2 itself. Applying it as a flat multiplier is a simplification, and
            a contested one: CO2 lasts centuries, contrails hours. Both figures are shown so the
            multiplier is never buried.
          </p>
        </div>
      </Section>

      <Section title="Why two seats">
        <div className="gutter">
          <div className="rounded-[--radius-card] bg-sunken p-4">
            <p className="text-[13px] leading-[1.6] text-ink-muted">
              Covering your own flight only breaks even, and breaking even is not a contribution.
              Covering a second passenger means the air is cleaner than if you had stayed home.
              That is the only version of this an airline can say something true about.
            </p>
          </div>
        </div>
      </Section>

      <Section title={locked ? 'Your route' : 'Choose your route'}>
        <div className="gutter space-y-2">
          {FLIGHTS.map((f) => {
            const fp = footprintFor(f)
            const active = f.id === flight.id
            return (
              <button
                key={f.id}
                disabled={locked}
                onClick={() => {
                  chooseFlight(f.id)
                  tap()
                }}
                className={cx(
                  'flex w-full items-center gap-3 rounded-[--radius-card] px-4 py-3.5 text-left ring-1 transition-colors',
                  active ? 'bg-surface ring-ink' : 'bg-surface ring-line active:bg-sunken',
                  locked && 'opacity-60',
                )}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunken text-ink-muted">
                  <Plane size={17} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium">
                    {f.from} to {f.to}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-ink-muted">
                    {formatMass(fp.targetKg).value} {formatMass(fp.targetKg).unit} for two seats ·
                    ticket about {formatRand(f.ticketCents)}
                  </span>
                </span>
                {active && <Check size={18} strokeWidth={2.2} className="shrink-0 text-ink" />}
              </button>
            )
          })}
        </div>
        {locked && (
          <p className="gutter mt-3 text-[12px] text-ink-faint">
            Locked: the ticket for this intervention has been claimed.
          </p>
        )}
      </Section>
    </Screen>
  )
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <span className="text-[14px] text-ink-muted">{label}</span>
      <span
        className={cx(
          'tnum text-[15px] font-medium',
          muted ? 'text-ink-muted' : 'text-ink',
        )}
      >
        {value}
      </span>
    </div>
  )
}
