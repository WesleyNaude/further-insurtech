import * as React from 'react'
import { Drawer } from 'vaul'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import type { Goal } from '@/lib/handback/types'
import { nextMay } from '@/lib/handback/data'
import { tap } from '@/lib/haptics'
import { cx } from '@/lib/cx'

/** Plausible things a Kraków household saves for, so the common case is two
 *  taps rather than a blank form. Every field stays editable afterwards. */
const PRESETS: { id: string; label: string; targetGr: number; dueOn: () => string }[] = [
  { id: 'school-trip', label: 'School trip', targetGr: 32_000, dueOn: () => nextMay() },
  { id: 'winter-tyres', label: 'Winter tyres', targetGr: 80_000, dueOn: () => dateIn(10) },
  { id: 'christmas', label: 'Christmas', targetGr: 60_000, dueOn: () => decemberTwentieth() },
  { id: 'holiday', label: 'Holiday', targetGr: 150_000, dueOn: () => dateIn(12) },
  { id: 'rainy-day', label: 'Rainy day', targetGr: 50_000, dueOn: () => dateIn(12) },
]

/** Local date key. `toISOString` would shift CET back a day. */
function key(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function dateIn(months: number, now = new Date()) {
  const d = new Date(now)
  d.setMonth(d.getMonth() + months)
  return key(d)
}
function decemberTwentieth(now = new Date()) {
  const year = now.getMonth() > 11 || (now.getMonth() === 11 && now.getDate() > 20)
    ? now.getFullYear() + 1
    : now.getFullYear()
  return `${year}-12-20`
}

export function GoalEditor({
  open,
  onOpenChange,
  goal,
  onSave,
  onRemove,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  goal: Goal | null
  onSave: (g: Goal) => void
  onRemove: () => void
}) {
  const [label, setLabel] = React.useState('')
  const [zl, setZl] = React.useState('')
  const [dueOn, setDueOn] = React.useState('')

  // Reload the form from the goal each time it opens, so a cancelled edit
  // does not leak into the next one.
  React.useEffect(() => {
    if (!open) return
    setLabel(goal?.label ?? '')
    setZl(goal ? String(Math.round(goal.targetGr / 100)) : '')
    setDueOn(goal?.dueOn ?? nextMay())
  }, [open, goal])

  const targetGr = Math.round(Number(zl.replace(',', '.')) * 100)
  const valid = label.trim().length > 0 && Number.isFinite(targetGr) && targetGr > 0 && !!dueOn

  function applyPreset(p: (typeof PRESETS)[number]) {
    setLabel(p.label)
    setZl(String(p.targetGr / 100))
    setDueOn(p.dueOn())
    tap()
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Drawer.Content
          className={cx(
            'safe-bottom fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md outline-none',
            'rounded-t-(--radius-sheet) bg-paper ring-1 ring-line',
          )}
        >
          <div className="mx-auto mt-3 h-1 w-9 rounded-full bg-line" aria-hidden />
          <div className="gutter pb-8 pt-4">
            <Drawer.Title className="text-[20px] font-bold tracking-[-0.02em]">
              {goal ? 'Change what you are saving for' : 'Choose something to save for'}
            </Drawer.Title>
            <Drawer.Description className="mt-1.5 text-[14px] leading-[1.55] text-ink-muted">
              It is easier to leave money alone when it has a name on it. You can change or
              remove this at any time, and the money stays yours either way.
            </Drawer.Description>

            <div className="mt-5 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={cx(
                    'tap h-9 rounded-(--radius-pill) px-3.5 text-[13px] font-medium ring-1 transition-colors',
                    label === p.label
                      ? 'bg-accent text-on-accent ring-accent'
                      : 'bg-surface text-ink-muted ring-line',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Field label="Name">
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="What is it for?"
                maxLength={40}
                className={inputCx}
              />
            </Field>

            <Field label="How much you need">
              <div className="relative">
                <input
                  value={zl}
                  onChange={(e) => setZl(e.target.value.replace(/[^\d.,]/g, ''))}
                  inputMode="decimal"
                  placeholder="0"
                  className={cx(inputCx, 'tnum pr-10')}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[15px] text-ink-faint">
                  zł
                </span>
              </div>
            </Field>

            <Field label="By when">
              <input
                type="date"
                value={dueOn}
                min={key(new Date())}
                onChange={(e) => setDueOn(e.target.value)}
                className={cx(inputCx, 'tnum')}
              />
            </Field>

            <Button
              variant="accent"
              size="lg"
              className="mt-6 w-full"
              disabled={!valid}
              onClick={() => {
                onSave({
                  id: goal?.id ?? `goal-${Date.now()}`,
                  label: label.trim(),
                  targetGr,
                  dueOn,
                })
                onOpenChange(false)
              }}
            >
              {goal ? 'Save changes' : 'Start saving for this'}
            </Button>

            {goal && (
              <Button
                variant="ghost"
                className="mt-2 w-full"
                onClick={() => {
                  onRemove()
                  onOpenChange(false)
                }}
              >
                <Trash2 size={15} strokeWidth={1.9} />
                Remove this goal
              </Button>
            )}
            <p className="mt-3 text-center text-[12px] leading-[1.5] text-ink-faint">
              Removing the goal does not spend or return anything. The money stays where it is.
            </p>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

const inputCx =
  'h-12 w-full rounded-(--radius-control) bg-surface px-3.5 text-[15px] text-ink ring-1 ring-line ' +
  'placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  )
}
