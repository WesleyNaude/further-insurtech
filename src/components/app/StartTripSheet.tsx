import { Drawer } from 'vaul'
import { useNavigate } from '@tanstack/react-router'
import { Navigation, PencilLine, CalendarPlus } from 'lucide-react'
import { cx } from '@/lib/cx'

/**
 * The FAB's action sheet. Three ways a trip enters the system, ordered by how
 * much we can stand behind the result: measured, planned, then asserted.
 */
export function StartTripSheet({
  open,
  onOpenChange,
  onManual,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onManual: () => void
}) {
  const navigate = useNavigate()

  const options = [
    {
      icon: Navigation,
      title: 'Track this trip',
      body: 'Measured on this device as you travel. The only route to verified.',
      tone: 'accent' as const,
      onClick: () => {
        onOpenChange(false)
        navigate({ to: '/track' })
      },
    },
    {
      icon: CalendarPlus,
      title: 'Plan a trip',
      body: 'Compare the fare against driving, and commit to it.',
      tone: 'neutral' as const,
      onClick: () => {
        onOpenChange(false)
        navigate({ to: '/plan' })
      },
    },
    {
      icon: PencilLine,
      title: 'Log one by hand',
      body: 'For a trip already taken. Counts at probable, never verified.',
      tone: 'neutral' as const,
      onClick: () => {
        onOpenChange(false)
        setTimeout(onManual, 160)
      },
    },
  ]

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md flex-col rounded-t-[--radius-sheet] bg-paper outline-none">
          <div className="mx-auto mt-3 h-1 w-9 shrink-0 rounded-full bg-line-strong" />
          <div className="gutter py-4">
            <Drawer.Title className="text-[17px] font-semibold tracking-[-0.01em]">
              Add a trip
            </Drawer.Title>
          </div>

          <div className="gutter space-y-2 pb-10">
            {options.map(({ icon: Icon, title, body, tone, onClick }) => (
              <button
                key={title}
                onClick={onClick}
                className="flex w-full items-start gap-3 rounded-[--radius-card] bg-surface p-4 text-left ring-1 ring-line transition-colors active:bg-sunken"
              >
                <span
                  className={cx(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-full',
                    tone === 'accent'
                      ? 'bg-accent text-on-accent'
                      : 'bg-sunken text-ink-muted',
                  )}
                >
                  <Icon size={18} strokeWidth={1.85} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-ink">{title}</span>
                  <span className="mt-0.5 block text-[13px] leading-[1.45] text-ink-muted">
                    {body}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
