import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import NumberFlow from '@number-flow/react'
import { Info, ArrowDownToLine, Fuel } from 'lucide-react'
import { TopBar, Screen } from '@/components/app/AppShell'
import { Card, Section, Button, Divider } from '@/components/ui/primitives'
import { DerivationSheet } from '@/components/app/DerivationSheet'
import { useStatement } from '@/lib/useStatement'
import { useStore } from '@/lib/store'
import { formatRand } from '@/lib/domain/money'
import { toast } from 'sonner'
import { ShareCard } from '@/components/app/ShareCard'
import { Empty } from '@/components/app/Empty'
import { Coins } from 'lucide-react'

export const Route = createFileRoute('/wallet')({ component: WalletScreen })

function WalletScreen() {
  const { statement, policy, monthTrips } = useStatement()
  const paidOut = useStore((s) => s.paidOutCents)
  const [sheet, setSheet] = React.useState(false)

  const earners = monthTrips.filter((t) => t.creditedCents > 0)
  const nextDebit = new Date()
  nextDebit.setMonth(nextDebit.getMonth() + 1, 1)

  return (
    <Screen>
      <TopBar title="Wallet" />

      <div className="gutter pt-4">
        <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
          Accrued this month
        </p>
        <p className="tnum mt-2 flex items-baseline text-[52px] font-semibold leading-[0.95] tracking-[-0.035em]">
          <span className="mr-0.5 text-[30px] font-medium tracking-[-0.02em] text-ink-muted">R</span>
          <NumberFlow
            value={statement.reductionCents / 100}
            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            locales="en-GB"
          />
        </p>
        <button
          onClick={() => setSheet(true)}
          className="tap tap-wide mt-2 inline-flex items-center gap-1 text-[13px] text-ink-muted"
        >
          <Info size={13} strokeWidth={2} />
          How this is worked out
        </button>
      </div>

      <Section title="How you take it">
        <div className="gutter space-y-3">
          <Card className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink">
              <ArrowDownToLine size={18} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium">Off your premium</p>
              <p className="mt-0.5 text-[13px] leading-[1.5] text-ink-muted">
                Applied automatically on{' '}
                {nextDebit.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' })}. Your
                debit order becomes{' '}
                <span className="font-medium text-ink">
                  {formatRand(policy.basePremiumCents - statement.reductionCents)}
                </span>
                .
              </p>
            </div>
          </Card>

          <Card className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunken text-ink-muted">
              <Fuel size={18} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-medium">As fuel cash back instead</p>
                  <p className="mt-0.5 text-[13px] leading-[1.5] text-ink-muted">
                    Paid at the pump. Useful if you still drive at weekends.
                  </p>
                </div>
              </div>
              <Button
                className="mt-3"
                onClick={() => toast.success('Switched to fuel cash back', { description: 'Takes effect next cycle.' })}
              >
                Switch
              </Button>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Earned this month">
        <div className="bg-surface ring-1 ring-line">
          {earners.slice(0, 8).map((t, i) => (
            <React.Fragment key={t.id}>
              {i > 0 && <Divider className="ml-5" />}
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium">
                    {t.fromName} to {t.toName}
                  </p>
                  <p className="text-[12px] text-ink-faint">
                    {(t.metres / 1000).toFixed(1)} km ·{' '}
                    {new Date(t.startedAt).toLocaleDateString('en-ZA', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                <span className="tnum shrink-0 text-[14px] font-semibold text-accent">
                  +{formatRand(t.creditedCents, { decimals: true })}
                </span>
              </div>
            </React.Fragment>
          ))}
          {earners.length === 0 && (
            <Empty
              icon={Coins}
              title="Nothing earned yet"
              body="Every verified trip you take instead of driving adds to this month's reduction."
            />
          )}
        </div>
      </Section>

      <Section title="Share">
        <div className="gutter">
          <ShareCard statement={statement} insurer={policy.insurer} />
          <p className="mt-2 text-[12px] leading-[1.5] text-ink-faint">
            Creates an image of this month&rsquo;s figures, with the disclaimer printed on it.
          </p>
        </div>
      </Section>

      <Section title="Since you joined">
        <div className="gutter">
          <Card className="flex items-center justify-between">
            <span className="text-[14px] text-ink-muted">Total reductions applied</span>
            <span className="tnum text-[17px] font-semibold">{formatRand(paidOut)}</span>
          </Card>
        </div>
      </Section>

      <DerivationSheet open={sheet} onOpenChange={setSheet} statement={statement} />
    </Screen>
  )
}
