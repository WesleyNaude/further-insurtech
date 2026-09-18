import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import NumberFlow from '@number-flow/react'
import confetti from 'canvas-confetti'
import { MAX_REDUCTION } from '@/lib/domain/engine'
import { confirm as buzzConfirm } from '@/lib/haptics'

/**
 * Progress to the ceiling, as a ring.
 *
 * A bar says "some of a thing". A ring says "a share of a fixed whole", which is
 * exactly what this is: the policy allows 30% back and no more. The ceiling is
 * the goal the product is built around, so it gets the one piece of real
 * ceremony in the app, fired once per month and never again.
 */
export function CeilingRing({
  reduction,
  size = 132,
  stroke = 9,
}: {
  reduction: number
  size?: number
  stroke?: number
}) {
  const reduced = useReducedMotion()
  const pct = Math.min(1, reduction / MAX_REDUCTION)
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const atCeiling = pct >= 0.999

  // Celebrate the ceiling once a month, not once a render.
  React.useEffect(() => {
    if (!atCeiling) return
    const key = `further.ceiling.${new Date().toISOString().slice(0, 7)}`
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')

    buzzConfirm()
    if (reduced) return
    confetti({
      particleCount: 70,
      spread: 62,
      startVelocity: 28,
      gravity: 0.9,
      ticks: 160,
      scalar: 0.85,
      origin: { y: 0.34 },
      colors: ['#0E6B4A', '#3FB98A', '#9A9CA3'],
      disableForReducedMotion: true,
    })
  }, [atCeiling, reduced])

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-sunken)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: reduced ? 0 : 1.1, ease: [0.32, 0.72, 0, 1] }}
        />
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="tnum text-[24px] font-semibold leading-none tracking-[-0.02em] text-ink">
            <NumberFlow value={Math.round(reduction * 100)} locales="en-GB" />
            <span className="text-[14px] font-medium text-ink-faint">%</span>
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint">
            {atCeiling ? 'at ceiling' : `of ${Math.round(MAX_REDUCTION * 100)}%`}
          </p>
        </div>
      </div>
    </div>
  )
}
