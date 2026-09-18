import * as React from 'react'
import { haversine, pathLength, distanceToPath, classifyFromSpeeds } from './geo'
import { CORRIDORS } from './domain/corridors'
import { tap as tapBuzz, confirm as confirmBuzz } from './haptics'
import type { Corridor } from './domain/types'

export type TrackerState = 'idle' | 'locating' | 'tracking' | 'denied' | 'unsupported'
export type TrackerSource = 'device' | 'simulated'

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
  const [source, setSource] = React.useState<TrackerSource>('device')
  const simTimer = React.useRef<number | null>(null)
  const [reading, setReading] = React.useState<TrackerReading>(EMPTY)
  const watchId = React.useRef<number | null>(null)
  const wakeLock = React.useRef<WakeLockSentinel | null>(null)

  const buzz = React.useCallback((pattern: number | number[]) => {
    if (Array.isArray(pattern)) confirmBuzz()
    else tapBuzz()
  }, [])

  const stop = React.useCallback(() => {
    if (simTimer.current !== null) {
      window.clearInterval(simTimer.current)
      simTimer.current = null
    }
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
    setSource('device')
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

        ingest(pt, pos.coords.speed, pos.coords.accuracy)
      },
      (err) => {
        setState(err.code === err.PERMISSION_DENIED ? 'denied' : 'unsupported')
        watchId.current = null
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20_000 },
    )
  }, [buzz])

  const ingest = React.useCallback(
    (pt: [number, number], speed: number | null, accuracy: number | null) => {
      setReading((r) => {
        const prev = r.points[r.points.length - 1]

        // Drop jitter: GPS noise while stationary would otherwise inflate distance.
        if (prev && haversine(prev, pt) < Math.max(8, (accuracy || 20) * 0.6)) {
          return { ...r, accuracy: accuracy ?? r.accuracy }
        }

        const points = [...r.points, pt]
        const speedsMs = speed != null ? [...r.speedsMs, speed] : r.speedsMs

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
          accuracy: accuracy ?? r.accuracy,
          corridor,
          corridorDeviation: deviation,
        }
      })
    },
    [buzz],
  )

  /**
   * A simulated journey, fed through the identical reducer.
   *
   * Not a mock screen: the corridor match, the distance and the mode guess are
   * all computed by the same code that handles a real fix. It exists because a
   * laptop has no useful GPS, and the product has to be demonstrable anywhere.
   */
  const startSimulated = React.useCallback(
    (corridorId = 'clar-cbd') => {
      const c = CORRIDORS.find((x) => x.id === corridorId) ?? CORRIDORS[0]
      stop()
      setSource('simulated')
      setState('tracking')
      setReading({ ...EMPTY, startedAt: Date.now() })
      buzz(12)

      // Interpolate the alignment into realistic fixes, with plausible noise.
      const fixes: { pt: [number, number]; speed: number }[] = []
      for (let i = 1; i < c.path.length; i++) {
        const a = c.path[i - 1]
        const b = c.path[i]
        const steps = 6
        for (let s = 0; s < steps; s++) {
          const t = s / steps
          const jitter = () => (Math.random() - 0.5) * 0.00035
          fixes.push({
            pt: [a[0] + (b[0] - a[0]) * t + jitter(), a[1] + (b[1] - a[1]) * t + jitter()],
            speed: 11 + Math.random() * 9, // ~40 to 72 km/h, rail-or-road
          })
        }
      }

      let i = 0
      simTimer.current = window.setInterval(() => {
        if (i >= fixes.length) {
          if (simTimer.current) window.clearInterval(simTimer.current)
          simTimer.current = null
          buzz([10, 40, 10])
          return
        }
        ingest(fixes[i].pt, fixes[i].speed, 12)
        i++
      }, 110)
    },
    [buzz, ingest, stop],
  )

  React.useEffect(() => () => stop(), [stop])

  const classification = React.useMemo(
    () => classifyFromSpeeds(reading.speedsMs),
    [reading.speedsMs],
  )

  return { state, source, reading, classification, start, startSimulated, stop, buzz }
}
