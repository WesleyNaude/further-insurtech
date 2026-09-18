import * as React from 'react'
import { Drawer } from 'vaul'
import { X, RotateCcw } from 'lucide-react'
import { useStore } from '@/lib/store'
import { POLICY } from '@/lib/domain/seed'
import { formatRand } from '@/lib/domain/money'
import { buildStatement, MAX_REDUCTION } from '@/lib/domain/engine'
import { useStatement } from '@/lib/useStatement'
import { Button, Divider } from '@/components/ui/primitives'
import { tap } from '@/lib/haptics'

/**
 * A live policy, so the model can be argued with.
 *
 * The figures in this app are only persuasive if someone can push on them. Move
 * the premium and the rated mileage and every screen re-derives, because there
 * is exactly one place the maths lives. It is also the fastest way to show that
 * the reduction is a function of exposure and not a number we chose.
 */
export function PolicyEditor({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const policy = useStore((s) => s.policy)
  const setPolicy = useStore((s) => s.setPolicy)
  const { monthTrips } = useStatement()

  // Preview against the same engine the rest of the app uses.
  const preview = React.useMemo(
    () => buildStatement(monthTrips, policy, fractionOfMonth()),
    [monthTrips, policy],
  )

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] max-w-md flex-col rounded-t-[--radius-sheet] bg-paper outline-none">
          <div className="mx-auto mt-3 h-1 w-9 shrink-0 rounded-full bg-line-strong" />

          <div className="gutter flex items-center justify-between py-4">
            <div>
              <Drawer.Title className="text-[17px] font-semibold tracking-[-0.01em]">
                Your policy
              </Drawer.Title>
              <Drawer.Description className="mt-0.5 text-[13px] text-ink-muted">
                Change these and every figure in the app re-derives.
              </Drawer.Description>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sunken text-ink-muted"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          <div className="no-scrollbar gutter overflow-y-auto pb-10">
            <Slider
              label="Monthly premium"
              value={policy.basePremiumCents}
              min={50_000}
              max={500_000}
              step={5_000}
              format={(v) => formatRand(v)}
              onChange={(v) => setPolicy({ basePremiumCents: v })}
            />

            <Slider
              label="Rated annual mileage"
              value={policy.ratedAnnualKm}
              min={5_000}
              max={45_000}
              step={1_000}
              format={(v) => `${v.toLocaleString('en-ZA')} km`}
              onChange={(v) => setPolicy({ ratedAnnualKm: v })}
            />

            <div className="mt-6 rounded-[--radius-card] bg-sunken p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[14px] text-ink-muted">You would take back</span>
                <span className="tnum text-[22px] font-semibold text-accent">
                  {formatRand(preview.reductionCents)}
                </span>
              </div>
              <Divider className="my-3" />
              <Line
                label="Reduction"
                value={`${Math.round(preview.premiumReduction * 100)}% of ${Math.round(MAX_REDUCTION * 100)}%`}
              />
              <Line
                label="Rated this month"
                value={`${Math.round(preview.ratedKm).toLocaleString('en-ZA')} km`}
              />
              <Line
                label="Driven"
                value={`${Math.round(preview.drivenKm).toLocaleString('en-ZA')} km`}
              />
              <Line
                label="Worth per verified km"
                value={`${(preview.centsPerVerifiedKm / 100).toFixed(2)} R/km`}
              />
              {preview.cappedByCeiling && (
                <p className="mt-3 text-[12px] leading-[1.5] text-ink-faint">
                  Capped. At this premium and mileage you have earned more than the ceiling
                  allows, so the extra is not paid.
                </p>
              )}
            </div>

            <Button
              className="mt-4 w-full"
              onClick={() => {
                setPolicy({
                  basePremiumCents: POLICY.basePremiumCents,
                  ratedAnnualKm: POLICY.ratedAnnualKm,
                })
                tap()
              }}
            >
              <RotateCcw size={15} strokeWidth={2} />
              Back to the defaults
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}) {
  return (
    <div className="mt-5 first:mt-0">
      <div className="flex items-baseline justify-between">
        <label className="text-[14px] text-ink-muted" htmlFor={label}>
          {label}
        </label>
        <span className="tnum text-[15px] font-semibold text-ink">{format(value)}</span>
      </div>
      <input
        id={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-11 w-full cursor-pointer appearance-none bg-transparent
          [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-sunken
          [&::-webkit-slider-thumb]:mt-[-9px] [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-[--shadow-card]
          [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-sunken
          [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent"
      />
    </div>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className="tnum text-[13px] font-medium text-ink">{value}</span>
    </div>
  )
}

function fractionOfMonth(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return (now.getTime() - start.getTime()) / (end.getTime() - start.getTime())
}
