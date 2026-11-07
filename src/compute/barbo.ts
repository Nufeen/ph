import {Body, Ecliptic, GeoVector} from 'astronomy-engine'

/**
 * Geocentric ecliptic (tropical) longitude of a body, 0..360 deg
 */
export function pos(body: string, date: Date): number {
  const vector = GeoVector(Body[body as keyof typeof Body], date, false)
  return Ecliptic(vector).elon
}

/**
 * Shortest angular distance between two longitudes on the
 * zodiac circle, 0..180 deg
 */
export function angleDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

/**
 * Barbo index: sum of the shortest arcs over every unique pair
 * of the given longitudes
 */
export function sumAngles(longitudes: number[]): number {
  let total = 0

  for (let i = 0; i < longitudes.length; i++) {
    for (let j = i + 1; j < longitudes.length; j++) {
      total += angleDistance(longitudes[i], longitudes[j])
    }
  }

  return total
}

/**
 * Barbo index for a set of bodies on a date
 */
export function sumAngleDistances(
  selectedPlanets: string[],
  date: Date
): number {
  return sumAngles(selectedPlanets.map(planet => pos(planet, date)))
}

/**
 * The index decomposed: one series per unique pair, each value
 * being the pair's shortest arc on the given dates. Also carries
 * the zodiac sign index (0..11, tropical, Aries first) of the
 * first planet of the pair at every date, reusing the longitudes
 * already computed here
 */
export function subgraphDeltas(
  selectedPlanets: string[],
  dates: Date[]
): {name: string; values: number[]; signs: number[]}[] {
  const longitudes = selectedPlanets.map(planet => ({
    planet,
    values: dates.map(date => pos(planet, date))
  }))

  const pairs: {
    name: string
    values: number[]
    signs: number[]
  }[] = []

  for (let i = 0; i < longitudes.length; i++) {
    for (let j = i + 1; j < longitudes.length; j++) {
      pairs.push({
        name: `${longitudes[i].planet}-${longitudes[j].planet}`,
        values: dates.map(
          (_, k) =>
            angleDistance(longitudes[i].values[k], longitudes[j].values[k])
        ),
        signs: longitudes[i].values.map(lon => Math.floor(lon / 30) % 12)
      })
    }
  }

  return pairs
}
