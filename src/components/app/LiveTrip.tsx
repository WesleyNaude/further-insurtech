import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Radio, Check } from 'lucide-react'
import { toast } from 'sonner'
import { RouteFigure } from './RouteFigure'
import { ModeIcon, MODE_LABEL } from './icons'
import { corridorById } from '@/lib/domain/corridors'
import { useStore } from '@/lib/store'
import { formatRand } from '@/lib/domain/money'
import type { Trip, Mode } from '@/lib/domain/types'
import { cx } from '@/lib/cx'

/**
 * A trip detected in progress.
 *
 * In production this is driven by the phone's motion and location stack. Here
 * it plays out on a timer so the core moment of the product is visible: the app
 * recognises the mode itself, accrues value live, and asks for nothing.
 */
export function LiveTrip({ ratePerKmCents }: { ratePerKmCents: number }) {
  const addTrip = useStore((s) => s.addTrip)
  const [active, setActive] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [classified, setClassified] = React.useState(false)

  const corridor = corridorById('clar-cbd')!
  const mode: Mode = 'train'

  React.useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => {
      setProgress((p) => {
        const next = p + 0.02
        if (next > 0.25) setClassified(true)
        if (next >= 1) {
          window.clearInterval(id)
          finish()
          return 1
        }
        return next
      })
    }, 90)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  function finish() {
    const trip: Trip = {
      id: `t_live_${Date.now()}`,
      startedAt: new Date().toISOString(),
      mode,
      fromName: corridor.fromName,
      toName: corridor.toName,
      metres: corridor.metres,
      corridorId: corridor.id,
      path: corridor.path,
      verification: 'verified',
      evidence: [
        { kind: 'corridor', label: 'Corridor match', detail: `Held within 120 m of the ${corridor.name} alignment for the whole trip`, passed: true },
        { kind: 'stop-dwell', label: 'Stop dwell', detail: 'Four station stops detected, 22 to 48 seconds each', passed: true },
        { kind: 'cadence', label: 'Motion cadence', detail: 'Rail vibration signature, not road surface', passed: true },
        { kind: 'fare-tap', label: 'Fare tap', detail: 'Matched a card tap 38 seconds after boarding', passed: true },
      ],
      creditedCents: 0,
    }
    addTrip(trip)
    setTimeout(() => {
      setActive(false)
      setProgress(0)
      setClassified(false)
      toast.success('Trip verified', {
        description: `${corridor.fromName} to ${corridor.toName}, ${(corridor.metres / 1000).toFixed(1)} km.`,
      })
    }, 900)
  }

  const km = (corridor.metres / 1000) * progress
  const earned = Math.round(km * ratePerKmCents)

  const partialPath = React.useMemo(() => {
    const n = Math.max(2, Math.ceil(corridor.path.length * Math.max(progress, 0.08)))
    return corridor.path.slice(0, n)
  }, [progress, corridor.path])

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="flex w-full items-center gap-3 rounded-[--radius-card] bg-surface px-4 py-3.5 text-left ring-1 ring-line transition-colors active:bg-sunken"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sunken text-ink-muted">
          <Radio size={17} strokeWidth={1.9} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-medium text-ink">Simulate a live trip</span>
          <span className="block text-[12px] text-ink-muted">
            Watch detection, classification and accrual happen
          </span>
        </span>
      </button>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[--radius-card] bg-surface ring-1 ring-line"
    >
      <div className="relative">
        <RouteFigure
          path={partialPath}
          corridor={corridor.path}
          className="h-[150px] w-full bg-sunken"
          animate={false}
          compact
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-[--radius-pill] bg-paper/85 px-2 py-1 text-[11px] font-medium text-ink backdrop-blur-md">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          In progress
        </span>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {classified ? (
            <motion.div
              key="known"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-[14px] font-medium text-ink"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-accent-soft text-accent-ink">
                <Check size={12} strokeWidth={3} />
              </span>
              <ModeIcon mode={mode} size={15} />
              {MODE_LABEL[mode]} on the {corridor.name}
            </motion.div>
          ) : (
            <motion.div
              key="unknown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[14px] text-ink-muted"
            >
              Working out how you are travelling&hellip;
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="tnum text-[13px] text-ink-muted">{km.toFixed(1)} km</span>
          <motion.span
            key={earned}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            className={cx(
              'tnum text-[20px] font-semibold',
              classified ? 'text-accent' : 'text-ink-faint',
            )}
          >
            {classified ? `+${formatRand(earned, { decimals: true })}` : '—'}
          </motion.span>
        </div>

        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-sunken">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-100 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </motion.div>
  )
}
