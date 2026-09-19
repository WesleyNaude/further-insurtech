import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cx } from '@/lib/cx'

export interface Series {
  key: string
  label: string
  colour: string
}

export interface Datum {
  label: string
  values: Record<string, number>
}

/**
 * A grouped bar chart, drawn by hand.
 *
 * Charting libraries ship a general solution to a problem we do not have: this
 * is one chart, with two series and a fixed shape. Drawing it directly keeps the
 * visual language identical to the route figure, costs about 2 kB instead of
 * 358 kB, and lets the bars animate in with the same spring as everything else.
 */
export function BarChart({
  data,
  series,
  unit = '',
  height = 200,
  className,
}: {
  data: Datum[]
  series: Series[]
  unit?: string
  height?: number
  className?: string
}) {
  const [active, setActive] = React.useState<number | null>(null)
  const reduced = useReducedMotion()

  const max = Math.max(
    1,
    ...data.flatMap((d) => series.map((s) => d.values[s.key] ?? 0)),
  )
  // Round the axis up to something a person would choose.
  const step = niceStep(max)
  const top = Math.ceil(max / step) * step
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step)

  const AXIS_W = 34
  const PLOT_H = height - 26 // leave room for the x labels

  return (
    <div className={cx('w-full select-none', className)}>
      <div className="flex" style={{ height }}>
        {/* y axis */}
        <div
          className="relative shrink-0 text-right"
          style={{ width: AXIS_W, height: PLOT_H }}
          aria-hidden
        >
          {ticks.map((t) => (
            <span
              key={t}
              className="tnum absolute right-0 -translate-y-1/2 pr-2 text-[12px] text-ink-faint"
              style={{ top: PLOT_H - (t / top) * PLOT_H }}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* gridlines */}
          <div className="absolute inset-x-0" style={{ height: PLOT_H }} aria-hidden>
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute inset-x-0 h-px bg-line"
                style={{ top: PLOT_H - (t / top) * PLOT_H }}
              />
            ))}
          </div>

          {/* bars */}
          <div className="relative flex items-end" style={{ height: PLOT_H }}>
            {data.map((d, i) => (
              <button
                key={d.label}
                onClick={() => setActive(active === i ? null : i)}
                aria-label={`${d.label}: ${series.map((s) => `${d.values[s.key] ?? 0} ${unit} ${s.label}`).join(', ')}`}
                className="group relative flex h-full flex-1 items-end justify-center gap-[3px] px-[3px]"
              >
                {series.map((s) => {
                  const v = d.values[s.key] ?? 0
                  return (
                    <motion.span
                      key={s.key}
                      initial={reduced ? false : { height: 0 }}
                      animate={{ height: `${(v / top) * 100}%` }}
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 260, damping: 30, delay: i * 0.035 }
                      }
                      className="w-full max-w-[14px] rounded-t-[3px]"
                      style={{
                        background: s.colour,
                        opacity: active === null || active === i ? 1 : 0.35,
                      }}
                    />
                  )
                })}

                {active === i && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pointer-events-none absolute bottom-full z-10 mb-1 whitespace-nowrap rounded-[8px] bg-ink px-2 py-1 text-[12px] font-medium text-paper shadow-[--shadow-lift]"
                  >
                    {series.map((s) => (
                      <span key={s.key} className="tnum block">
                        {d.values[s.key] ?? 0} {unit} {s.label.toLowerCase()}
                      </span>
                    ))}
                  </motion.span>
                )}
              </button>
            ))}
          </div>

          {/* x labels */}
          <div className="flex">
            {data.map((d, i) => (
              <span
                key={d.label}
                className={cx(
                  'flex-1 pt-2 text-center text-[12px]',
                  active === i ? 'font-medium text-ink' : 'text-ink-faint',
                )}
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 pl-[34px] text-[12px] text-ink-muted">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px]" style={{ background: s.colour }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/** 1, 2 or 5 times a power of ten, so axis labels are numbers people recognise. */
function niceStep(max: number): number {
  const rough = max / 4
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const n = rough / mag
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag
}
