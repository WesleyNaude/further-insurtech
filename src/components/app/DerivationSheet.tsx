import * as React from 'react'
import { Drawer } from 'vaul'
import { X } from 'lucide-react'
import type { Statement } from '@/lib/domain/engine'
import { Divider } from '@/components/ui/primitives'

/**
 * The transparency screen. Carried over from the original brief's best idea:
 * "where every number came from, tappable". Every figure in the app that
 * represents money can open this.
 */
export function DerivationSheet({
  open,
  onOpenChange,
  statement,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  statement: Statement
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] max-w-md flex-col rounded-t-[--radius-sheet] bg-paper outline-none">
          <div className="mx-auto mt-3 h-1 w-9 shrink-0 rounded-full bg-line-strong" />

          <div className="gutter flex items-center justify-between py-4">
            <Drawer.Title className="text-[17px] font-semibold tracking-[-0.01em]">
              How this is worked out
            </Drawer.Title>
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-full bg-sunken text-ink-muted"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          <div className="no-scrollbar gutter overflow-y-auto pb-10">
            <p className="mb-6 text-[14px] leading-[1.55] text-ink-muted">
              Your reduction is not a bonus and it is not carbon money. It is a share of the
              claims cost your insurer no longer expects to carry, because you drove fewer
              kilometres than your premium assumed.
            </p>

            <ol className="space-y-0">
              {statement.derivation.map((step, i) => (
                <li key={step.label}>
                  {i > 0 && <Divider />}
                  <div className="flex items-start gap-4 py-4">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sunken text-[11px] font-medium tabular-nums text-ink-muted">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[14px] text-ink-muted">{step.label}</span>
                        <span className="tnum shrink-0 text-[15px] font-semibold text-ink">
                          {step.value}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] leading-[1.5] text-ink-faint">{step.note}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-4 rounded-[--radius-card] bg-sunken p-4">
              <p className="text-[13px] leading-[1.55] text-ink-muted">
                <strong className="font-medium text-ink">What this is not.</strong> This does not
                offset, neutralise or cancel any emissions, and it is not a carbon credit. The
                kilograms shown on the Impact tab are a consequence of driving less, reported for
                interest only. No insurer or regulator has endorsed this calculation.
              </p>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
