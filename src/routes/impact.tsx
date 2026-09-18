import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BarChart } from '@/components/app/BarChart'
import { TopBar, Screen } from '@/components/app/AppShell'
import { Card, Section } from '@/components/ui/primitives'
import { useStatement } from '@/lib/useStatement'
import { DISPLACING_MODES, CO2_G_PER_KM } from '@/lib/domain/engine'
import { MODE_LABEL } from '@/components/app/icons'
import type { Mode } from '@/lib/domain/types'

export const Route = createFileRoute('/impact')({ component: ImpactScreen })

function ImpactScreen() {
  const { allTrips, statement } = useStatement()

  /** Last 8 weeks of kilometres, driven versus displaced. */
  const weekly = React.useMemo(() => {
    const buckets = new Map<string, { driven: number; displaced: number }>()
    const now = new Date()
    for (let w = 5; w >= 0; w--) {
      const d = new Date(now)
      d.setDate(d.getDate() - w * 7)
      buckets.set(weekKey(d), { driven: 0, displaced: 0 })
    }
    for (const t of allTrips) {
      const key = weekKey(new Date(t.startedAt))
      const b = buckets.get(key)
      if (!b || t.verification === 'unverified') continue
      const km = t.metres / 1000
      if (t.mode === 'car') b.driven += km
      else if (DISPLACING_MODES.includes(t.mode)) b.displaced += km
    }
    return [...buckets.entries()]
      .map(([key, v]) => ({
        week: new Date(key).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
        driven: Math.round(v.driven),
        displaced: Math.round(v.displaced),
      }))
      .filter((d, i, arr) => d.driven + d.displaced > 0 || i > arr.findIndex((x) => x.driven + x.displaced > 0))
  }, [allTrips])

  const byMode = React.useMemo(() => {
    const m = new Map<Mode, number>()
    for (const t of allTrips) {
      if (t.verification === 'unverified') continue
      m.set(t.mode, (m.get(t.mode) ?? 0) + t.metres / 1000)
    }
    return [...m.entries()]
      .map(([mode, km]) => ({ mode, km: Math.round(km) }))
      .sort((a, b) => b.km - a.km)
  }, [allTrips])

  const totalKm = byMode.reduce((a, b) => a + b.km, 0)

  return (
    <Screen>
      <TopBar title="Impact" />

      <div className="gutter pt-4">
        <p className="text-[14px] leading-[1.55] text-ink-muted">
          The figures that pay you are kilometres, not kilograms. The carbon below is a
          consequence of driving less, reported for interest.
        </p>
      </div>

      <Section title="Kilometres a week">
        <div className="gutter">
          <Card>
            <BarChart
              data={weekly.map((w) => ({
                label: w.week,
                values: { displaced: w.displaced, driven: w.driven },
              }))}
              series={[
                { key: 'displaced', label: 'Not driven', colour: 'var(--color-accent)' },
                { key: 'driven', label: 'Drove', colour: 'var(--color-line-strong)' },
              ]}
              unit="km"
            />
          </Card>
        </div>
      </Section>

      <Section title="How you travel">
        <div className="gutter space-y-2">
          {byMode.map(({ mode, km }) => (
            <div key={mode}>
              <div className="mb-1 flex items-baseline justify-between text-[13px]">
                <span className="font-medium text-ink">{MODE_LABEL[mode]}</span>
                <span className="tnum text-ink-muted">{km.toLocaleString('en-ZA')} km</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-sunken">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${totalKm ? (km / totalKm) * 100 : 0}%`,
                    background: mode === 'car' ? 'var(--color-car)' : 'var(--color-accent)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Carbon, for interest">
        <div className="gutter">
          <Card>
            <p className="tnum text-[32px] font-semibold leading-none tracking-[-0.02em]">
              {statement.co2KgAvoided.toFixed(0)}
              <span className="ml-1 text-[14px] font-medium text-ink-faint">kg CO2e this month</span>
            </p>
            <p className="mt-3 text-[13px] leading-[1.55] text-ink-muted">
              Calculated as the difference between {CO2_G_PER_KM.car} g per km for your car and the
              per-passenger factor for the mode you actually used, across verified trips only.
            </p>
            <p className="mt-3 text-[13px] leading-[1.55] text-ink-faint">
              This is not an offset, a credit, or a claim of neutrality, and it has not been
              certified by anyone. At South Africa&rsquo;s carbon tax rate it would be worth roughly{' '}
              R{(statement.co2KgAvoided * 0.308).toFixed(0)}, which is precisely why it does not
              fund your reduction.
            </p>
          </Card>
        </div>
      </Section>
    </Screen>
  )
}

function weekKey(d: Date) {
  const c = new Date(d)
  c.setDate(c.getDate() - ((c.getDay() + 6) % 7)) // Monday
  return c.toISOString().slice(0, 10)
}
