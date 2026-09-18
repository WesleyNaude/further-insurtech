import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import NumberFlow from '@number-flow/react'
import { X, Satellite, ShieldCheck, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { RouteFigure } from '@/components/app/RouteFigure'
import { ModeIcon, MODE_LABEL } from '@/components/app/icons'
import { Button, Pill } from '@/components/ui/primitives'
import { useTracker, CORRIDOR_TOLERANCE_M } from '@/lib/useTracker'
import { useStatement } from '@/lib/useStatement'
import { useStore } from '@/lib/store'
import { formatRand } from '@/lib/domain/money'
import type { Mode, Trip } from '@/lib/domain/types'
import { cx } from '@/lib/cx'

export const Route = createFileRoute('/track')({ component: Track })

/**
 * Live tracking, for real.
 *
 * This uses the device's own Geolocation, Wake Lock and Vibration APIs. There
 * is no server and no mock: the path, the distance, the corridor match and the
 * mode guess are all computed here, on the phone, which is exactly the claim
 * the product makes to the member.
 */
function Track() {
  const navigate = useNavigate()
  const { state, source, reading, classification, start, startSimulated, stop } = useTracker()
  const { statement } = useStatement()
  const addTrip = useStore((s) => s.addTrip)

  React.useEffect(() => {
    start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const km = reading.metres / 1000
  const mode = guessMode(classification.mode, !!reading.corridor)
  const counts = mode !== 'car' && mode !== null
  const earned = counts ? Math.round(km * statement.centsPerVerifiedKm) : 0

  const elapsed = reading.startedAt ? Math.floor((Date.now() - reading.startedAt) / 1000) : 0
  const [, force] = React.useReducer((n: number) => n + 1, 0)
  React.useEffect(() => {
    const id = window.setInterval(force, 1000)
    return () => window.clearInterval(id)
  }, [])

  function finish() {
    stop()
    if (reading.points.length < 4 || reading.metres < 300) {
      toast('Trip too short to record', { description: 'Nothing was saved.' })
      navigate({ to: '/' })
      return
    }

    const verification =
      source === 'simulated' ? 'probable' : reading.corridor && counts ? 'verified' : 'probable'

    const trip: Trip = {
      id: `t_track_${Date.now()}`,
      startedAt: new Date(reading.startedAt ?? Date.now()).toISOString(),
      mode: (mode ?? 'car') as Mode,
      fromName: reading.corridor?.fromName ?? 'Start',
      toName: reading.corridor?.toName ?? 'End',
      metres: Math.round(reading.metres),
      corridorId: reading.corridor?.id ?? 'adhoc',
      path: reading.points,
      samples: reading.samples,
      verification: verification as Trip['verification'],
      evidence: [
        {
          kind: 'corridor',
          label: 'Corridor match',
          detail: reading.corridor
            ? `Held within ${Math.round(reading.corridorDeviation ?? 0)} m of the ${reading.corridor.name} alignment`
            : `No published alignment within ${CORRIDOR_TOLERANCE_M} m of this path`,
          passed: !!reading.corridor,
        },
        {
          kind: 'speed',
          label: 'Speed profile',
          detail: `Median ${classification.medianKmh.toFixed(0)} km/h, 90th percentile ${classification.p90Kmh.toFixed(0)} km/h`,
          passed: classification.mode !== 'unknown',
        },
        {
          kind: 'self',
          label: source === 'simulated' ? 'Simulated journey' : 'Recorded on this device',
          detail:
            source === 'simulated'
              ? `${reading.points.length} synthetic fixes, matched and classified by the live pipeline. Clearly marked, never counted as evidence of a real trip.`
              : `${reading.points.length} fixes, best accuracy ${Math.round(reading.accuracy ?? 0)} m. Nothing left the phone.`,
          passed: source !== 'simulated',
        },
      ],
      creditedCents: 0,
    }

    addTrip(trip)
    toast.success('Trip saved', { description: `${km.toFixed(2)} km recorded.` })
    navigate({ to: '/trips/$tripId', params: { tripId: trip.id } })
  }

  const denied = state === 'denied' || state === 'unsupported'

  return (
    <main className="flex w-full flex-1 flex-col bg-paper">
      <div className="gutter safe-top flex h-14 shrink-0 items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
          {state === 'tracking' ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Recording
            </>
          ) : state === 'locating' ? (
            <>
              <Satellite size={16} strokeWidth={1.9} className="animate-pulse text-ink-muted" />
              Finding you
            </>
          ) : (
            'Live trip'
          )}
          {source === 'simulated' && <Pill className="ml-1">simulated</Pill>}
        </span>
        <button
          onClick={() => {
            stop()
            navigate({ to: '/' })
          }}
          aria-label="Cancel"
          className="grid h-11 w-11 place-items-center rounded-full bg-sunken text-ink-muted"
        >
          <X size={17} strokeWidth={2} />
        </button>
      </div>

      {denied ? (
        <div className="gutter flex flex-1 flex-col items-center justify-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-warn-soft text-warn">
            <TriangleAlert size={22} strokeWidth={1.8} />
          </span>
          <h2 className="mt-4 text-[20px] font-semibold tracking-[-0.02em]">
            {state === 'denied' ? 'Location is switched off' : 'This device cannot track'}
          </h2>
          <p className="mt-2 max-w-[32ch] text-[14px] leading-[1.55] text-ink-muted">
            Further measures trips on the device itself, so without location there is nothing to
            measure. You can still log trips by hand, which count at probable rather than verified.
          </p>
          <Button variant="accent" size="lg" className="mt-6 w-full max-w-[280px]" onClick={() => startSimulated()}>
            Run a simulated trip
          </Button>
          <p className="mt-2 max-w-[34ch] text-[12px] leading-[1.5] text-ink-faint">
            A synthetic journey fed through exactly the same corridor matching and
            classification as a real one. Nothing is faked downstream.
          </p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate({ to: '/' })}>
            Back to today
          </Button>
        </div>
      ) : (
        <>
          <div className="relative flex-1">
            {reading.points.length > 1 ? (
              <RouteFigure
                path={reading.points}
                corridor={reading.corridor?.path}
                className="absolute inset-0 bg-sunken"
                animate={false}
                tone={counts ? 'accent' : 'muted'}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-sunken">
                <div className="text-center">
                  <motion.span
                    animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="mx-auto block h-3 w-3 rounded-full bg-accent"
                  />
                  <p className="mt-4 text-[13px] text-ink-muted">Waiting for a position fix</p>
                  {reading.accuracy && (
                    <p className="tnum mt-1 text-[12px] text-ink-faint">
                      accurate to {Math.round(reading.accuracy)} m
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="absolute inset-x-0 top-3 flex justify-center">
              <AnimatePresence>
                {reading.corridor && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="inline-flex items-center gap-1.5 rounded-[--radius-pill] bg-paper/88 px-3 py-1.5 text-[12px] font-medium text-ink shadow-[--shadow-card] backdrop-blur-md"
                  >
                    <ShieldCheck size={13} strokeWidth={2.2} className="text-accent" />
                    On the {reading.corridor.name}
                    <span className="tnum text-ink-faint">
                      ±{Math.round(reading.corridorDeviation ?? 0)} m
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="gutter safe-bottom shrink-0 border-t border-line bg-paper pb-6 pt-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="tnum flex items-baseline text-[40px] font-semibold leading-none tracking-[-0.03em]">
                  <NumberFlow value={Number(km.toFixed(2))} locales="en-GB" />
                  <span className="ml-1 text-[15px] font-medium text-ink-faint">km</span>
                </p>
                <p className="tnum mt-2 text-[13px] text-ink-muted">
                  {formatClock(elapsed)}
                  {classification.mode !== 'unknown' && (
                    <> · {classification.medianKmh.toFixed(0)} km/h median</>
                  )}
                </p>
              </div>

              <div className="text-right">
                {mode ? (
                  <Pill tone={counts ? 'accent' : 'car'}>
                    <ModeIcon mode={mode} size={12} />
                    {MODE_LABEL[mode]}
                  </Pill>
                ) : (
                  <Pill>Working it out</Pill>
                )}
                <p
                  className={cx(
                    'tnum mt-2 text-[22px] font-semibold',
                    counts ? 'text-accent' : 'text-ink-faint',
                  )}
                >
                  {counts ? `+${formatRand(earned, { decimals: true })}` : '—'}
                </p>
              </div>
            </div>

            <Button variant="primary" size="lg" className="mt-5 w-full" onClick={finish}>
              End trip
            </Button>
            <p className="mt-2 text-center text-[12px] text-ink-faint">
              {source === 'simulated'
                ? 'Simulated journey. It will be saved as probable, never verified.'
                : 'Recorded on this device. No location is sent anywhere.'}
            </p>
          </div>
        </>
      )}
    </main>
  )
}

function guessMode(c: ReturnType<typeof import('@/lib/geo').classifyFromSpeeds>['mode'], onCorridor: boolean): Mode | null {
  if (c === 'walk') return 'walk'
  if (c === 'cycle') return 'cycle'
  // On a published alignment we can credit a public mode; off it, we cannot
  // distinguish a bus from a car, so we assume the car and pay nothing.
  if (c === 'road') return onCorridor ? 'bus' : 'car'
  if (c === 'rail-or-road') return onCorridor ? 'train' : 'car'
  return null
}

function formatClock(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}
