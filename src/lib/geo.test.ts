import { describe, it, expect } from 'vitest'
import { haversine, pathLength, distanceToPath, classifyFromSpeeds } from './geo'
import { CORRIDORS, corridorById } from './domain/corridors'

const CBD: [number, number] = [18.4231, -33.9221]
const BELLVILLE: [number, number] = [18.629, -33.902]

describe('haversine', () => {
  it('is zero for the same point', () => {
    expect(haversine(CBD, CBD)).toBe(0)
  })

  it('matches a known Cape Town distance to within a few percent', () => {
    // Bellville to the CBD is about 19 km as the crow flies.
    const m = haversine(BELLVILLE, CBD)
    expect(m).toBeGreaterThan(18_000)
    expect(m).toBeLessThan(21_000)
  })

  it('is symmetric', () => {
    expect(haversine(CBD, BELLVILLE)).toBeCloseTo(haversine(BELLVILLE, CBD), 6)
  })
})

describe('pathLength', () => {
  it('is zero for fewer than two points', () => {
    expect(pathLength([])).toBe(0)
    expect(pathLength([CBD])).toBe(0)
  })

  it('sums the legs', () => {
    const mid: [number, number] = [18.52, -33.91]
    expect(pathLength([BELLVILLE, mid, CBD])).toBeCloseTo(
      haversine(BELLVILLE, mid) + haversine(mid, CBD),
      6,
    )
  })

  it('is at least the straight-line distance between the ends', () => {
    const c = corridorById('bell-cbd')!
    expect(pathLength(c.path)).toBeGreaterThanOrEqual(haversine(c.path[0], c.path.at(-1)!))
  })
})

describe('distanceToPath', () => {
  const line = corridorById('clar-cbd')!.path

  it('is near zero on the line itself', () => {
    expect(distanceToPath(line[2], line)).toBeLessThan(1)
  })

  it('is near zero midway along a segment, not just at the vertices', () => {
    const a = line[0]
    const b = line[1]
    const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    expect(distanceToPath(mid, line)).toBeLessThan(30)
  })

  it('grows with genuine deviation', () => {
    const off: [number, number] = [line[2][0] + 0.02, line[2][1]] // ~1.8 km east
    expect(distanceToPath(off, line)).toBeGreaterThan(1_000)
  })

  it('separates one corridor from another', () => {
    // A point on the Northern Line should be far from the Southern Line.
    const northern = corridorById('bell-cbd')!.path[1]
    expect(distanceToPath(northern, corridorById('clar-cbd')!.path)).toBeGreaterThan(2_000)
  })
})

describe('classifyFromSpeeds', () => {
  const kmh = (v: number) => v / 3.6

  it('says nothing from too few samples, rather than guessing', () => {
    expect(classifyFromSpeeds([kmh(50), kmh(50)]).mode).toBe('unknown')
  })

  it('recognises walking', () => {
    expect(classifyFromSpeeds([1, 1.3, 1.1, 1.4, 1.2, 1.5]).mode).toBe('walk')
  })

  it('recognises cycling', () => {
    const speeds = [12, 15, 18, 14, 16, 20, 17, 15].map(kmh)
    expect(classifyFromSpeeds(speeds).mode).toBe('cycle')
  })

  it('calls mid speeds road, which could be a bus or a car', () => {
    const speeds = [30, 45, 40, 50, 35, 48, 42, 38].map(kmh)
    expect(classifyFromSpeeds(speeds).mode).toBe('road')
  })

  it('never returns car from speed alone', () => {
    const fast = [70, 85, 90, 80, 95, 88, 75, 92].map(kmh)
    const result = classifyFromSpeeds(fast)
    expect(result.mode).toBe('rail-or-road')
    // The union is the point: at road speed a train and a car look the same.
    expect(['walk', 'cycle', 'road', 'rail-or-road', 'unknown']).toContain(result.mode)
  })

  it('ignores negative and non-finite readings', () => {
    const speeds = [-1, NaN, Infinity, kmh(40), kmh(45), kmh(42), kmh(38), kmh(44)]
    expect(classifyFromSpeeds(speeds).mode).toBe('road')
  })

  it('reports median and p90 in km/h', () => {
    const r = classifyFromSpeeds([10, 10, 10, 10, 10, 10].map(kmh))
    expect(r.medianKmh).toBeCloseTo(10, 5)
    expect(r.p90Kmh).toBeCloseTo(10, 5)
  })
})

describe('corridor data', () => {
  it('every corridor has a plausible length for its geometry', () => {
    for (const c of CORRIDORS) {
      const geometric = pathLength(c.path)
      // The stated length includes track curvature the simplified path omits,
      // so it should be in the same order, never wildly apart.
      expect(c.metres).toBeGreaterThan(geometric * 0.8)
      expect(c.metres).toBeLessThan(geometric * 2)
    }
  })

  it('off-peak fares are cheaper than peak on every corridor', () => {
    for (const c of CORRIDORS) expect(c.fares.offPeak).toBeLessThan(c.fares.peak)
  })

  it('every corridor offers at least one mode', () => {
    for (const c of CORRIDORS) expect(c.modes.length).toBeGreaterThan(0)
  })
})
