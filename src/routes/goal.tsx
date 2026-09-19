import { createFileRoute } from '@tanstack/react-router'
import NumberFlow from '@number-flow/react'
import { motion, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { PiggyBank, Banknote, Check } from 'lucide-react'
import { TopBar, Screen } from '@/components/app/AppShell'
import { Card, Section, Button, Divider } from '@/components/ui/primitives'
import { useWallet } from '@/lib/handback/useWallet'
import { useHandbackStore } from '@/lib/handback/store'
import { formatZl } from '@/lib/handback/money'
import { defaultGoal } from '@/lib/handback/data'
import { confirm as buzz, tap } from '@/lib/haptics'
import { cx } from '@/lib/cx'

export const Route = createFileRoute('/goal')({ component: GoalScreen })

function GoalScreen() {
  const { goal, availableGr, weeklyRateGr, cashedGr } = useWallet()
  const moveToGoal = useHandbackStore((s) => s.moveToGoal)
  const cashOut = useHandbackStore((s) => s.cashOut)
  const setGoal = useHandbackStore((s) => s.setGoal)
  const payout = useHandbackStore((s) => s.payout)
  const setPayout = useHandbackStore((s) => s.setPayout)
  const reduced = useReducedMotion()

  const done = goal?.fraction === 1

  return (
    <Screen>
      <TopBar title="Saving" />

      <div className="gutter pt-2">
        <p className="text-[14px] leading-[1.55] text-ink-muted">
          You can take this as cash whenever you want. Or leave it here until you need it for
          something.
        </p>
      </div>

      {/* what is sitting there */}
      <Section title="Not yet used">
        <div className="gutter">
          <Card>
            <p className="tnum flex items-baseline text-[40px] font-semibold leading-none tracking-[-0.03em]">
              <NumberFlow
                value={availableGr / 100}
                locales="pl-PL"
                format={{ minimumFractionDigits: 2 }}
              />
              <span className="ml-1.5 text-[18px] font-medium text-ink-faint">zł</span>
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                variant={availableGr > 0 && goal ? 'accent' : 'secondary'}
                disabled={availableGr <= 0 || !goal}
                onClick={() => {
                  moveToGoal(availableGr)
                  buzz()
                  toast.success(`${formatZl(availableGr)} put aside`)
                }}
              >
                <PiggyBank size={15} strokeWidth={1.9} />
                Put aside
              </Button>
              <Button
                disabled={availableGr <= 0}
                onClick={() => {
                  cashOut(availableGr)
                  buzz()
                  toast.success(`${formatZl(availableGr)} on its way`, {
                    description: 'Into the account on your card, usually the same day.',
                  })
                }}
              >
                <Banknote size={15} strokeWidth={1.9} />
                Take as cash
              </Button>
            </div>
          </Card>
        </div>
      </Section>

      {/* the goal */}
      {goal ? (
        <Section title="What you are saving for">
          <div className="gutter">
            <Card>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[17px] font-semibold tracking-[-0.01em]">{goal.goal.label}</p>
                <p className="tnum text-[13px] text-ink-muted">
                  by{' '}
                  {new Date(`${goal.goal.dueOn}T00:00:00`).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>

              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-sunken">
                <motion.div
                  initial={reduced ? false : { width: 0 }}
                  animate={{ width: `${goal.fraction * 100}%` }}
                  transition={{ duration: reduced ? 0 : 0.9, ease: [0.32, 0.72, 0, 1] }}
                  className="h-full rounded-full bg-accent"
                />
              </div>

              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="tnum text-[15px] font-semibold text-accent">
                  {formatZl(goal.savedGr)}
                </span>
                <span className="tnum text-[13px] text-ink-muted">
                  of {formatZl(goal.goal.targetGr)}
                </span>
              </div>

              <Divider className="my-4" />

              {done ? (
                <div className="flex items-center gap-2 text-[14px] font-medium text-accent">
                  <Check size={16} strokeWidth={2.4} />
                  Covered. You do not need to think about it again.
                </div>
              ) : (
                <>
                  <Row
                    label="Coming in"
                    value={`${formatZl(weeklyRateGr)} a week`}
                  />
                  <Row label="Weeks left" value={String(goal.weeksLeft)} />
                  <Row
                    label="Needed each week"
                    value={formatZl(goal.neededPerWeekGr)}
                    tone={goal.onTrack ? 'good' : 'warn'}
                  />
                  <p
                    className={cx(
                      'mt-3 text-[13px] leading-[1.55]',
                      goal.onTrack ? 'text-accent' : 'text-warn',
                    )}
                  >
                    {goal.onTrack
                      ? 'At the rate you are travelling, this is covered before it is due.'
                      : `At the rate you are travelling you would be about ${formatZl(
                          Math.max(0, goal.neededPerWeekGr - weeklyRateGr) * goal.weeksLeft,
                        )} short. Coming in by tram as well would close most of that.`}
                  </p>
                </>
              )}
            </Card>
          </div>
        </Section>
      ) : (
        <Section title="Saving for something">
          <div className="gutter">
            <Card>
              <p className="text-[14px] leading-[1.55] text-ink-muted">
                Some people find it easier to leave the money here when it has a name on it.
              </p>
              <Button
                variant="accent"
                className="mt-4 w-full"
                onClick={() => {
                  setGoal(defaultGoal())
                  tap()
                }}
              >
                Save for the school trip
              </Button>
            </Card>
          </div>
        </Section>
      )}

      {/* default behaviour */}
      <Section title="When money arrives">
        <div className="gutter">
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="What happens by default">
            {(
              [
                { v: 'save' as const, label: 'Keep it here' },
                { v: 'cash' as const, label: 'Pay it out' },
              ]
            ).map(({ v, label }) => (
              <button
                key={v}
                role="radio"
                aria-checked={payout === v}
                onClick={() => {
                  setPayout(v)
                  tap()
                }}
                className={cx(
                  'h-[52px] rounded-[--radius-card] text-[14px] font-medium ring-1 transition-colors',
                  payout === v
                    ? 'bg-ink text-paper ring-ink'
                    : 'bg-surface text-ink-muted ring-line',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[12px] leading-[1.5] text-ink-faint">
            Either way it is your money. Changing this does not affect what you have already
            earned.
          </p>
        </div>
      </Section>

      {cashedGr > 0 && (
        <Section title="Already taken">
          <div className="gutter">
            <Card className="flex items-baseline justify-between">
              <span className="text-[14px] text-ink-muted">Paid out to you</span>
              <span className="tnum text-[17px] font-semibold">{formatZl(cashedGr)}</span>
            </Card>
          </div>
        </Section>
      )}
    </Screen>
  )
}

function Row({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'good' | 'warn'
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-[14px] text-ink-muted">{label}</span>
      <span
        className={cx(
          'tnum text-[14px] font-medium',
          tone === 'good' ? 'text-accent' : tone === 'warn' ? 'text-warn' : 'text-ink',
        )}
      >
        {value}
      </span>
    </div>
  )
}
