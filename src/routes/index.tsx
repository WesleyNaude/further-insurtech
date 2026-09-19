import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import NumberFlow from '@number-flow/react'
import { motion, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { ChevronRight, TramFront, Bus, TrainFront, Sunrise } from 'lucide-react'
import { TopBar, Screen, HeroEnd } from '@/components/app/AppShell'
import { Card, Section, Divider } from '@/components/ui/primitives'
import { useWallet } from '@/lib/handback/useWallet'
import { useHandbackStore } from '@/lib/handback/store'
import { formatZl } from '@/lib/handback/money'
import { FIRST_TRAM, HANDBACK_GR } from '@/lib/handback/data'
import { confirm as buzz } from '@/lib/haptics'
import type { Mode } from '@/lib/handback/types'

export const Route = createFileRoute('/')({ component: WalletScreen })

const MODE_ICON: Record<Mode, typeof TramFront> = {
  tram: TramFront,
  bus: Bus,
  train: TrainFront,
}

function WalletScreen() {
  const { totals, taps, pattern, availableGr } = useWallet()
  const receiveTap = useHandbackStore((s) => s.receiveTap)
  const reduced = useReducedMotion()

  const recent = taps.slice(0, 4)

  /**
   * In the real thing this arrives from the operator four minutes after she
   * taps, and she does nothing. Here it needs a button, clearly marked, so the
   * moment can be shown.
   */
  function simulateTap() {
    const tap = receiveTap('pm')
    buzz()
    toast.success(`${formatZl(tap.backGr)} back`, {
      description: `${tap.mode === 'bus' ? 'Bus' : 'Tram'} ${tap.line}, ${tap.stop}. That is ${formatZl(totals.week + tap.backGr)} this week.`,
    })
  }

  return (
    <Screen>
      <TopBar
        title="Your wallet"
        condensed={
          <p className="tnum flex items-baseline gap-2">
            <span className="text-[16px] font-medium tracking-[-0.01em] text-ink">
              {formatZl(availableGr)}
            </span>
            <span className="text-[12px] text-ink-faint">to use</span>
          </p>
        }
      />

      {/* ------------------------------------------------------------ hero */}
      <div className="gutter pt-4">
        <p className="text-[14px] font-medium uppercase tracking-[0.08em] text-ink-faint">
          Back this month
        </p>
        <p className="tnum mt-2 flex items-baseline text-[52px] font-bold leading-[0.95] tracking-[-0.035em] text-ink">
          <NumberFlow value={totals.month / 100} locales="pl-PL" format={{ minimumFractionDigits: 2 }} />
          <span className="ml-2 text-[24px] font-medium text-ink-faint">zł</span>
        </p>

        <Link
          to="/source"
          className="mt-3 inline-flex items-center gap-1.5 text-[14px] leading-[1.5] text-ink-muted"
        >
          Funded by the EU carbon charge on fuel
          <ChevronRight size={15} strokeWidth={2} className="text-ink-faint" />
        </Link>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Figure label="Today" value={formatZl(totals.today)} />
          <Figure label="This week" value={formatZl(totals.week)} />
          <Figure label="Journeys" value={String(totals.tripsMonth)} />
        </div>
      </div>

      <HeroEnd />

      {/* --------------------------------------------- the one that matters */}
      {pattern.clear && (
        <Section title="Something we noticed">
          <div className="gutter">
            <Card className="bg-accent-soft ring-0">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
                  <Sunrise size={17} strokeWidth={1.95} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-medium leading-[1.35] text-accent-ink">
                    You come home by tram, but you drive in.
                  </p>
                  <p className="mt-1.5 text-[14px] leading-[1.55] text-accent-ink/85">
                    On {pattern.homeOnlyDays} of the last {pattern.homeOnlyDays + pattern.bothWaysDays} working days.
                    Coming in by tram too would add about{' '}
                    <span className="font-medium">{formatZl(pattern.missedGr)}</span> a month here,
                    and save you far more than that in petrol.
                  </p>
                  <p className="mt-2.5 text-[14px] leading-[1.55] text-accent-ink/85">
                    The first tram is at {FIRST_TRAM}.
                  </p>
                </div>
              </div>
            </Card>
            <p className="mt-2 text-[12px] leading-[1.5] text-ink-faint">
              Only you know whether your shift can move. We are only putting a number on it.
            </p>
          </div>
        </Section>
      )}

      {/* ---------------------------------------------------------- recent */}
      <Section
        title="Recent journeys"
        action={
          <Link to="/journeys" className="tap tap-wide text-[14px] font-medium text-ink-muted">
            See all
          </Link>
        }
      >
        <div className="bg-surface ring-1 ring-line">
          {recent.map((t, i) => {
            const Icon = MODE_ICON[t.mode]
            return (
              <React.Fragment key={t.id}>
                {i > 0 && <Divider className="ml-[68px]" />}
                <motion.div
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-money-soft text-money-ink">
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] font-medium text-ink">
                      {t.mode === 'bus' ? 'Bus' : 'Tram'} {t.line}
                    </span>
                    <span className="mt-0.5 block truncate text-[14px] text-ink-muted">
                      {t.stop} ·{' '}
                      {new Date(t.at).toLocaleString('en-GB', {
                        weekday: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </span>
                  </span>
                  <span className="tnum shrink-0 text-[16px] font-medium text-money">
                    +{formatZl(t.backGr)}
                  </span>
                </motion.div>
              </React.Fragment>
            )
          })}
          {recent.length === 0 && (
            <p className="px-5 py-10 text-center text-[14px] text-ink-faint">
              Nothing yet. Tap your card as you always do and it will appear here.
            </p>
          )}
        </div>
      </Section>

      <Section title="Demo">
        <div className="gutter">
          <button
            onClick={simulateTap}
            className="w-full rounded-[--radius-card] bg-sunken px-4 py-3.5 text-left"
          >
            <span className="block text-[14px] font-medium text-ink">
              Pretend she just tapped her card
            </span>
            <span className="mt-0.5 block text-[14px] leading-[1.45] text-ink-muted">
              In the real thing this arrives on its own, about four minutes later. She does
              nothing: no app to open, nothing to scan, nothing to remember at 4:20 in the
              morning.
            </span>
          </button>
        </div>
      </Section>

      <p className="gutter mt-8 text-[12px] leading-[1.55] text-ink-faint">
        {formatZl(HANDBACK_GR)} back on every journey, paid from the carbon charge already
        included in the price of fuel. Nothing is deducted from this: the fee for running the
        scheme is paid separately by the city.
      </p>
    </Screen>
  )
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[--radius-card] bg-surface px-3 py-3 ring-1 ring-line">
      <p className="tnum text-[16px] font-medium leading-none tracking-[-0.02em] text-ink">
        {value}
      </p>
      <p className="mt-1.5 text-[12px] leading-[1.3] text-ink-faint">{label}</p>
    </div>
  )
}
