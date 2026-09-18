/** Great-circle distance in metres. */
export function haversine(a: [number, number], b: [number, number]): number {
  const R = 6_371_000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[1] - a[1])
  const dLng = toRad(b[0] - a[0])
  const la1 = toRad(a[1])
  const la2 = toRad(b[1])
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function pathLength(pts: [number, number][]): number {
  let total = 0
  for (let i = 1; i < pts.length; i++) total += haversine(pts[i - 1], pts[i])
  return total
}

/** Perpendicular-ish distance from a point to a polyline, in metres. */
export function distanceToPath(p: [number, number], line: [number, number][]): number {
  let best = Infinity
  for (let i = 1; i < line.length; i++) {
    best = Math.min(best, distanceToSegment(p, line[i - 1], line[i]))
  }
  return best
}

function distanceToSegment(p: [number, number], a: [number, number], b: [number, number]) {
  // Flat-earth projection is fine over a few kilometres.
  const kx = Math.cos((a[1] * Math.PI) / 180) * 111_320
  const ky = 110_540
  const px = (p[0] - a[0]) * kx
  const py = (p[1] - a[1]) * ky
  const bx = (b[0] - a[0]) * kx
  const by = (b[1] - a[1]) * ky
  const len2 = bx * bx + by * by
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, (px * bx + py * by) / len2))
  const dx = px - bx * t
  const dy = py - by * t
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Mode classification from speed alone.
 *
 * Deliberately conservative and deliberately legible: this is a first pass that
 * a real product would combine with accelerometer cadence, corridor match and a
 * fare tap. It never returns "car" from speed alone, because a train and a car
 * at 70 km/h look identical, and guessing wrong in the member's favour is the
 * expensive mistake.
 */
export function classifyFromSpeeds(speedsMs: number[]): {
  mode: 'walk' | 'cycle' | 'road' | 'rail-or-road' | 'unknown'
  medianKmh: number
  p90Kmh: number
} {
  const kmh = speedsMs.filter((s) => Number.isFinite(s) && s >= 0).map((s) => s * 3.6).sort((a, b) => a - b)
  if (kmh.length < 4) return { mode: 'unknown', medianKmh: 0, p90Kmh: 0 }

  const median = kmh[Math.floor(kmh.length / 2)]
  const p90 = kmh[Math.floor(kmh.length * 0.9)]

  if (p90 < 7) return { mode: 'walk', medianKmh: median, p90Kmh: p90 }
  if (p90 < 28 && median < 18) return { mode: 'cycle', medianKmh: median, p90Kmh: p90 }
  if (p90 < 60) return { mode: 'road', medianKmh: median, p90Kmh: p90 }
  return { mode: 'rail-or-road', medianKmh: median, p90Kmh: p90 }
}
