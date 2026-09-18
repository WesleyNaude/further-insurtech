import { Link } from '@tanstack/react-router'
import { ShieldCheck, ShieldQuestion, ShieldAlert, ChevronRight } from 'lucide-react'
import type { Trip } from '@/lib/domain/types'
import { ModeAvatar, MODE_LABEL } from './icons'
import { formatRand } from '@/lib/domain/money'
import { cx } from '@/lib/cx'

const VERIFY = {
  verified: { Icon: ShieldCheck, label: 'Verified', className: 'text-accent' },
  probable: { Icon: ShieldQuestion, label: 'Probable', className: 'text-warn' },
  unverified: { Icon: ShieldAlert, label: 'Not counted', className: 'text-ink-faint' },
} as const

export function VerificationMark({ level, withLabel = false }: { level: Trip['verification']; withLabel?: boolean }) {
  const { Icon, label, className } = VERIFY[level]
  return (
    <span className={cx('inline-flex items-center gap-1 text-[12px]', className)}>
      <Icon size={13} strokeWidth={2} />
      {withLabel && label}
    </span>
  )
}

export function TripRow({ trip }: { trip: Trip }) {
  const time = new Date(trip.startedAt).toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const day = new Date(trip.startedAt).toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  return (
    <Link
      to="/trips/$tripId"
      params={{ tripId: trip.id }}
      className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors duration-100 active:bg-sunken"
    >
      <ModeAvatar mode={trip.mode} />

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[15px] font-medium text-ink">
            {trip.fromName} to {trip.toName}
          </span>
          <VerificationMark level={trip.verification} />
        </span>
        <span className="mt-0.5 block truncate text-[13px] text-ink-muted">
          {MODE_LABEL[trip.mode]} · {(trip.metres / 1000).toFixed(1)} km · {day}, {time}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-1">
        {trip.creditedCents > 0 ? (
          <span className="tnum text-[15px] font-semibold text-accent">
            +{formatRand(trip.creditedCents, { decimals: true })}
          </span>
        ) : trip.mode === 'car' ? (
          <span className="text-[13px] text-ink-faint">Drove</span>
        ) : (
          <span className="text-[13px] text-ink-faint">—</span>
        )}
        <ChevronRight size={16} strokeWidth={2} className="text-ink-faint" />
      </span>
    </Link>
  )
}
