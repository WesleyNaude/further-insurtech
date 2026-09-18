import * as React from 'react'
import { Drawer } from 'vaul'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { CORRIDORS } from '@/lib/domain/corridors'
import type { Mode, Trip } from '@/lib/domain/types'
import { useStore } from '@/lib/store'
import { ModeIcon, MODE_LABEL } from './icons'
import { Button } from '@/components/ui/primitives'
import { cx } from '@/lib/cx'

/**
 * In production this is passive: the phone detects the trip and classifies the
 * mode. The demo needs a way to create one, so this is the manual equivalent,
 * and it is honest about its own weaker evidence: a self-logged trip lands at
 * "probable", never "verified".
 */
export function LogTripSheet({
  open,
  onOpenChange,
  onLogged,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onLogged: (tripId: string) => void
}) {
  const addTrip = useStore((s) => s.addTrip)
  const [corridorId, setCorridorId] = React.useState(CORRIDORS[0].id)
  const corridor = CORRIDORS.find((c) => c.id === corridorId)!
  const [mode, setMode] = React.useState<Mode>(corridor.modes[0])

  React.useEffect(() => {
    if (!corridor.modes.includes(mode)) setMode(corridor.modes[0])
  }, [corridorId]) // eslint-disable-line react-hooks/exhaustive-deps

  function submit() {
    const id = `t_manual_${Date.now()}`
    const trip: Trip = {
      id,
      startedAt: new Date().toISOString(),
      mode,
      fromName: corridor.fromName,
      toName: corridor.toName,
      metres: corridor.metres,
      corridorId: corridor.id,
      path: corridor.path,
      verification: 'probable',
      evidence: [
        { kind: 'corridor', label: 'Corridor match', detail: `Matched the ${corridor.name} alignment`, passed: true },
        { kind: 'self', label: 'You logged this', detail: 'Self-reported trips count at probable, never at verified.', passed: true },
      ],
      creditedCents: 0,
    }
    addTrip(trip)
    onOpenChange(false)
    toast.success('Trip logged', { description: 'Counted as probable until it is verified.' })
    setTimeout(() => onLogged(id), 180)
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] max-w-md flex-col rounded-t-[--radius-sheet] bg-paper outline-none">
          <div className="mx-auto mt-3 h-1 w-9 shrink-0 rounded-full bg-line-strong" />
          <div className="gutter py-4">
            <Drawer.Title className="text-[17px] font-semibold tracking-[-0.01em]">
              Log a trip
            </Drawer.Title>
            <Drawer.Description className="mt-1 text-[13px] text-ink-muted">
              Normally detected automatically. Logged by hand, it counts at probable.
            </Drawer.Description>
          </div>

          <div className="no-scrollbar gutter overflow-y-auto pb-8">
            <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
              Corridor
            </p>
            <div className="space-y-2">
              {CORRIDORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCorridorId(c.id)}
                  className={cx(
                    'flex w-full items-center gap-3 rounded-[--radius-card] px-4 py-3 text-left ring-1 transition-colors',
                    corridorId === c.id
                      ? 'bg-surface ring-ink'
                      : 'bg-surface ring-line active:bg-sunken',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">
                      {c.fromName} to {c.toName}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-ink-muted">
                      {c.name} · {(c.metres / 1000).toFixed(1)} km
                    </span>
                  </span>
                  {corridorId === c.id && <Check size={18} strokeWidth={2.2} className="text-ink" />}
                </button>
              ))}
            </div>

            <p className="mb-2 mt-6 text-[13px] font-medium uppercase tracking-[0.08em] text-ink-faint">
              Mode
            </p>
            <div className="flex flex-wrap gap-2">
              {corridor.modes.map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cx(
                    'inline-flex items-center gap-2 rounded-[--radius-pill] px-4 py-2 text-[14px] font-medium ring-1 transition-colors',
                    mode === m ? 'bg-ink text-paper ring-ink' : 'bg-surface text-ink ring-line',
                  )}
                >
                  <ModeIcon mode={m} size={16} />
                  {MODE_LABEL[m]}
                </button>
              ))}
            </div>

            <Button variant="accent" size="lg" className="mt-8 w-full" onClick={submit}>
              Log trip
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
