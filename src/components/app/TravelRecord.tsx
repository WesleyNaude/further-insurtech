import * as React from 'react'
import { useReducedMotion } from 'motion/react'
import type { Trip } from '@/lib/domain/types'
import { DISPLACING_MODES } from '@/lib/domain/engine'
import { cx } from '@/lib/cx'

/**
 * Your travel record, drawn.
 *
 * This is the app's progression mechanic, and it is deliberately not a mascot or
 * a creature. The product's whole asset is credibility with two sceptical
 * audiences, and a character next to an evidence chain quietly suggests the
 * thing is a game rather than a measurement.
 *
 * So the thing that grows is made of the evidence: every verified journey lays
 * down its actual corridor, at low opacity, additively. Routes you travel often
 * burn brighter. After a few months it is a dense, personal figure that nobody
 * else could have, because nobody else made those journeys.
 *
 * Canvas rather than WebGL on purpose: the same additive result, a few hundred
 * bytes instead of the ~150 kB three.js would add to a 126 kB app. If this ever
 * needs depth or real shading, it is a contained swap.
 */
/**
 * Progression, expressed as distance on record.
 *
 * Named for the corridor lengths they represent rather than invented ranks:
 * "Line" is roughly one Cape Town commute corridor's worth, and so on. A number
 * that means something beats a badge that does not.
 */
const STAGES = [
  { at: 0, name: 'Starting out' },
  { at: 250, name: 'A line' },
  { at: 1_000, name: 'A network' },
  { at: 2_500, name: 'A habit' },
  { at: 6_000, name: 'A year of it' },
  { at: 15_000, name: 'Car-light' },
] as const

function stageFor(km: number) {
  let i = 0
  while (i + 1 < STAGES.length && km >= STAGES[i + 1].at) i++
  const current = STAGES[i]
  const next = i + 1 < STAGES.length ? STAGES[i + 1] : null
  const span = next ? next.at - current.at : 1
  return {
    name: current.name,
    next,
    progress: next ? Math.min(1, (km - current.at) / span) : 1,
  }
}

export function TravelRecord({
  trips,
  className,
  height = 260,
}: {
  trips: Trip[]
  className?: string
  height?: number
}) {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  const journeys = React.useMemo(
    () =>
      trips.filter(
        (t) =>
          t.verification !== 'unverified' &&
          (DISPLACING_MODES.includes(t.mode) || t.mode === 'walk' || t.mode === 'cycle'),
      ),
    [trips],
  )

  React.useEffect(() => {
    const canvas = ref.current
    if (!canvas || journeys.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let t0: number | null = null

    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent')
      .trim() || '#0E6B4A'

    function draw(elapsed: number) {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = canvas!.clientWidth
      const h = canvas!.clientHeight
      if (canvas!.width !== w * dpr || canvas!.height !== h * dpr) {
        canvas!.width = w * dpr
        canvas!.height = h * dpr
      }
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.clearRect(0, 0, w, h)

      // Common projection so corridors sit in true relative position.
      const all = journeys.flatMap((j) => j.path)
      const lngs = all.map((p) => p[0])
      const lats = all.map((p) => p[1])
      const minX = Math.min(...lngs)
      const maxX = Math.max(...lngs)
      const minY = Math.min(...lats)
      const maxY = Math.max(...lats)
      const kx = Math.cos((((minY + maxY) / 2) * Math.PI) / 180)

      const pad = 22
      const spanX = Math.max((maxX - minX) * kx, 1e-6)
      const spanY = Math.max(maxY - minY, 1e-6)
      const scale = Math.min((w - pad * 2) / spanX, (h - pad * 2) / spanY)
      const offX = pad + (w - pad * 2 - spanX * scale) / 2
      const offY = pad + (h - pad * 2 - spanY * scale) / 2

      // A slow breath, so the figure feels alive without ever demanding attention.
      const breath = reduced ? 0 : Math.sin(elapsed / 2600) * 0.0035

      ctx!.globalCompositeOperation = 'lighter'
      ctx!.strokeStyle = accent
      ctx!.lineCap = 'round'
      ctx!.lineJoin = 'round'

      for (const j of journeys) {
        ctx!.globalAlpha = j.verification === 'verified' ? 0.13 : 0.06
        ctx!.lineWidth = j.verification === 'verified' ? 1.5 : 1
        ctx!.beginPath()
        j.path.forEach(([lng, lat], i) => {
          const s = scale * (1 + breath)
          const x = offX + (lng - minX) * kx * s
          const y = offY + (maxY - lat) * s
          if (i === 0) ctx!.moveTo(x, y)
          else ctx!.lineTo(x, y)
        })
        ctx!.stroke()
      }

      ctx!.globalAlpha = 1
      ctx!.globalCompositeOperation = 'source-over'
    }

    function frame(ts: number) {
      if (t0 === null) t0 = ts
      draw(ts - t0)
      if (!reduced) raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    const ro = new ResizeObserver(() => draw(0))
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [journeys, reduced])

  const km = Math.round(journeys.reduce((a, j) => a + j.metres, 0) / 1000)
  const stage = stageFor(km)

  return (
    <div
      className={cx('relative overflow-hidden rounded-[--radius-card] bg-sunken', className)}
      style={{ height }}
    >
      <canvas ref={ref} className="h-full w-full" aria-hidden />

      {/* Scrim, so the figure can run behind the copy without fighting it. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            'linear-gradient(to top, var(--color-sunken) 22%, color-mix(in srgb, var(--color-sunken) 80%, transparent) 55%, transparent 100%)',
        }}
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
        <p className="tnum text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink">
          {km.toLocaleString('en-ZA')}
          <span className="ml-1 text-[13px] font-medium text-ink-faint">km on record</span>
        </p>
        <p className="mt-1.5 text-[12px] leading-[1.4] text-ink-muted">
          {journeys.length.toLocaleString('en-ZA')} journeys, each drawn where it actually
          happened. Routes you repeat burn brighter.
        </p>

        {stage.next && (
          <div className="mt-3">
            <div className="flex items-baseline justify-between text-[11px]">
              <span className="font-medium text-ink">{stage.name}</span>
              <span className="tnum text-ink-faint">
                {(stage.next.at - km).toLocaleString('en-ZA')} km to {stage.next.name}
              </span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-ink/10">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${stage.progress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {journeys.length === 0 && (
        <div className="absolute inset-0 grid place-items-center">
          <p className="text-[13px] text-ink-faint">Your record starts with your first trip.</p>
        </div>
      )}
    </div>
  )
}
