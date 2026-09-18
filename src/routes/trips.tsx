import * as React from 'react'
import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { TopBar, Screen } from '@/components/app/AppShell'
import { TripRow } from '@/components/app/TripRow'
import { Divider } from '@/components/ui/primitives'
import { Empty } from '@/components/app/Empty'
import { Route as RouteIcon } from 'lucide-react'
import { useStatement } from '@/lib/useStatement'
import { DISPLACING_MODES } from '@/lib/domain/engine'
import { cx } from '@/lib/cx'

export const Route = createFileRoute('/trips')({ component: TripsLayout })

function TripsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  if (pathname !== '/trips') return <Outlet />
  return <TripsList />
}

type Filter = 'all' | 'counted' | 'drove'

/**
 * Trips are rendered a page at a time.
 *
 * Five months is over 200 rows and about 5,000 DOM nodes, which is a visible
 * cost on the mid-range Android this product is actually for. Nobody scrolls a
 * whole history, so we render a page and append as the end comes into view.
 */
const PAGE = 40

function TripsList() {
  const { allTrips, monthTrips } = useStatement()
  const [filter, setFilter] = React.useState<Filter>('all')
  const [shown, setShown] = React.useState(PAGE)
  const sentinel = React.useRef<HTMLDivElement>(null)

  // Credit figures only exist for the current month; older trips show plainly.
  const creditById = React.useMemo(
    () => new Map(monthTrips.map((t) => [t.id, t.creditedCents])),
    [monthTrips],
  )

  const filtered = React.useMemo(() => {
    const withCredit = allTrips.map((t) => ({ ...t, creditedCents: creditById.get(t.id) ?? 0 }))
    if (filter === 'counted')
      return withCredit.filter((t) => DISPLACING_MODES.includes(t.mode) && t.verification !== 'unverified')
    if (filter === 'drove') return withCredit.filter((t) => t.mode === 'car')
    return withCredit
  }, [allTrips, filter, creditById])

  // A change of filter starts the list again from the top.
  React.useEffect(() => setShown(PAGE), [filter])

  const visible = React.useMemo(() => filtered.slice(0, shown), [filtered, shown])
  const more = filtered.length - visible.length

  React.useEffect(() => {
    const el = sentinel.current
    if (!el || more <= 0) return
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setShown((n) => n + PAGE),
      { rootMargin: '600px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [more])

  const groups = React.useMemo(() => {
    const map = new Map<string, typeof visible>()
    for (const t of visible) {
      const key = t.startedAt.slice(0, 10)
      map.set(key, [...(map.get(key) ?? []), t])
    }
    return [...map.entries()]
  }, [visible])

  return (
    <Screen>
      <TopBar title="Trips" subtitle={`${filtered.length} trips`} />

      <div className="no-scrollbar sticky top-14 z-30 flex gap-2 overflow-x-auto bg-paper/72 px-5 py-2 backdrop-blur-xl">
        {(
          [
            ['all', 'All'],
            ['counted', 'Not driven'],
            ['drove', 'Drove'],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cx(
              'tap tap-wide shrink-0 rounded-[--radius-pill] px-3.5 py-1.5 text-[13px] font-medium transition-colors',
              filter === key ? 'bg-ink text-paper' : 'bg-sunken text-ink-muted',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-2">
        {groups.map(([day, trips]) => (
          <section key={day}>
            <h2 className="gutter sticky top-[104px] z-20 bg-paper/80 py-2 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-faint backdrop-blur-xl">
              {new Date(day).toLocaleDateString('en-ZA', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h2>
            <div className="bg-surface ring-1 ring-line">
              {trips.map((t, i) => (
                <React.Fragment key={t.id}>
                  {i > 0 && <Divider className="ml-[68px]" />}
                  <TripRow trip={t} />
                </React.Fragment>
              ))}
            </div>
          </section>
        ))}
        <div ref={sentinel} aria-hidden />

        {more > 0 && (
          <p className="gutter py-6 text-center text-[13px] text-ink-faint">
            {more.toLocaleString('en-ZA')} earlier {more === 1 ? 'trip' : 'trips'}&hellip;
          </p>
        )}

        {groups.length === 0 && (
          <Empty
            icon={RouteIcon}
            title={filter === 'drove' ? 'No car trips' : 'Nothing here yet'}
            body={
              filter === 'counted'
                ? 'Trips on a train, bus or taxi appear here once they clear the evidence bar.'
                : filter === 'drove'
                  ? 'You have not driven at all in this period. That is the whole idea.'
                  : 'Track a trip from the button below and it will show up here.'
            }
          />
        )}
      </div>
    </Screen>
  )
}
