import { Car, TrainFront, Bus, Footprints, Bike, CircleDashed } from 'lucide-react'
import type { Mode } from '@/lib/domain/types'
import { cx } from '@/lib/cx'

export const MODE_LABEL: Record<Mode, string> = {
  car: 'Drove',
  train: 'Train',
  bus: 'Bus',
  taxi: 'Taxi',
  walk: 'Walked',
  cycle: 'Cycled',
}

const MAP = { car: Car, train: TrainFront, bus: Bus, taxi: Bus, walk: Footprints, cycle: Bike }

export function ModeIcon({ mode, size = 18 }: { mode: Mode; size?: number }) {
  const Icon = MAP[mode] ?? CircleDashed
  return <Icon size={size} strokeWidth={1.75} />
}

/** Circular mode avatar. Car is the only mode that reads as a cost. */
export function ModeAvatar({ mode, size = 40 }: { mode: Mode; size?: number }) {
  const isCar = mode === 'car'
  return (
    <span
      style={{ width: size, height: size }}
      className={cx(
        'grid shrink-0 place-items-center rounded-full',
        isCar ? 'bg-car-soft text-car' : 'bg-accent-soft text-accent-ink',
      )}
    >
      <ModeIcon mode={mode} size={size * 0.45} />
    </span>
  )
}
