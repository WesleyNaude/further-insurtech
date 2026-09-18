import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { Sample } from '@/lib/domain/types'
import { CORRIDOR_TOLERANCE_M } from '@/lib/useTracker'
import { tap } from '@/lib/haptics'
import { cx } from '@/lib/cx'

/**
 * Scrub the journey.
 *
 * The product's whole claim is that a trip can be verified. A list of ticks
 * asserts that; this lets you check it. Drag along the journey and you see the
 * speed the phone measured at that moment and how far the path sat from the
 * published alignment, against the tolerance we actually apply.
 *
 * It is the one place where the interaction IS the argument: a fabricated trip
 * cannot survive being looked at this closely, and a real one becomes obvious.
 */
export function JourneyScrubber({
  samples,
  onChange,
  tone = 'accent',
}: {
  samples: Sample[]
  onChange?: (fraction: number) => void
  tone?: 'accent' | 'car'
}) {
  const [i, setI] = React.useState<number | null>(null)
  const ref = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const lastHaptic = React.useRef(-1)

  const W = 320
  const H = 92
  const pad = 6

  const maxSpeed = Math.max(10, ...samples.map((s) => s.speedKmh))
  const maxDev = Math.max(CORRIDOR_TOLERANCE_M, ...samples.map((s) => s.deviationM))

  const x = (n: number) => pad + (n / Math.max(1, samples.length - 1)) * (W - pad * 2)
  const ySpeed = (v: number) => H - pad - (v / maxSpeed) * (H - pad * 2)

  const speedPath = samples.map((s, n) => `${n ? 'L' : 'M'}${x(n)},${ySpeed(s.speedKmh)}`).join(' ')
  const areaPath = `${speedPath} L${x(samples.length - 1)},${H - pad} L${x(0)},${H - pad} Z`

  const stroke = tone === 'car' ? 'var(--color-car)' : 'var(--color-accent)'
  const uid = React.useId().replace(/:/g, '')

  const setFromClientX = React.useCallback(
    (clientX: number) => {
      const box = ref.current?.getBoundingClientRect()
      if (!box) return
      const frac = Math.min(1, Math.max(0, (clientX - box.left) / box.width))
      const next = Math.round(frac * (samples.length - 1))
      setI(next)
      onChange?.(samples.length > 1 ? next / (samples.length - 1) : 0)
      if (next !== lastHaptic.current) {
        lastHaptic.current = next
        tap()
      }
    },
    [samples.length, onChange],
  )

  const active = i === null ? null : samples[i]
  const withinTolerance = active ? active.deviationM <= CORRIDOR_TOLERANCE_M : true

  return (
    <div className="select-none">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
          Scrub the journey
        </span>
        {active ? (
          <span className="tnum flex items-baseline gap-3 text-[13px]">
            <span className="font-semibold text-ink">{active.speedKmh.toFixed(0)} km/h</span>
            <span className={withinTolerance ? 'text-accent' : 'text-warn'}>
              &plusmn;{active.deviationM} m
            </span>
          </span>
        ) : (
          <span className="text-[13px] text-ink-faint">drag to inspect</span>
        )}
      </div>

      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label="Scrub through the journey"
        aria-valuemin={0}
        aria-valuemax={samples.length - 1}
        aria-valuenow={i ?? 0}
        aria-valuetext={
          active ? `${active.speedKmh.toFixed(0)} kilometres per hour, ${active.deviationM} metres from the alignment` : 'not started'
        }
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          setFromClientX(e.clientX)
        }}
        onPointerMove={(e) => {
          if (e.buttons > 0 || e.pointerType === 'touch') setFromClientX(e.clientX)
        }}
        onPointerUp={() => setI(null)}
        onPointerCancel={() => setI(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setI((n) => Math.min(samples.length - 1, (n ?? -1) + 1))
          if (e.key === 'ArrowLeft') setI((n) => Math.max(0, (n ?? 1) - 1))
        }}
        className="relative h-[92px] w-full cursor-ew-resize touch-none overflow-hidden rounded-[12px] bg-sunken"
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill={`url(#g-${uid})`} />
          <motion.path
            d={speedPath}
            fill="none"
            stroke={stroke}
            strokeWidth="1.6"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduced ? 0 : 0.9, ease: [0.32, 0.72, 0, 1] }}
          />

          {i !== null && (
            <>
              <line
                x1={x(i)}
                y1={0}
                x2={x(i)}
                y2={H}
                stroke="var(--color-ink)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                opacity="0.45"
              />
              <circle
                cx={x(i)}
                cy={ySpeed(samples[i].speedKmh)}
                r="3.2"
                fill="var(--color-surface)"
                stroke={stroke}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>

        <span className="pointer-events-none absolute bottom-1.5 left-2.5 text-[10px] text-ink-faint">
          speed
        </span>
        <span className="tnum pointer-events-none absolute right-2.5 top-1.5 text-[10px] text-ink-faint">
          {maxSpeed.toFixed(0)} km/h
        </span>
      </div>

      {/* deviation against the tolerance we actually apply */}
      <div className="mt-2">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-sunken">
          {samples.map((s, n) => (
            <span
              key={n}
              className={cx(
                'absolute inset-y-0',
                s.deviationM <= CORRIDOR_TOLERANCE_M ? 'bg-accent' : 'bg-warn',
              )}
              style={{
                left: `${(n / samples.length) * 100}%`,
                width: `${100 / samples.length}%`,
                opacity: 0.25 + Math.min(1, s.deviationM / maxDev) * 0.75,
              }}
            />
          ))}
        </div>
        <p className="mt-1.5 text-[11px] leading-[1.4] text-ink-faint">
          Distance from the published alignment, point by point. Anything beyond{' '}
          {CORRIDOR_TOLERANCE_M} m breaks the corridor match.
        </p>
      </div>
    </div>
  )
}
