import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import NumberFlow from '@number-flow/react'
import { motion, useReducedMotion } from 'motion/react'
import confetti from 'canvas-confetti'
import { Info, Plane, ArrowUpRight, TriangleAlert, Check } from 'lucide-react'
import { TopBar, Screen, HeroEnd } from '@/components/app/AppShell'
import { Card, Section, Button, Pill } from '@/components/ui/primitives'
import { DerivationSheet, type Step } from '@/components/app/DerivationSheet'
import { useProgress } from '@/lib/flight/useProgress'
import { useFlightStore } from '@/lib/flight/store'
import { formatMass, formatRand } from '@/lib/flight/money'
import { SEATS_COVERED } from '@/lib/flight/engine'
import {
  GRID_KG_PER_KWH,
  GEYSER_KWH_MONTH,
  KG_CO2_PER_PAX_KM,
  NON_CO2_MULTIPLIER,
} from '@/lib/flight/data'
import { confirm as buzz } from '@/lib/haptics'
import { cx } from '@/lib/cx'

export const Route = createFileRoute('/')({ component: ProgressScreen })

const BLOCKED_COPY: Record<string, { title: string; body: string; to: string; cta: string }> = {
  'no-install': {
    title: 'Nothing is counting yet',
    body: 'Tell us the day the appliance was fitted. Nothing before that date can count, because nothing had changed.',
    to: '/evidence',
    cta: 'Add the install date',
  },
  'no-certificate': {
    title: 'The certificate is missing',
    body: 'The Certificate of Compliance is the only proof of what was fitted and when. Without it there is nothing to stand behind.',
    to: '/evidence',
    cta: 'Add the certificate',
  },
  'no-baseline': {
    title: 'No baseline yet',
    body: 'We need bills from before the install. Without them there is nothing to measure the saving against.',
    to: '/evidence',
    cta: 'Add earlier bills',
  },
  'no-reading-after': {
    title: 'Waiting on your first bill',
    body: 'The saving is the difference between your bills, not the brochure figure. Add the first month since the install.',
    to: '/evidence',
    cta: 'Add a reading',
  },
}

