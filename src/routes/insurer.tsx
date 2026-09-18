import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { TopBar } from '@/components/app/AppShell'
import { Card, Divider } from '@/components/ui/primitives'
import { useStatement } from '@/lib/useStatement'

export const Route = createFileRoute('/insurer')({ component: InsurerView })

/**
 * What your insurer receives.
 *
 * This is the screen the whole product stands on. Usage-based insurance has a
 * consent problem, not a data problem: people will not be watched. Showing the
 * exact payload, and the much longer list of what is withheld, is the thing
 * that makes continuous verification acceptable.
 */
function InsurerView() {
  const navigate = useNavigate()
  const { statement, policy, monthTrips } = useStatement()

  const month = new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })

  const shared = [
    ['Policy reference', '••••  4417'],
    ['Period', month],
    ['Kilometres driven', `${Math.round(statement.drivenKm).toLocaleString('en-ZA')} km`],
    ['Kilometres by other modes', `${Math.round(statement.displacedKm).toLocaleString('en-ZA')} km`],
    ['Trips meeting the evidence bar', String(monthTrips.filter((t) => t.verification === 'verified').length)],
    ['Reduction applied', `${Math.round(statement.premiumReduction * 100)}%`],
  ]

  const withheld = [
    'Your routes, and every coordinate on them',
    'Which stations, stops or taxi ranks you use',
    'Departure and arrival times',
    'Which operator carried you',
    'Where you live or work',
    'Anything at all about who you travelled with',
  ]

  return (
    <main className="mx-auto w-full max-w-md pb-10">
      <TopBar
        title="What your insurer sees"
        leading={
          <button
            onClick={() => navigate({ to: '/settings' })}
            aria-label="Back"
            className="-ml-1 grid h-8 w-8 place-items-center rounded-full text-ink"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
        }
      />

      <div className="gutter pt-2">
        <p className="text-[14px] leading-[1.55] text-ink-muted">
          {policy.insurer} receives six numbers, once a month. That is the entire transmission,
          reproduced below exactly as it is sent.
        </p>
      </div>

      <div className="gutter mt-6">
        <div className="mb-2 flex items-center gap-2">
          <Eye size={15} strokeWidth={1.9} className="text-ink-muted" />
          <h2 className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
            Sent
          </h2>
        </div>
        <Card inset={false} className="overflow-hidden">
          {shared.map(([k, v], i) => (
            <div key={k}>
              {i > 0 && <Divider />}
              <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                <span className="text-[14px] text-ink-muted">{k}</span>
                <span className="tnum text-[14px] font-medium text-ink">{v}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="gutter mt-8">
        <div className="mb-2 flex items-center gap-2">
          <EyeOff size={15} strokeWidth={1.9} className="text-ink-muted" />
          <h2 className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
            Never sent
          </h2>
        </div>
        <Card inset={false} className="overflow-hidden">
          {withheld.map((w, i) => (
            <div key={w}>
              {i > 0 && <Divider />}
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                <span className="text-[14px] text-ink-muted">{w}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="gutter mt-8">
        <div className="rounded-[--radius-card] bg-sunken p-4">
          <p className="text-[13px] leading-[1.6] text-ink-muted">
            <strong className="font-medium text-ink">Why this works.</strong> We never have to prove
            what you would otherwise have done on any single day. Your policy already states the
            mileage it was priced on, so the comparison is against your insurer&rsquo;s own
            assumption, not against a guess about your intentions. That is what lets the route data
            stay on your phone.
          </p>
        </div>
      </div>
    </main>
  )
}
