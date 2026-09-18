import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight, ShieldCheck, Car, RotateCcw, MapPin, Eye, Sun, Moon, SunMoon } from 'lucide-react'
import { useTheme, type Theme } from '@/lib/theme'
import { cx } from '@/lib/cx'
import { toast } from 'sonner'
import { TopBar, Screen } from '@/components/app/AppShell'
import { Card, Section, Divider, Button } from '@/components/ui/primitives'
import { useStore } from '@/lib/store'
import { formatRand } from '@/lib/domain/money'
import { MILEAGE_VARIABLE_SHARE, MEMBER_SHARE, MAX_REDUCTION } from '@/lib/domain/engine'

export const Route = createFileRoute('/settings')({ component: SettingsScreen })

function SettingsScreen() {
  const policy = useStore((s) => s.policy)
  const reset = useStore((s) => s.reset)

  return (
    <Screen>
      <TopBar title="Settings" />

      <Section title="Your policy">
        <div className="gutter">
          <Card>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sunken text-ink-muted">
                <Car size={18} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium">{policy.vehicle}</p>
                <p className="text-[13px] text-ink-muted">
                  {policy.insurer} · {policy.product}
                </p>
              </div>
            </div>
            <Divider className="my-4" />
            <Field label="Monthly premium" value={formatRand(policy.basePremiumCents)} />
            <Field
              label="Rated annual mileage"
              value={`${policy.ratedAnnualKm.toLocaleString('en-ZA')} km`}
            />
            <Field
              label="Linked"
              value={new Date(policy.linkedAt).toLocaleDateString('en-ZA', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />
          </Card>
        </div>
      </Section>

      <Section title="Plan">
        <div className="gutter">
          <Link to="/plan">
            <Card className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sunken text-ink-muted">
                <MapPin size={18} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium">Plan a trip</p>
                <p className="text-[13px] text-ink-muted">Compare fares against driving</p>
              </div>
              <ChevronRight size={18} strokeWidth={2} className="text-ink-faint" />
            </Card>
          </Link>
        </div>
      </Section>

      <Section title="Appearance">
        <div className="gutter">
          <ThemePicker />
        </div>
      </Section>

      <Section title="Privacy">
        <div className="gutter space-y-3">
          <Link to="/insurer">
            <Card className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sunken text-ink-muted">
                <Eye size={18} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium">What your insurer sees</p>
                <p className="text-[13px] text-ink-muted">Six numbers, once a month</p>
              </div>
              <ChevronRight size={18} strokeWidth={2} className="text-ink-faint" />
            </Card>
          </Link>
          <Card>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink">
                <ShieldCheck size={16} strokeWidth={2} />
              </span>
              <div className="text-[13px] leading-[1.6] text-ink-muted">
                <p>
                  We keep the corridor you matched and the time band you travelled in. We do not
                  keep a continuous location history, and we never share a route with your insurer,
                  only the monthly kilometre totals your reduction is calculated from.
                </p>
                <p className="mt-3">
                  Your insurer never sees which taxi, train or operator you used.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="The constants we apply">
        <div className="gutter">
          <Card>
            <Field label="Mileage-variable share of premium" value={`${MILEAGE_VARIABLE_SHARE * 100}%`} />
            <Field label="Your share of the modelled saving" value={`${MEMBER_SHARE * 100}%`} />
            <Field label="Monthly reduction ceiling" value={`${MAX_REDUCTION * 100}%`} />
            <p className="mt-3 text-[12px] leading-[1.5] text-ink-faint">
              Published here rather than buried, because a number you cannot check is a number you
              cannot trust.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Demo">
        <div className="gutter">
          <Button
            onClick={() => {
              reset()
              toast.success('Demo data reset')
            }}
          >
            <RotateCcw size={15} strokeWidth={2} />
            Reset demo data
          </Button>
        </div>
      </Section>

      <p className="gutter mt-8 text-[12px] leading-[1.5] text-ink-faint">
        Further is a demonstration. Figures are modelled, not quoted, and no insurer has endorsed
        this calculation.
      </p>
    </Screen>
  )
}

function ThemePicker() {
  const [theme, setTheme] = useTheme()
  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: SunMoon },
  ]

  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Appearance">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          role="radio"
          aria-checked={theme === value}
          onClick={() => setTheme(value)}
          className={cx(
            'flex h-[52px] flex-col items-center justify-center gap-1 rounded-[--radius-card] ring-1 transition-colors',
            theme === value ? 'bg-ink text-paper ring-ink' : 'bg-surface text-ink-muted ring-line',
          )}
        >
          <Icon size={17} strokeWidth={1.85} />
          <span className="text-[12px] font-medium">{label}</span>
        </button>
      ))}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-1.5">
      <span className="text-[14px] text-ink-muted">{label}</span>
      <span className="tnum text-[14px] font-medium text-ink">{value}</span>
    </div>
  )
}
