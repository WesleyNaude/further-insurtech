import { createFileRoute } from '@tanstack/react-router'
import { RotateCcw, Sun, Moon, SunMoon, ShieldQuestion } from 'lucide-react'
import { toast } from 'sonner'
import { TopBar, Screen } from '@/components/app/AppShell'
import { Card, Section, Button } from '@/components/ui/primitives'
import { useTheme, type Theme } from '@/lib/theme'
import { useFlightStore } from '@/lib/flight/store'
import { useProgress } from '@/lib/flight/useProgress'
import {
  GRID_KG_PER_KWH,
  GEYSER_KWH_MONTH,
  KG_CO2_PER_PAX_KM,
  NON_CO2_MULTIPLIER,
  TARIFF_C_PER_KWH,
} from '@/lib/flight/data'
import { SEATS_COVERED } from '@/lib/flight/engine'
import { cx } from '@/lib/cx'

export const Route = createFileRoute('/settings')({ component: SettingsScreen })

function SettingsScreen() {
  const reset = useFlightStore((s) => s.reset)
  const resetEmpty = useFlightStore((s) => s.resetEmpty)
  const { intervention, flight, enrolment } = useProgress()

  return (
    <Screen>
      <TopBar title="Settings" />

      <Section title="Your enrolment">
        <div className="gutter">
          <Card>
            <Field label="Flight" value={`${flight.from} to ${flight.to}`} />
            <Field label="Appliance" value={intervention.name} />
            <Field label="Property" value={enrolment.tenure === 'owner' ? 'Owned' : 'Rented'} />
            <Field
              label="Status"
              value={enrolment.claimedOn ? 'Claimed, closed' : 'Counting'}
            />
          </Card>
        </div>
      </Section>

      <Section title="Appearance">
        <div className="gutter">
          <ThemePicker />
        </div>
      </Section>

      <Section title="Every constant we apply">
        <div className="gutter">
          <Card>
            <Field label="Eskom grid" value={`${GRID_KG_PER_KWH} kg CO2e/kWh`} />
            <Field label="Assumed geyser load" value={`${GEYSER_KWH_MONTH} kWh a month`} />
            <Field label="Electricity tariff" value={`R${(TARIFF_C_PER_KWH / 100).toFixed(2)}/kWh`} />
            <Field label="Flight CO2" value={`${KG_CO2_PER_PAX_KM} kg per pax-km`} />
            <Field label="Non-CO2 multiplier" value={`×${NON_CO2_MULTIPLIER}`} />
            <Field label="Seats covered" value={String(SEATS_COVERED)} />
            <p className="mt-3 text-[12px] leading-[1.55] text-ink-faint">
              Published here rather than buried, because a number you cannot check is a number you
              cannot trust. Progress is measured from your own bills; the assumed load is only
              used for estimates before your readings exist.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="What we are not claiming">
        <div className="gutter">
          <Card>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sunken text-ink-muted">
                <ShieldQuestion size={16} strokeWidth={1.9} />
              </span>
              <div className="text-[13px] leading-[1.6] text-ink-muted">
                <p>
                  This offsets a flight&rsquo;s emissions. It is not a certified carbon credit, it
                  has not been audited, and no airline or regulator has endorsed the calculation.
                </p>
                <p className="mt-3">
                  The non-CO2 multiplier is a simplification of contested science. Every screen
                  shows the fuel-burn CO2 separately so you can see what the multiplier does.
                </p>
                <p className="mt-3">
                  We do not claim the appliance would not have been fitted without us. Most of
                  these pay for themselves in electricity within a few years.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Demo">
        <div className="gutter">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                localStorage.removeItem('further.flight.earned')
                reset()
                toast.success('Demo data reset')
              }}
            >
              <RotateCcw size={15} strokeWidth={2} />
              Reset demo data
            </Button>
            <Button
              onClick={() => {
                localStorage.removeItem('further.flight.earned')
                resetEmpty()
                toast('Starting from nothing', {
                  description: 'No install, no bills, nothing counting.',
                })
              }}
            >
              Start empty
            </Button>
          </div>
          <p className="mt-2 text-[12px] leading-[1.5] text-ink-faint">
            &ldquo;Start empty&rdquo; is the real day one: nothing is counting until there is an
            install date, a certificate and a baseline.
          </p>
        </div>
      </Section>

      <p className="gutter mt-8 text-[12px] leading-[1.5] text-ink-faint">
        Further is a demonstration. Figures are modelled, not quoted.
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
