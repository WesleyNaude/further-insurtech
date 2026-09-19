import { Link } from '@tanstack/react-router'
import Tilt from 'react-parallax-tilt'
import NumberFlow from '@number-flow/react'
import { motion, useReducedMotion } from 'motion/react'
import { MoreVertical, ChevronRight, Sparkles } from 'lucide-react'
import { formatZl } from '@/lib/handback/money'
import { cx } from '@/lib/cx'
import { useTiltPermission } from '@/lib/useTiltPermission'

/**
 * The balance card.
 *
 * One raised surface carrying the only number that matters, so the rest of the
 * screen can be quiet. The texture behind it is drawn from the product rather
 * than decoration: overlapping route contours, at an opacity low enough that
 * you notice it only after the figure.
 *
 * It tilts. On a phone that is the gyroscope, so the card leans as the handset
 * does and a sheen crosses it, the way light moves on a physical card. That is
 * the one borrowed effect here, from react-parallax-tilt (MIT, 2.9 kB, no
 * dependencies), and the values are deliberately small: this is money a
 * household is owed, not a game.
 *
 * Everything else on offer in that space, animated border beams and cursor
 * spotlights, is built for marketing pages. On a benefits balance it would
 * read as crypto rather than as the city paying you back.
 */
export function BalanceCard({
  name,
  city,
  label,
  amountGr,
  todayGr,
  journeys,
}: {
  name: string
  city: string
  label: string
  amountGr: number
  todayGr: number
  journeys: number
}) {
  const reduced = useReducedMotion()
  const tilt = useTiltPermission()

  const zl = Math.floor(amountGr / 100)
  const gr = String(amountGr % 100).padStart(2, '0')

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const card = (
    <div className="relative overflow-hidden rounded-(--radius-card) bg-surface ring-1 ring-line">
        <RouteField reduced={Boolean(reduced)} />

        <div className="relative p-4">
          {/* who this belongs to */}
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sunken text-[12px] font-bold tracking-[0.02em] text-ink-muted">
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[16px] font-medium text-ink">{name}</span>
              <span className="block truncate text-[12px] text-ink-faint">{city}</span>
            </span>
            <Link
              to="/settings"
              aria-label="Account settings"
              className="tap grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-faint"
            >
              <MoreVertical size={18} strokeWidth={2} />
            </Link>
          </div>

          {/* the figure */}
          <p className="mt-6 text-[12px] font-medium uppercase tracking-[0.1em] text-ink-faint">
            {label}
          </p>

          <p className="tnum mt-1.5 flex items-baseline leading-[1.05]">
            <span className="text-[52px] font-bold tracking-[-0.03em] text-ink">
              <NumberFlow value={zl} locales="pl-PL" />
            </span>
            {/* Grosz sit back, the way cents do on a card. The eye wants the
                złoty and the decimals only get in its way. */}
            <span className="text-[52px] font-bold tracking-[-0.03em] text-ink-faint">
              ,{gr}
            </span>
            <span className="ml-2 text-[20px] font-medium text-ink-faint">zł</span>
          </p>

          <p className="tnum mt-2 flex items-center gap-2 text-[14px]">
            <span className={cx('font-medium', todayGr > 0 ? 'text-money' : 'text-ink-faint')}>
              {todayGr > 0 ? `+${formatZl(todayGr)}` : formatZl(0)} today
            </span>
            <span className="text-ink-faint">·</span>
            <span className="text-ink-faint">{journeys} journeys this month</span>
          </p>

          <Link
            to="/source"
            className="mt-4 inline-flex items-center gap-1 text-[14px] text-ink-muted"
          >
            Funded by the EU carbon charge on fuel
            <ChevronRight size={15} strokeWidth={2} className="text-ink-faint" />
          </Link>
        </div>
    </div>
  )

  // Reduced motion gets the card and none of the movement.
  if (reduced) return <div className="gutter">{card}</div>

  return (
    <div className="gutter">
      <Tilt
        // A handset is tilted further than a cursor ever travels, so the
        // gyroscope gets a wider angle and a stronger sheen than the pointer.
        tiltMaxAngleX={tilt.enabled ? 12 : 6}
        tiltMaxAngleY={tilt.enabled ? 12 : 6}
        perspective={1200}
        scale={1.01}
        transitionSpeed={tilt.enabled ? 400 : 900}
        gyroscope={tilt.enabled}
        glareEnable
        glareMaxOpacity={tilt.enabled ? 0.22 : 0.12}
        glareBorderRadius="8px"
        glarePosition="all"
        className="rounded-(--radius-card)"
      >
        {card}
      </Tilt>

      {tilt.state === 'needs-permission' && (
        <button
          onClick={tilt.request}
          className="tap mt-2 inline-flex items-center gap-1.5 text-[13px] text-ink-muted"
        >
          <Sparkles size={13} strokeWidth={1.9} />
          Let the card catch the light as you tilt
        </button>
      )}

      {tilt.state === 'insecure' && (
        <p className="mt-2 text-[12px] leading-[1.5] text-ink-faint">
          Tilt lighting needs a secure connection. Open this over https and the card will
          respond to how you hold the phone.
        </p>
      )}
    </div>
  )
}

/**
 * The texture: corridors, overlapping.
 *
 * Solflare and friends use a moiré wave, which is pure ornament. These are
 * arcs at the angles of the lines Marta actually rides, so the card is made of
 * the same thing the app is about. Barely visible on purpose.
 */
function RouteField({ reduced }: { reduced: boolean }) {
  const paths = [
    'M-20 120 C 90 118, 180 88, 300 34',
    'M-20 146 C 90 142, 180 108, 300 52',
    'M-20 172 C 90 168, 180 130, 300 72',
    'M-20 198 C 90 192, 180 152, 300 94',
    'M-20 224 C 90 218, 180 176, 300 118',
  ]

  return (
    <svg
      viewBox="0 0 300 200"
      preserveAspectRatio="xMaxYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="bc-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0" />
          <stop offset="60%" stopColor="var(--color-ink)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--color-ink)" stopOpacity="1" />
        </linearGradient>
        <mask id="bc-mask">
          <rect width="300" height="200" fill="url(#bc-fade)" />
        </mask>
      </defs>

      <g mask="url(#bc-mask)" opacity="0.07">
        {paths.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth={i === 2 ? 1.4 : 0.9}
            strokeLinecap="round"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: reduced ? 0 : 1.1,
              delay: reduced ? 0 : i * 0.07,
              ease: [0.32, 0.72, 0, 1],
            }}
          />
        ))}
      </g>
    </svg>
  )
}
