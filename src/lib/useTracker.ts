import * as React from 'react'
import { haversine, pathLength, distanceToPath, classifyFromSpeeds } from './geo'
import { CORRIDORS } from './domain/corridors'
import type { Corridor } from './domain/types'

export type TrackerState = 'idle' | 'locating' | 'tracking' | 'denied' | 'unsupported'

export interface TrackerReading {
  points: [number, number][]
  metres: number
  speedsMs: number[]
  accuracy: number | null
  startedAt: number | null
  /** Best-matching published corridor, if the path stays inside the tolerance. */
  corridor: Corridor | null
  corridorDeviation: number | null
}

const EMPTY: TrackerReading = {
  points: [],
  metres: 0,
  speedsMs: [],
  accuracy: null,
  startedAt: null,
  corridor: null,
  corridorDeviation: null,
}

/** Metres a path may stray from the published alignment and still match. */
export const CORRIDOR_TOLERANCE_M = 220

/**
 * Real trip tracking, on real platform APIs.
 *
 * Geolocation for the path, Wake Lock so the screen survives the journey,
 * Vibration for the two moments that matter. Everything is computed on the
 * device; nothing is transmitted.
 */
export function useTracker() {
  const [state, setState] = React.useState<TrackerState>('idle')
  const [reading, setReading] = React.useState<TrackerReading>(EMPTY)
  const watchId = React.useRef<number | null>(null)
  const wakeLock = React.useRef<WakeLockSentinel | null>(null)

  const buzz = React.useCallback((pattern: number | number[]) => {
    try {
      navigator.vibrate?.(pattern)
    } catch {
      /* not supported, and not important */
    }
  }, [])

  const stop = React.useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
    wakeLock.current?.release().catch(() => {})
    wakeLock.current = null
    setState('idle')
  }, [])

  const start = React.useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState('unsupported')
      return
    }
    setState('locating')
    setReading({ ...EMPTY, startedAt: Date.now() })
    buzz(12)

    navigator.wakeLock
      ?.request('screen')
      .then((s) => (wakeLock.current = s))
      .catch(() => {})

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState('tracking')
        const pt: [number, number] = [pos.coords.longitude, pos.coords.latitude]

        setReading((r) => {
          const prev = r.points[r.points.length - 1]

          // Drop jitter: GPS noise while stationary would otherwise inflate distance.
          if (prev && haversine(prev, pt) < Math.max(8, (pos.coords.accuracy || 20) * 0.6)) {
            return { ...r, accuracy: pos.coords.accuracy ?? r.accuracy }
          }

          const points = [...r.points, pt]
          const speedsMs = pos.coords.speed != null ? [...r.speedsMs, pos.coords.speed] : r.speedsMs

          // Match against published alignments as we go.
          let corridor: Corridor | null = null
          let deviation: number | null = null
          if (points.length >= 3) {
            for (const c of CORRIDORS) {
              const worst = Math.max(...points.slice(-12).map((p) => distanceToPath(p, c.path)))
              if (worst < CORRIDOR_TOLERANCE_M && (deviation === null || worst < deviation)) {
                corridor = c
                deviation = worst
              }
            }
          }

          if (corridor && !r.corridor) buzz([10, 40, 10])

          return {
            ...r,
            points,
            speedsMs,
            metres: pathLength(points),
            accuracy: pos.coords.accuracy ?? null,
            corridor,
            corridorDeviation: deviation,
          }
        })
      },
      (err) => {
        setState(err.code === err.PERMISSION_DENIED ? 'denied' : 'unsupported')
        watchId.current = null
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20_000 },
    )
  }, [buzz])

  React.useEffect(() => () => stop(), [stop])

  const classification = React.useMemo(
    () => classifyFromSpeeds(reading.speedsMs),
    [reading.speedsMs],
  )

  return { state, reading, classification, start, stop, buzz }
}
