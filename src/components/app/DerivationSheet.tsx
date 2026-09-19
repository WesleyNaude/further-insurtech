import { Drawer } from 'vaul'
import { X } from 'lucide-react'
import { Divider } from '@/components/ui/primitives'

export interface Step {
  label: string
  value: string
  note: string
}

/**
 * The transparency sheet.
 *
 * Carried over from the brief's best instruction: every number tappable, back
 * to where it came from. A reward built on a calculation nobody can inspect is
 * a reward nobody should believe.
 */
export function DerivationSheet({
  open,
  onOpenChange,
  title,
  intro,
  steps,
  footer,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  intro: string
  steps: Step[]
  footer?: React.ReactNode
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] max-w-md flex-col rounded-t-[--radius-sheet] bg-paper outline-none">
          <div className="mx-auto mt-3 h-1 w-9 shrink-0 rounded-full bg-line-strong" />

          <div className="gutter flex items-center justify-between gap-3 py-4">
            <Drawer.Title className="text-[17px] font-semibold tracking-[-0.01em]">
              {title}
            </Drawer.Title>
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sunken text-ink-muted"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          <div className="no-scrollbar gutter overflow-y-auto pb-10">
            <p className="mb-6 text-[14px] leading-[1.55] text-ink-muted">{intro}</p>

            <ol>
              {steps.map((step, i) => (
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

            {footer && <div className="mt-4">{footer}</div>}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
