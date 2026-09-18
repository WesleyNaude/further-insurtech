import * as React from 'react'
import { cx } from '@/lib/cx'

/**
 * Presentation shell.
 *
 * On a phone this is invisible: the app fills the screen. On a wide screen it
 * becomes a framed device beside a short statement of what the product is,
 * because a 448px column stranded on a 1440px page reads as an unfinished
 * website rather than an app.
 */
export function DeviceFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:min-h-dvh lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16 lg:bg-sunken lg:px-12 lg:py-10 xl:px-20">
      {/* Desktop-only rail. Hidden entirely on mobile, costing nothing there. */}
      <aside className="hidden lg:block lg:max-w-[46ch] lg:justify-self-end">
        <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-ink-faint">Further</p>
        <h1 className="mt-5 text-[44px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
          The kilometres you don&rsquo;t drive are worth money.
        </h1>
        <p className="mt-5 text-[17px] leading-[1.5] text-ink-muted">
          Your car insurance was priced on an assumed annual mileage. Drive under it and your
          expected claims cost falls. Further proves the gap, and hands most of it back.
        </p>

        <dl className="mt-10 grid grid-cols-3 gap-6">
          {[
            ['30%', 'maximum monthly reduction'],
            ['6', 'numbers shared with your insurer'],
            ['0', 'routes that leave your phone'],
          ].map(([v, k]) => (
            <div key={k}>
              <dt className="tnum text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink">
                {v}
              </dt>
              <dd className="mt-2 text-[13px] leading-[1.4] text-ink-muted">{k}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 max-w-[42ch] text-[13px] leading-[1.5] text-ink-faint">
          A demonstration build. Figures are modelled, not quoted. Nothing here offsets emissions
          or constitutes a carbon credit.
        </p>
      </aside>

      <div
        className={cx(
          'relative flex h-dvh w-full flex-col overflow-hidden bg-paper',
          // Device on wide screens
          'lg:h-[min(880px,calc(100dvh-80px))] lg:w-[400px] lg:shrink-0 lg:rounded-[44px] lg:shadow-[0_32px_80px_-16px_rgba(22,24,28,0.28)] lg:ring-1 lg:ring-line-strong',
        )}
      >
        {children}
      </div>
    </div>
  )
}
