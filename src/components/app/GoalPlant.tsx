import { useCallback, useEffect, useRef } from 'react'
import type { LottieHandle } from 'lottie-react'
import { LottieLight } from 'lottie-react'
import { animate, useReducedMotion } from 'motion/react'
import animationData from '@/assets/animations/plant-growth.json'

/**
 * A plant whose growth IS the goal's progress bar.
 *
 * It never plays on its own: the playhead is parked at the fraction of the
 * goal that is actually saved, so the plant can only be as grown as the money
 * is. Seeking by percent rather than by frame means the mapping survives the
 * animation being re-cut or replaced.
 *
 * Deliberately driven by money put aside and not by any environmental figure.
 * The app makes no carbon claim, and a graphic implying one would be writing a
 * cheque the arithmetic cannot cash.
 */
export function GoalPlant({ fraction, className }: { fraction: number; className?: string }) {
  const lottie = useRef<LottieHandle>(null)
  const reduced = useReducedMotion()
  // Where the plant is currently drawn, so a change grows on from there
  // instead of snapping, or restarting from seed.
  const shown = useRef(0)
  const ready = useRef(false)

  const target = Math.max(0, Math.min(1, fraction)) * 100

  const settle = useCallback(
    (to: number, instant: boolean) => {
      if (!ready.current) return undefined
      if (instant) {
        shown.current = to
        lottie.current?.seek({ percent: to })
        return undefined
      }
      const controls = animate(shown.current, to, {
        duration: 1.1,
        ease: [0.32, 0.72, 0, 1],
        onUpdate: (v) => {
          shown.current = v
          lottie.current?.seek({ percent: v })
        },
      })
      return () => controls.stop()
    },
    [],
  )

  useEffect(() => settle(target, !!reduced), [target, reduced, settle])

  return (
    <LottieLight
      src={animationData}
      lottieRef={lottie}
      autoplay={false}
      loop={false}
      className={className}
      // Decorative: the same progress is announced as text beside it.
      aria-hidden
      subscriptions={{
        ready: () => {
          ready.current = true
          // Grow in from seed on first paint, so arriving on the screen
          // shows the plant reaching its current size rather than already
          // sitting at it.
          settle(target, !!reduced)
        },
      }}
    />
  )
}

export default GoalPlant
