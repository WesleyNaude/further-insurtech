import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { TramFront, Bus, TrainFront, Receipt } from 'lucide-react'
import { TopBar, Screen } from '@/components/app/AppShell'
import { Divider } from '@/components/ui/primitives'
import { Empty } from '@/components/app/Empty'
import { useWallet } from '@/lib/handback/useWallet'
import { formatZl } from '@/lib/handback/money'
import { localDateKey } from '@/lib/date'
import type { Mode } from '@/lib/handback/types'

export const Route = createFileRoute('/journeys')({ component: JourneysScreen })

const MODE_ICON: Record<Mode, typeof TramFront> = {
  tram: TramFront,
  bus: Bus,
  train: TrainFront,
}

const PAGE = 40

function JourneysScreen() {
  const { taps, totals } = useWallet()
  const [shown, setShown] = React.useState(PAGE)
  const sentinel = React.useRef<HTMLDivElement>(null)

  const visible = taps.slice(0, shown)
  const more = taps.length - visible.length

  React.useEffect(() => {
    const el = sentinel.current
    if (!el || more <= 0) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShown((n) => n + PAGE), {
      rootMargin: '600px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [more])

  const groups = React.useMemo(() => {
    const map = new Map<string, typeof visible>()
    for (const t of visible) {
      const key = localDateKey(new Date(t.at))
      map.set(key, [...(map.get(key) ?? []), t])
    }
    return [...map.entries()]
  }, [visible])

  return (
    <Screen>
      <TopBar title="Journeys" subtitle={`${taps.length} in total`} />

      {groups.map(([day, items]) => {
        const dayTotal = items.reduce((a, t) => a + t.backGr, 0)
        return (
          <section key={day}>
            <div className="gutter sticky top-14 z-20 flex items-baseline justify-between bg-paper/80 py-2 backdrop-blur-xl">
              <h2 className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-faint">
                {new Date(`${day}T00:00:00`).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h2>
              <span className="tnum text-[12px] font-medium text-money">
                +{formatZl(dayTotal)}
              </span>
            </div>
            <div className="gutter">
              <div className="overflow-hidden rounded-[--radius-card] bg-surface ring-1 ring-line">
              {items.map((t, i) => {
                const Icon = MODE_ICON[t.mode]
                return (
                  <React.Fragment key={t.id}>
                    {i > 0 && <Divider className="ml-[64px]" />}
                    <div className="flex items-center gap-3 px-5 py-3.5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-money-soft text-money-ink">
                        <Icon size={18} strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[16px] font-medium text-ink">
                          {t.mode === 'bus' ? 'Bus' : 'Tram'} {t.line}
                        </span>
                        <span className="mt-0.5 block truncate text-[14px] text-ink-muted">
                          {t.stop} ·{' '}
                          {new Date(t.at).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}{' '}
                          · fare {formatZl(t.fareGr)}
                        </span>
                      </span>
                      <span className="tnum shrink-0 text-[16px] font-medium text-money">
                        +{formatZl(t.backGr)}
                      </span>
                    </div>
                  </React.Fragment>
                )
              })}
              </div>
            </div>
          </section>
        )
      })}

      <div ref={sentinel} aria-hidden />

      {more > 0 && (
        <p className="gutter py-6 text-center text-[14px] text-ink-faint">
          {more.toLocaleString('pl-PL')} earlier journeys&hellip;
        </p>
      )}

      {taps.length === 0 && (
        <Empty
          icon={Receipt}
          title="No journeys yet"
          body="Tap your card the way you always do. Journeys appear here on their own, usually within a few minutes."
        />
      )}

      {taps.length > 0 && (
        <p className="gutter mt-6 text-[12px] leading-[1.5] text-ink-faint">
          {formatZl(totals.all)} since you joined. Every line here came from the ticket
          machine, not from anything you had to do.
        </p>
      )}
    </Screen>
  )
}
