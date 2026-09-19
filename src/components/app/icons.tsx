import { Flame, Sun, Wind, type LucideIcon } from 'lucide-react'
import type { InterventionKind } from '@/lib/flight/types'

export const INTERVENTION_ICON: Record<InterventionKind, LucideIcon> = {
  lpg: Flame,
  solar: Sun,
  heatpump: Wind,
}