function ProgressScreen() {
  const { flight, intervention, footprint, progress, enrolment } = useProgress()
  const claim = useFlightStore((s) => s.claim)
  const [sheet, setSheet] = React.useState(false)
  const reduced = useReducedMotion()

  const claimed = Boolean(enrolment.claimedOn)
  const mass = formatMass(progress.preventedKg)
  const target = formatMass(progress.targetKg)

  // Each seat is half the target, so the bar reads as two seats being covered.
  const seatFraction = (n: number) =>
    Math.min(1, Math.max(0, progress.preventedKg / (progress.targetKg / SEATS_COVERED) - n))

  const steps: Step[] = [
    {
      label: 'Your flight, one way each way',
      value: `${(flight.km * 2).toLocaleString('en-ZA')} km`,
      note: `${flight.from} to ${flight.to} and back, great-circle distance.`,
    },
    {
      label: 'Fuel-burn CO2, one passenger',
      value: `${Math.round(footprint.co2Kg)} kg`,
      note: `At ${KG_CO2_PER_PAX_KM} kg per passenger-kilometre for short-haul economy. Climb burns disproportionately on a short sector.`,
    },
    {
      label: 'All warming, not just CO2',
      value: `×${NON_CO2_MULTIPLIER}`,
      note: 'Contrail cirrus is the largest single part of aviation’s warming, larger than the CO2. Applying it as a flat multiplier is a simplification, and a contested one, because CO2 lasts centuries and contrails hours. We show both figures rather than hide it inside a total.',
    },
    {
      label: 'One passenger, return',
      value: `${Math.round(footprint.totalKg)} kg`,
      note: 'Your own seat.',
    },
    {
      label: 'Your seat and one more',
      value: `${target.value} ${target.unit}`,
      note: 'Breaking even is not a contribution. The bar is deliberately twice your own share, so the flight is earned rather than offset.',
    },
    {
      label: 'What your bills actually show',
      value: `${progress.measuredKgMonth ?? progress.modelledKgMonth} kg a month`,
      note: progress.measuredKgMonth
        ? `Measured from your own readings against your pre-install baseline, at ${GRID_KG_PER_KWH} kg per kWh on the Eskom grid. Not the manufacturer’s claim.`
        : `Modelled from a ${GEYSER_KWH_MONTH} kWh a month geyser until your bills say otherwise.`,
    },
  ]

  React.useEffect(() => {
    if (!progress.earned || claimed) return
    const key = 'further.flight.earned'
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
    buzz()
    if (reduced) return
    confetti({
      particleCount: 80,
      spread: 66,
      startVelocity: 30,
      ticks: 170,
      scalar: 0.85,
      origin: { y: 0.32 },
      colors: ['#0E6B4A', '#3FB98A', '#9A9CA3'],
      disableForReducedMotion: true,
    })
  }, [progress.earned, claimed, reduced])

  return (
    <Screen>
      <TopBar
        title="Further"
        condensed={
          <p className="tnum flex items-baseline gap-2">
            <span className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
              {mass.value} {mass.unit}
            </span>
            <span className="text-[12px] text-ink-faint">of {target.value}</span>
          </p>
        }
        trailing={
          claimed ? (
            <Pill tone="accent">
              <Check size={12} strokeWidth={2.4} />
              Claimed
            </Pill>
          ) : progress.earned ? (
            <Pill tone="accent">Earned</Pill>
          ) : undefined
        }
      />

      {/* ------------------------------------------------------------ hero */}
      <div className="gutter pt-4">
        <button onClick={() => setSheet(true)} className="block w-full text-left">
          <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
            Prevented so far
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="tnum flex items-baseline text-[60px] font-semibold leading-[0.95] tracking-[-0.035em] text-ink">
              <NumberFlow value={Number(mass.value.replace(/[^\d.]/g, ''))} locales="en-GB" />
              <span className="ml-1.5 text-[20px] font-medium text-ink-faint">{mass.unit}</span>
            </span>
            <span className="mb-2.5 inline-flex items-center gap-1 text-[13px] text-ink-faint">
              <Info size={13} strokeWidth={2} />
              How
            </span>
          </div>
          <p className="mt-2 text-[14px] leading-[1.5] text-ink-muted">
            of {target.value} {target.unit} needed for {flight.from} to {flight.to}, return, for
            you <span className="font-medium text-ink">and one more passenger</span>.
          </p>
        </button>

        {/* two seats, drawn as two */}
        <div className="mt-5 flex gap-2">
          {[0, 1].map((n) => (
            <div key={n} className="flex-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-sunken">
                <motion.div
                  initial={reduced ? false : { width: 0 }}
                  animate={{ width: `${seatFraction(n) * 100}%` }}
                  transition={{ duration: reduced ? 0 : 0.9, ease: [0.32, 0.72, 0, 1], delay: n * 0.12 }}
                  className="h-full rounded-full bg-accent"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-ink-faint">
                {n === 0 ? 'Your seat' : 'The other passenger'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <HeroEnd />

      {/* ------------------------------------------------------ what next */}
      {claimed ? (
        <Section title="This intervention is closed">
          <div className="gutter">
            <Card className="flex items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
                <Check size={17} strokeWidth={2.4} />
              </span>
              <div>
                <p className="text-[15px] font-medium">Ticket issued</p>
                <p className="mt-1 text-[13px] leading-[1.55] text-ink-muted">
                  One install, one ticket. The {intervention.name.toLowerCase()} keeps saving for
                  years whether this app exists or not, so we rewarded the decision to fit it, not
                  its continued existence. Fit something else and that is a second install.
                </p>
              </div>
            </Card>
          </div>
        </Section>
      ) : progress.blocked ? (
        <Section title="Next">
          <div className="gutter">
            <Card className="bg-warn-soft ring-warn/20">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-warn">
                  <TriangleAlert size={17} strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[15px] font-medium text-warn">
                    {BLOCKED_COPY[progress.blocked].title}
                  </p>
                  <p className="mt-1 text-[13px] leading-[1.55] text-warn">
                    {BLOCKED_COPY[progress.blocked].body}
                  </p>
                  <Link to={BLOCKED_COPY[progress.blocked].to}>
                    <Button className="mt-3">{BLOCKED_COPY[progress.blocked].cta}</Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </Section>
      ) : progress.earned ? (
        <Section title="Earned">
          <div className="gutter">
            <Card>
              <p className="text-[15px] font-medium">
                You have covered both seats. The ticket is yours.
              </p>
              <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-muted">
                {flight.from} to {flight.to}, return. Typically {formatRand(flight.ticketCents)}.
              </p>
              <Button variant="accent" size="lg" className="mt-4 w-full" onClick={claim}>
                <Plane size={17} strokeWidth={1.9} />
                Claim the ticket
              </Button>
              <p className="mt-2 text-[12px] leading-[1.5] text-ink-faint">
                Claiming closes this intervention. You cannot earn a second flight from the same
                appliance.
              </p>
            </Card>
          </div>
        </Section>
      ) : (
        <Section title="On track">
          <div className="gutter">
            <Link to="/evidence">
              <Card className="flex items-start gap-3 bg-accent-soft ring-0">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
                  <ArrowUpRight size={17} strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium leading-[1.3] text-accent-ink">
                    {progress.monthsRemaining} more {progress.monthsRemaining === 1 ? 'month' : 'months'} of bills
                  </p>
                  <p className="mt-1 text-[13px] leading-[1.5] text-accent-ink/85">
                    At the {progress.measuredKgMonth ?? progress.modelledKgMonth} kg a month your
                    own readings show. Add each bill as it arrives.
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        </Section>
      )}

      {/* ----------------------------------------------------------- facts */}
      <Section title="Where it stands">
        <div className="gutter grid auto-rows-fr grid-cols-3 gap-3">
          <Stat value={String(progress.verifiedMonths)} unit="mo" label="Bills matched" />
          <Stat
            value={String(progress.measuredKgMonth ?? progress.modelledKgMonth)}
            unit="kg/mo"
            label={progress.measuredKgMonth ? 'Measured' : 'Modelled'}
          />
          <Stat
            value={`${Math.round(progress.fraction * 100)}`}
            unit="%"
            label="Of both seats"
          />
        </div>
      </Section>

      <p className="gutter mt-8 text-[12px] leading-[1.55] text-ink-faint">
        This offsets a flight&rsquo;s emissions. It is not a certified carbon credit, and no
        airline or regulator has endorsed this calculation. The non-CO2 multiplier is a
        simplification of contested science, shown separately throughout.
      </p>

      <DerivationSheet
        open={sheet}
        onOpenChange={setSheet}
        title="How this is worked out"
        intro="A flight warms the planet by more than its fuel alone. To earn one, you have to prevent enough warming at home to cover your seat and one more passenger's."
        steps={steps}
        footer={
          <div className="rounded-[--radius-card] bg-sunken p-4">
            <p className="text-[13px] leading-[1.55] text-ink-muted">
              <strong className="font-medium text-ink">What this is not.</strong> Not a carbon
              credit, not certified, not endorsed. The tonnes here are worth about{' '}
              {formatRand(Math.round((progress.targetKg / 1000) * 30800))} at South Africa&rsquo;s
              carbon tax rate, and the ticket is worth {formatRand(flight.ticketCents)}. The
              airline is donating a seat, not buying carbon, and anyone who pitches this as trading
              carbon for tickets has not done the arithmetic.
            </p>
          </div>
        }
      />
    </Screen>
  )
}

function Stat({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div className={cx('flex h-full flex-col justify-between rounded-[--radius-card] bg-surface px-3 py-3 ring-1 ring-line')}>
      <p className="tnum text-[22px] font-semibold leading-none tracking-[-0.02em] text-ink">
        {value}
        <span className="ml-0.5 text-[12px] font-medium text-ink-faint">{unit}</span>
      </p>
      <p className="mt-1.5 text-[12px] leading-[1.3] text-ink-faint">{label}</p>
    </div>
  )
}
