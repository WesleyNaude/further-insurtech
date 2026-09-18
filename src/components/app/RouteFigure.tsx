import * as React from 'react'
import { motion } from 'motion/react'
import { cx } from '@/lib/cx'

/**
 * The corridor figure.
 *
 * We deliberately do not use a tiled basemap. A street map answers "where is
 * this", which the user already knows. The question this screen answers is
 * "does my path match the published alignment", so the drawing shows exactly
 * that and nothing else: the alignment underneath, the trip on top, the
 * endpoints, and the corridor tolerance band. It also renders offline,
 * screenshots cleanly, and costs nothing to serve.
 */

type Pt = [number, number]

function project(points: Pt[], w: number, h: number, pad: number) {
  const lngs = points.map((p) => p[0])
  const lats = points.map((p) => p[1])
  const minX = Math.min(...lngs)
  const maxX = Math.max(...lngs)
  const minY = Math.min(...lats)
  const maxY = Math.max(...lats)

  // Web-mercator-ish: latitude degrees are wider than longitude at this scale.
  const midLat = (minY + maxY) / 2
  const kx = Math.cos((midLat * Math.PI) / 180)

  const spanX = Math.max((maxX - minX) * kx, 1e-6)
  const spanY = Math.max(maxY - minY, 1e-6)

  const iw = w - pad * 2
  const ih = h - pad * 2
  const scale = Math.min(iw / spanX, ih / spanY)

  const offX = pad + (iw - spanX * scale) / 2
  const offY = pad + (ih - spanY * scale) / 2

  return (p: Pt): Pt => [
    offX + (p[0] - minX) * kx * scale,
    offY + (maxY - p[1]) * scale, // y is flipped
  ]
}

/** Catmull-Rom to cubic Bezier, so the line reads as a route and not a zigzag. */
function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return ''
  if (pts.length === 2) return `M${pts[0][0]},${pts[0][1]} L${pts[1][0]},${pts[1][1]}`

  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`
  }
  return d
}

export function RouteFigure({
  path,
  corridor,
  className,
  tone = 'accent',
  animate = true,
  showBand = true,
  compact = false,
}: {
  path: Pt[]
  corridor?: Pt[]
  className?: string
  tone?: 'accent' | 'car' | 'muted'
  animate?: boolean
  showBand?: boolean
  compact?: boolean
}) {
  const W = 400
  const H = compact ? 120 : 300
  const pad = compact ? 16 : 34

  const all = React.useMemo(() => [...(corridor ?? []), ...path], [corridor, path])
  const to = React.useMemo(() => project(all, W, H, pad), [all, H, pad])

  const tripPts = path.map(to)
  const corridorPts = (corridor ?? []).map(to)

  const tripD = smoothPath(tripPts)
  const corridorD = corridorPts.length ? smoothPath(corridorPts) : ''

  const stroke =
    tone === 'car'
      ? 'var(--color-car)'
      : tone === 'muted'
        ? 'var(--color-ink-faint)'
        : 'var(--color-accent)'

  const uid = React.useId().replace(/:/g, '')

  return (
    <div className={cx('relative overflow-hidden', className)}>
      {/* graticule: a quiet reference grid rather than fake streets */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <pattern id={`grid-${uid}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0 L0 0 0 20" fill="none" stroke="var(--color-line)" strokeWidth="1" />
          </pattern>
          <radialGradient id={`fade-${uid}`} cx="50%" cy="50%" r="62%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id={`mask-${uid}`}>
            <rect width={W} height={H} fill={`url(#fade-${uid})`} />
          </mask>
        </defs>
        <rect width={W} height={H} fill={`url(#grid-${uid})`} mask={`url(#mask-${uid})`} />
      </svg>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Route compared against the published corridor"
      >
        {/* corridor tolerance band */}
        {corridorD && showBand && (
          <path
            d={corridorD}
            fill="none"
            stroke={stroke}
            strokeOpacity={0.09}
            strokeWidth={compact ? 12 : 26}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* published alignment */}
        {corridorD && (
          <path
            d={corridorD}
            fill="none"
            stroke="var(--color-line-strong)"
            strokeWidth={compact ? 2 : 3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 7"
          />
        )}

        {/* the trip */}
        <motion.path
          d={tripD}
          fill="none"
          stroke={stroke}
          strokeWidth={compact ? 2.5 : 3.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animate ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: [0.32, 0.72, 0, 1] }}
        />

        {/* Intermediate stops. Only drawn when the points are sparse enough to
            mean something; a dense GPS trace would read as a string of beads. */}
        {!compact &&
          tripPts.length <= 14 &&
          tripPts.slice(1, -1).map(([x, y], i) => (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={2.6}
              fill="var(--color-surface)"
              stroke={stroke}
              strokeWidth={1.6}
              initial={animate ? { scale: 0, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.07, type: 'spring', stiffness: 400, damping: 22 }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />
          ))}

        {/* endpoints */}
        {[tripPts[0], tripPts[tripPts.length - 1]].map(([x, y], i) => (
          <g key={i}>
            <motion.circle
              cx={x}
              cy={y}
              r={compact ? 5 : 7}
              fill="var(--color-surface)"
              stroke={stroke}
              strokeWidth={compact ? 2 : 2.6}
              initial={animate ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: i === 0 ? 0.1 : 1.2, type: 'spring', stiffness: 380, damping: 20 }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />
            {i === 1 && (
              <motion.circle
                cx={x}
                cy={y}
                r={compact ? 2 : 2.8}
                fill={stroke}
                initial={animate ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                transition={{ delay: 1.3, type: 'spring', stiffness: 380, damping: 20 }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
