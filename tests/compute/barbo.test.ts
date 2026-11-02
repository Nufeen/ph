import {test, expect} from 'vitest'
import {
  angleDistance,
  pos,
  subgraphDeltas,
  sumAngles,
  sumAngleDistances
} from '../../src/compute/barbo'

const classic = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']

test('angleDistance: Barbo spec example, 250 deg apart -> 110', () => {
  expect(angleDistance(250, 0)).toBe(110)
})

test('angleDistance: shortest arc across the 0 deg point', () => {
  expect(angleDistance(359, 1)).toBe(2)
  expect(angleDistance(10, 350)).toBe(20)
})

test('angleDistance: opposition is the max, 180 deg', () => {
  expect(angleDistance(0, 180)).toBe(180)
  expect(angleDistance(180, 0)).toBe(180)
})

test('angleDistance: identical longitudes -> 0', () => {
  expect(angleDistance(5, 5)).toBe(0)
})

test('angleDistance: out of 0..360 inputs are normalized', () => {
  expect(angleDistance(720, 0)).toBe(0)
  expect(angleDistance(370, 0)).toBe(10)
  expect(angleDistance(-10, 10)).toBe(20)
})

test('angleDistance: symmetric and always within 0..180', () => {
  for (let a = 0; a < 360; a += 7) {
    for (let b = 0; b < 360; b += 11) {
      const d = angleDistance(a, b)
      expect(d).toBeGreaterThanOrEqual(0)
      expect(d).toBeLessThanOrEqual(180)
      expect(d).toBe(angleDistance(b, a))
    }
  }
})

test('sumAngles: no pairs -> 0', () => {
  expect(sumAngles([])).toBe(0)
  expect(sumAngles([42])).toBe(0)
})

test('sumAngles: a single pair is the angular distance itself', () => {
  expect(sumAngles([0, 180])).toBe(180)
  expect(sumAngles([0, 250])).toBe(110)
})

test('sumAngles: three bodies spread around the circle -> exactly 360', () => {
  // gaps 100/100/160, all < 180: every shortest arc is its gap
  expect(sumAngles([0, 100, 200])).toBe(360)
  expect(sumAngles([10, 80, 190])).toBe(360)
})

test('sumAngles: three bodies clustered in a semicircle -> 2 x span', () => {
  // gaps 50/50/260: the wrap-around pair collapses the sum
  expect(sumAngles([0, 50, 100])).toBe(200)
  expect(sumAngles([0, 60, 90])).toBe(180)
})

test('sumAngles: rotation invariant', () => {
  const base = sumAngles([10, 80, 190])
  expect(sumAngles([40, 110, 220])).toBe(base)
  expect(sumAngles([200, 270, 20])).toBe(base)
})

test('sumAngles: five evenly spaced bodies -> 1080', () => {
  expect(sumAngles([0, 72, 144, 216, 288])).toBe(1080)
})

test('sumAngleDistances: real ephemeris matches the manual pair sum', () => {
  const date = new Date(Date.UTC(2026, 0, 1))
  const longitudes = classic.map(planet => pos(planet, date))

  let manual = 0
  for (let i = 0; i < longitudes.length; i++) {
    for (let j = i + 1; j < longitudes.length; j++) {
      manual += angleDistance(longitudes[i], longitudes[j])
    }
  }

  const summed = sumAngleDistances(classic, date)
  expect(summed).toBeCloseTo(manual, 8)
  // classic theoretical bounds: 10 pairs x 180 deg
  expect(summed).toBeGreaterThanOrEqual(0)
  expect(summed).toBeLessThanOrEqual(1800)
})

test('sumAngleDistances: empty selection -> 0', () => {
  expect(sumAngleDistances([], new Date())).toBe(0)
})

test('subgraphDeltas: one named series per unique pair', () => {
  const subgraphs = subgraphDeltas(['Jupiter', 'Saturn', 'Neptune'], [
    new Date(Date.UTC(2026, 0, 1)),
    new Date(Date.UTC(2026, 1, 1))
  ])

  expect(subgraphs).toHaveLength(3) // C(3, 2)
  expect(subgraphs.map(s => s.name)).toEqual([
    'Jupiter-Saturn',
    'Jupiter-Neptune',
    'Saturn-Neptune'
  ])

  for (const series of subgraphs) {
    expect(series.values).toHaveLength(2)
    for (const v of series.values) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(180)
    }
  }
})

test('subgraphDeltas: values match a direct pair computation', () => {
  const date = new Date(Date.UTC(2026, 0, 1))
  const subgraphs = subgraphDeltas(['Jupiter', 'Saturn'], [date])

  expect(subgraphs[0].values[0]).toBeCloseTo(
    angleDistance(pos('Jupiter', date), pos('Saturn', date)),
    8
  )
})

test('subgraphDeltas: the pair series sum up to the full index', () => {
  const date = new Date(Date.UTC(2026, 0, 1))
  const subgraphs = subgraphDeltas(classic, [date])

  const total = subgraphs.reduce((acc, s) => acc + s.values[0], 0)

  expect(total).toBeCloseTo(sumAngleDistances(classic, date), 8)
})

test('Uranus+Neptune+Pluto stay at exactly 360 deg through 2050-2070', () => {
  // for THREE bodies with all gaps between adjacent planets < 180,
  // every pairwise shortest arc equals its adjacent gap, so the
  // sum is identically the full circle: a + b + c = 360.
  // The flat chart over those years is expected math, not a bug.
  for (let year = 2050; year <= 2070; year++) {
    const sum = sumAngleDistances(
      ['Uranus', 'Neptune', 'Pluto'],
      new Date(Date.UTC(year, 0, 1))
    )

    expect(sum).toBeCloseTo(360, 6)
  }
})

test('the same trio dips below 360 once it clusters into a semicircle', () => {
  // mid-2048: one of the three gaps exceeds 180 deg
  const clustered = sumAngleDistances(
    ['Uranus', 'Neptune', 'Pluto'],
    new Date(Date.UTC(2048, 4, 1))
  )

  expect(clustered).toBeLessThan(360)
  expect(clustered).toBeGreaterThan(350)
})
