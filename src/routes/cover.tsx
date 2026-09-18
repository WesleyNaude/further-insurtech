import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import NumberFlow from '@number-flow/react'
import { ChevronLeft, ShieldCheck, TriangleAlert } from 'lucide-react'
import { TopBar } from '@/components/app/AppShell'
import { Card, Button, Divider, Pill } from '@/components/ui/primitives'
import { useStatement, monthFraction } from '@/lib/useStatement'
import { formatRand } from '@/lib/domain/money'
import { cx } from '@/lib/cx'

export const Route = createFileRoute('/cover')({ component: CoverScreen })

/**
 * The growth loop, and the reason this is a South African product.
 *
 * 65% of vehicles here are uninsured, and the reason people give is
 * affordability. A great many of those drivers are low-exposure: a car used at
 * weekends while the week is spent in a taxi. They are quoted as though they
 * commute daily because no insurer can cheaply verify otherwise before there is
 * a policy.
 *
 * This screen prices the member's *measured* travel, not an assumption about
 * them. It is deliberately an indication, not a quotation: quoting would make
 * us an FSP, which is a licence and not a footnote.
 */

/** Market benchmark for comprehensive cover on a small hatch, cents per month. */
const MARKET_LOW = 80_000
const MARKET_HIGH = 140_000

/** How much of a standard premium is exposure-sensitive, mirrored from the engine. */
const EXPOSURE_SENSITIVE = 0.55

function CoverScreen() {
  const navigate = useNavigate()
  const { statement, monthTrips } = useStatement()

  // Driven kilometres are month-to-date. Annualising them as though the month
  // were complete would halve the estimate mid-month and flatter the member.
  const elapsed = Math.max(0.15, monthFraction())
  const measuredAnnualKm = Math.round((statement.drivenKm / elapsed) * 12)
  const marketMid = (MARKET_LOW + MARKET_HIGH) / 2

  // A national-average driver does roughly 20,000 km a year. Price the gap.
  const BASELINE_KM = 20_000
  const ratio = Math.min(1, measuredAnnualKm / BASELINE_KM)
  const indicative = Math.round(marketMid * (1 - EXPOSURE_SENSITIVE * (1 - ratio)))

  const verified = monthTrips.filter((t) => t.verification === 'verified').length
  const enough = verified >= 8 && statement.hasEnoughEvidence

  return (
    <main className="mx-auto w-full max-w-md pb-10">
      <TopBar
        title="What cover could cost"
        leading={
          <button
            onClick={() => navigate({ to: '/settings' })}
            aria-label="Back"
            className="-ml-2 grid h-11 w-11 place-items-center rounded-full text-ink"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
        }
      />

      <div className="gutter pt-2">
        <p className="text-[14px] leading-[1.55] text-ink-muted">
          Roughly two thirds of South African vehicles are uninsured, and the reason people give
          is cost. Many of those drivers barely drive. Nobody prices them for it, because nobody
          can check.
        </p>
      </div>

      <div className="gutter mt-6">
        <Card>
          <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
            Priced on your measured travel
          </p>

          <p className="tnum mt-3 flex items-baseline text-[46px] font-semibold leading-[0.95] tracking-[-0.035em]">
            <span className="mr-0.5 text-[26px] font-medium tracking-[-0.02em] text-ink-muted">R</span>
            <NumberFlow value={Math.round(indicative / 100)} locales="en-ZA" />
            <span className="ml-1.5 text-[15px] font-medium text-ink-faint">a month</span>
          </p>

          <div className="mt-5">
            <div className="relative h-2 w-full rounded-full bg-sunken">
              <span
                className="absolute inset-y-0 rounded-full bg-line-strong"
                style={{ left: '0%', right: '0%' }}
              />
              <motion.span
                initial={{ left: '50%' }}
                animate={{
                  left: `${Math.max(0, Math.min(96, ((indicative - MARKET_LOW) / (MARKET_HIGH - MARKET_LOW)) * 100))}%`,
                }}
                transition={{ type: 'spring', stiffness: 180, damping: 26 }}
                className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full bg-accent ring-4 ring-paper"
              />
            </div>
            <div className="mt-2 flex justify-between text-[12px] text-ink-faint">
              <span className="tnum">{formatRand(MARKET_LOW)}</span>
              <span>typical market range</span>
              <span className="tnum">{formatRand(MARKET_HIGH)}</span>
            </div>
            {indicative < MARKET_LOW && (
              <p className="mt-2 text-[13px] font-medium text-accent">
                Below the market floor, by {formatRand(MARKET_LOW - indicative)} a month.
              </p>
            )}
          </div>

          <Divider className="my-4" />

          <Row label="Measured annual driving" value={`${measuredAnnualKm.toLocaleString('en-ZA')} km`} />
          <Row label="National benchmark" value={`${BASELINE_KM.toLocaleString('en-ZA')} km`} />
          <Row
            label="Exposure below benchmark"
            value={`${Math.round((1 - ratio) * 100)}%`}
            strong
          />
        </Card>
      </div>

      <div className="gutter mt-4">
        <div
          className={cx(
            'flex items-start gap-3 rounded-[--radius-card] p-4',
            enough ? 'bg-accent-soft' : 'bg-warn-soft',
          )}
        >
          <span className={cx('mt-0.5 shrink-0', enough ? 'text-accent-ink' : 'text-warn')}>
            {enough ? (
              <ShieldCheck size={17} strokeWidth={2} />
            ) : (
              <TriangleAlert size={17} strokeWidth={2} />
            )}
          </span>
          <p
            className={cx(
              'text-[13px] leading-[1.55]',
              enough ? 'text-accent-ink' : 'text-warn',
            )}
          >
            {enough ? (
              <>
                {verified} verified trips this month. That is enough evidence for an insurer to
                price you on measurement rather than on an assumption.
              </>
            ) : (
              <>
                Only {verified} verified trips so far. An insurer would want at least eight before
                treating this as evidence. Keep tracking.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="gutter mt-6">
        <Button
          variant="accent"
          size="lg"
          className="w-full"
          onClick={() => navigate({ to: '/record' })}
        >
          Take your record to an insurer
        </Button>
        <p className="mt-3 text-[12px] leading-[1.55] text-ink-faint">
          <Pill className="mr-1.5 align-middle">Indication only</Pill>
          This is a modelled figure based on your own measured travel, not a quotation, and not
          financial advice. Further is not an authorised financial services provider and does not
          arrange cover. Only an insurer can quote you.
        </p>
      </div>
    </main>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-[14px] text-ink-muted">{label}</span>
      <span
        className={
          strong ? 'tnum text-[15px] font-semibold text-accent' : 'tnum text-[14px] font-medium'
        }
      >
        {value}
      </span>
    </div>
  )
}
