import { createFileRoute } from '@tanstack/react-router'
import { Check, Home, KeyRound } from 'lucide-react'
import { TopBar, Screen } from '@/components/app/AppShell'
import { Card, Section, Divider } from '@/components/ui/primitives'
import { useProgress } from '@/lib/flight/useProgress'
import { useFlightStore } from '@/lib/flight/store'
import { INTERVENTIONS } from '@/lib/flight/data'
import { monthlyPreventedKg, monthsToEarn } from '@/lib/flight/engine'
import { formatRand } from '@/lib/flight/money'
import { INTERVENTION_ICON } from '@/components/app/icons'
import { tap } from '@/lib/haptics'
import type { Tenure } from '@/lib/flight/types'
import { cx } from '@/lib/cx'

export const Route = createFileRoute('/install')({ component: InstallScreen })

function InstallScreen() {
  const { flight, intervention, enrolment } = useProgress()
  const chooseIntervention = useFlightStore((s) => s.chooseIntervention)
  const setTenure = useFlightStore((s) => s.setTenure)
  const locked = Boolean(enrolment.claimedOn)

  return (
    <Screen>
      <TopBar title="What you fit" />

      <div className="gutter pt-2">
        <p className="text-[14px] leading-[1.55] text-ink-muted">
          One change at home, made once. Water heating is usually the largest single thing on a
          South African electricity bill, and the grid it runs on is about 80% coal.
        </p>
      </div>

      {/* Who owns the property decides whether this is possible at all. */}
      <Section title="Who controls the property">
        <div className="gutter">
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tenure">
            {(
              [
                { v: 'owner' as Tenure, label: 'I own it', icon: Home },
                { v: 'tenant' as Tenure, label: 'I rent', icon: KeyRound },
              ]
            ).map(({ v, label, icon: Icon }) => (
              <button
                key={v}
                role="radio"
                aria-checked={enrolment.tenure === v}
                disabled={locked}
                onClick={() => {
                  setTenure(v)
                  tap()
                }}
                className={cx(
                  'flex h-[56px] items-center justify-center gap-2 rounded-[--radius-card] ring-1 transition-colors',
                  enrolment.tenure === v
                    ? 'bg-ink text-paper ring-ink'
                    : 'bg-surface text-ink-muted ring-line',
                  locked && 'opacity-60',
                )}
              >
                <Icon size={17} strokeWidth={1.85} />
                <span className="text-[14px] font-medium">{label}</span>
              </button>
            ))}
          </div>

          <div
            className={cx(
              'mt-3 rounded-[--radius-card] p-4',
              enrolment.tenure === 'tenant' ? 'bg-warn-soft' : 'bg-sunken',
            )}
          >
            <p
              className={cx(
                'text-[13px] leading-[1.6]',
                enrolment.tenure === 'tenant' ? 'text-warn' : 'text-ink-muted',
              )}
            >
              {enrolment.tenure === 'tenant' ? (
                <>
                  <strong className="font-medium">You cannot fit this yourself.</strong> Renting
                  means the landlord installs, keeps the electricity saving for the life of the
                  appliance, and signs that you earn the ticket. That trade is better for them
                  than for you in rand, and it is the only honest way a tenant gets here. Nobody
                  has built this arrangement yet, so treat it as unproven.
                </>
              ) : (
                <>
                  Owning the property is what makes this possible. Be aware that most of these pay
                  for themselves in electricity within a few years, so you may well have fitted
                  one anyway; the ticket is a reason to do it sooner, not the only reason.
                </>
              )}
            </p>
          </div>
        </div>
      </Section>

      <Section title={locked ? 'What you fitted' : 'Choose one'}>
        <div className="gutter space-y-2">
          {INTERVENTIONS.map((i) => {
            const Icon = INTERVENTION_ICON[i.kind]
            const active = i.kind === intervention.kind
            const months = monthsToEarn(flight, i)
            const payback = i.annualSavingCents
              ? ((i.costLowCents + i.costHighCents) / 2 / i.annualSavingCents).toFixed(1)
              : null
            return (
              <button
                key={i.kind}
                disabled={locked}
                onClick={() => {
                  chooseIntervention(i.kind)
                  tap()
                }}
                className={cx(
                  'w-full rounded-[--radius-card] p-4 text-left ring-1 transition-colors',
                  active ? 'bg-surface ring-ink' : 'bg-surface ring-line active:bg-sunken',
                  locked && 'opacity-60',
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium">{i.name}</span>
                      {active && <Check size={16} strokeWidth={2.4} className="text-ink" />}
                    </div>
                    <p className="mt-0.5 text-[13px] leading-[1.45] text-ink-muted">{i.blurb}</p>
                  </div>
                </div>

                <Divider className="my-3" />

                <dl className="grid grid-cols-3 gap-2">
                  <Figure
                    value={`${monthlyPreventedKg(i)}`}
                    unit="kg/mo"
                    label="Prevented"
                  />
                  <Figure value={String(months)} unit="mo" label="To the ticket" />
                  <Figure
                    value={formatRand(i.costLowCents).replace('R', '')}
                    unit={`–${formatRand(i.costHighCents).replace('R', '')}`}
                    label="To install"
                    small
                  />
                </dl>

                {payback && (
                  <p className="mt-2.5 text-[12px] leading-[1.45] text-ink-faint">
                    Saves about {formatRand(i.annualSavingCents)} a year on electricity, so it
                    pays for itself in roughly {payback} years on its own.
                  </p>
                )}
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Once only">
        <div className="gutter">
          <Card>
            <p className="text-[13px] leading-[1.6] text-ink-muted">
              One install, one ticket, and then this closes. We can verify the switch once: the
              certificate and the bills prove a change happened on one date, and after that there
              is nothing left to check. The appliance goes on saving for fifteen years whether
              this app exists or not, so we reward the decision to fit it, not its continued
              existence. Rewarding it again and again would make this a carbon credit, which
              means audits, additionality proofs, and a market that pays about R420 for something
              we are exchanging for a {formatRand(flight.ticketCents)} seat.
            </p>
          </Card>
        </div>
      </Section>
    </Screen>
  )
}

function Figure({
  value,
  unit,
  label,
  small,
}: {
  value: string
  unit: string
  label: string
  small?: boolean
}) {
  return (
    <div>
      <dd
        className={cx(
          'tnum font-semibold leading-none tracking-[-0.02em] text-ink',
          small ? 'text-[15px]' : 'text-[20px]',
        )}
      >
        {value}
        <span className="ml-0.5 text-[11px] font-medium text-ink-faint">{unit}</span>
      </dd>
      <dt className="mt-1.5 text-[12px] text-ink-faint">{label}</dt>
    </div>
  )
}
