import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, Fuel, ArrowDown, Wallet } from 'lucide-react'
import { TopBar } from '@/components/app/AppShell'
import { Card, Divider } from '@/components/ui/primitives'
import { useWallet } from '@/lib/handback/useWallet'
import { formatZl, formatEur } from '@/lib/handback/money'
import { HANDBACK_GR, FARE_GR, HANDBACK_SHARE, ZL_PER_EUR } from '@/lib/handback/data'

export const Route = createFileRoute('/source')({ component: SourceScreen })

/**
 * Where the money comes from.
 *
 * Marta has been paying this at the pump since January 2028 and resenting it.
 * She does not need the policy explained; she needs to see that it is the same
 * money coming back. One page, three boxes, no jargon.
 */
function SourceScreen() {
  const navigate = useNavigate()
  const { totals } = useWallet()

  return (
    <main className="mx-auto w-full max-w-md pb-10">
      <TopBar
        title="Where this comes from"
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
        <p className="text-[15px] leading-[1.55] text-ink-muted">
          When anyone fills up, part of what they pay is a charge for the pollution the fuel
          causes. You have been paying it too, every Sunday, since January 2028.
        </p>
      </div>

      <div className="gutter mt-6 space-y-2">
        <Card className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunken text-ink-muted">
            <Fuel size={18} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-[15px] font-medium">Drivers pay it at the pump</p>
            <p className="mt-1 text-[13px] leading-[1.55] text-ink-muted">
              It is already in the price. Nobody writes you a bill for it.
            </p>
          </div>
        </Card>

        <div className="flex justify-center py-1 text-ink-faint">
          <ArrowDown size={18} strokeWidth={2} />
        </div>

        <Card className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunken text-ink-muted">
            <span className="text-[15px] font-semibold">EU</span>
          </span>
          <div>
            <p className="text-[15px] font-medium">Some of it is set aside</p>
            <p className="mt-1 text-[13px] leading-[1.55] text-ink-muted">
              Because the charge is hardest on households who cannot simply stop driving, a share
              is kept back to give to those households. Poland has the largest allocation of any
              country.
            </p>
          </div>
        </Card>

        <div className="flex justify-center py-1 text-ink-faint">
          <ArrowDown size={18} strokeWidth={2} />
        </div>

        <Card className="flex items-start gap-3 bg-accent-soft ring-0">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
            <Wallet size={18} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-[15px] font-medium text-accent-ink">It comes back to you here</p>
            <p className="mt-1 text-[13px] leading-[1.55] text-accent-ink/85">
              {formatZl(HANDBACK_GR)} on every journey you make by tram, bus or train.{' '}
              {formatZl(totals.month)} so far this month.
            </p>
          </div>
        </Card>
      </div>

      <div className="gutter mt-8">
        <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
          The arithmetic
        </p>
        <Card inset={false} className="overflow-hidden">
          <div className="px-5 py-1">
            <Row label="A single ticket" value={formatZl(FARE_GR)} />
            <Divider />
            <Row label="Share covered" value={`${Math.round(HANDBACK_SHARE * 100)}%`} />
            <Divider />
            <Row label="Back to you, each journey" value={formatZl(HANDBACK_GR)} strong />
            <Divider />
            <Row
              label="In the fund's own currency"
              value={formatEur(HANDBACK_GR, ZL_PER_EUR)}
              muted
            />
          </div>
        </Card>
      </div>

      <div className="gutter mt-6">
        <div className="rounded-[--radius-card] bg-sunken p-4">
          <p className="text-[13px] leading-[1.6] text-ink-muted">
            <strong className="font-medium text-ink">Nothing is taken out of this.</strong> The
            money passes straight through to you. Whoever runs the scheme is paid separately, by
            the city, for each claim it checks. Taking a cut of a payment meant for households
            would be the end of the whole thing.
          </p>
        </div>
      </div>

      <p className="gutter mt-6 text-[12px] leading-[1.5] text-ink-faint">
        Funded under the EU Social Climate Fund. Poland&rsquo;s allocation runs from 2026 to 2032.
        Rates are set by the city and can change.
      </p>
    </main>
  )
}

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string
  value: string
  strong?: boolean
  muted?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <span className="text-[14px] text-ink-muted">{label}</span>
      <span
        className={
          strong
            ? 'tnum text-[16px] font-semibold text-accent'
            : muted
              ? 'tnum text-[14px] text-ink-faint'
              : 'tnum text-[14px] font-medium text-ink'
        }
      >
        {value}
      </span>
    </div>
  )
}
