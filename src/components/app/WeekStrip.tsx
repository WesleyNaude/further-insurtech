import * as React from 'react'
import { motion } from 'motion/react'
import type { Trip } from '@/lib/domain/types'
import { DISPLACING_MODES } from '@/lib/domain/engine'
import { cx } from '@/lib/cx'
import { localDateKey } from '@/lib/date'

type DayState = 'displaced' | 'drove' | 'none' | 'future'

/**
 * Seven days at a glance. Each day answers one question: did you drive?
 * Deliberately not a calendar. It is a habit surface.
 */
export function WeekStrip({ trips }: { trips: Trip[] }) {
  const days = React.useMemo(() => {
    const now = new Date()
    const out: { date: Date; state: DayState; label: string }[] = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = localDateKey(d)
      const onDay = trips.filter(
        (t) => localDateKey(new Date(t.startedAt)) === key && t.verification !== 'unverified',
      )

      const displaced = onDay.some((t) => DISPLACING_MODES.includes(t.mode) || t.mode === 'walk' || t.mode === 'cycle')
      const drove = onDay.some((t) => t.mode === 'car')

      out.push({
        date: d,
        state: displaced ? 'displaced' : drove ? 'drove' : 'none',
        label: d.toLocaleDateString('en-ZA', { weekday: 'narrow' }),
      })
    }
    return out
  }, [trips])

  return (
    <div className="flex items-end justify-between gap-1.5">
      {days.map((d, i) => {
        const today = i === days.length - 1
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <motion.div
              initial={{ scaleY: 0.2, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 380, damping: 26 }}
              style={{ transformOrigin: 'bottom' }}
              className={cx(
                'h-9 w-full rounded-[6px]',
                d.state === 'displaced' && 'bg-accent',
                d.state === 'drove' && 'bg-car-soft ring-1 ring-inset ring-car/25',
                d.state === 'none' && 'bg-sunken',
                today && 'ring-2 ring-ink ring-offset-2 ring-offset-paper',
              )}
            />
            <span
              className={cx(
                'text-[11px] leading-none',
                today ? 'font-semibold text-ink' : 'text-ink-faint',
              )}
            >
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
