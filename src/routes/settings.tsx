import { createFileRoute, Link } from '@tanstack/react-router'
import { RotateCcw, Sun, Moon, SunMoon, ShieldCheck, BadgeCheck, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { TopBar, Screen } from '@/components/app/AppShell'
import { Card, Section, Button, Divider } from '@/components/ui/primitives'
import { useTheme, type Theme } from '@/lib/theme'
import { useHandbackStore } from '@/lib/handback/store'
import { useWallet } from '@/lib/handback/useWallet'
import { formatZl } from '@/lib/handback/money'
import { FARE_GR, HANDBACK_GR, HANDBACK_SHARE, ZL_PER_EUR } from '@/lib/handback/data'
import { cx } from '@/lib/cx'

export const Route = createFileRoute('/settings')({ component: SettingsScreen })

function SettingsScreen() {
  const { household, totals } = useWallet()
  const reset = useHandbackStore((s) => s.reset)
  const resetEmpty = useHandbackStore((s) => s.resetEmpty)

  return (
    <Screen>
      <TopBar title="Settings" />

      {/* The approval, kept visible. She half expected to be rejected. */}
      <Section title="Your household">
        <div className="gutter">
          <Card>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-money-soft text-money-ink">
                <BadgeCheck size={18} strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-medium">{household.name}</p>
                <p className="text-[14px] text-ink-muted">
                  {household.city} · {household.people} people
                </p>
              </div>
            </div>
            <Divider className="my-4" />
            <Field
              label="Status"
              value={household.eligibility === 'approved' ? 'Approved' : 'Not checked'}
            />
            {household.approvedOn && (
              <Field
                label="Since"
                value={new Date(household.approvedOn).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              />
            )}
            {household.reference && <Field label="City reference" value={household.reference} />}
            <p className="mt-3 text-[12px] leading-[1.55] text-ink-faint">
              Checked once, when you signed up. You will not be asked again unless your household
              changes.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Where the money comes from">
        <div className="gutter">
          <Link to="/source">
            <Card className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sunken text-ink-muted">
                <ShieldCheck size={18} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-medium">The carbon charge on fuel</p>
                <p className="text-[14px] text-ink-muted">In three steps, no jargon</p>
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

      <Section title="What we know about you">
        <div className="gutter">
          <Card>
            <div className="text-[14px] leading-[1.6] text-ink-muted">
              <p>
                That your household qualifies, and that a valid ticket was used. The transport
                operator tells us a journey happened; it does not tell us where you went, and we
                do not ask.
              </p>
              <p className="mt-3">
                We never see your bank. The money moves to the account already attached to your
                travel card.
              </p>
              <p className="mt-3">
                You were checked once. There is no monthly form, no reassessment, and nothing to
                remember.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Every figure we apply">
        <div className="gutter">
          <Card>
            <Field label="Single ticket" value={formatZl(FARE_GR)} />
            <Field label="Share covered" value={`${Math.round(HANDBACK_SHARE * 100)}%`} />
            <Field label="Back per journey" value={formatZl(HANDBACK_GR)} />
            <Field label="Złoty per euro" value={String(ZL_PER_EUR)} />
            <Field label="Journeys this month" value={String(totals.tripsMonth)} />
            <p className="mt-3 text-[12px] leading-[1.55] text-ink-faint">
              Published here rather than buried. The rate is set by the city and can change; if it
              does, you will see it here before it takes effect.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Demo">
        <div className="gutter">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                reset()
                toast.success('Demo data reset')
              }}
            >
              <RotateCcw size={15} strokeWidth={2} />
              Reset demo data
            </Button>
            <Button
              onClick={() => {
                resetEmpty()
                toast('Starting from nothing', { description: 'Not yet checked, no journeys.' })
              }}
            >
              Start empty
            </Button>
          </div>
          <p className="mt-2 text-[12px] leading-[1.5] text-ink-faint">
            &ldquo;Start empty&rdquo; runs the sign-up from the beginning, including the approval
            screen.
          </p>
        </div>
      </Section>

      <p className="gutter mt-8 text-[12px] leading-[1.5] text-ink-faint">
        A demonstration. Figures are modelled, not quoted, and no city or operator has endorsed
        this.
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
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-[14px] text-ink-muted">{label}</span>
      <span className="tnum text-[14px] font-medium text-ink">{value}</span>
    </div>
  )
}
