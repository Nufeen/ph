import {Body, Ecliptic, GeoVector} from 'astronomy-engine'

/**
 * Geocentric ecliptic (tropical) longitude of a body, 0..360 deg
 */
export function pos(body: string, date: Date): number {
  const vector = GeoVector(Body[body as keyof typeof Body], date, false)
  return Ecliptic(vector).elon
}

/**
 * Shortest angular distance between two longitudes on a circle
 * of the given circumference: both longitudes are taken modulo
 * the circle, then the arc folds at half the circle exactly like
 * the zodiac one folds at 180 deg (360 -> 0..180, 90 -> 0..45)
 */
export function angleDistanceMod(
  a: number,
  b: number,
  mod: number
): number {
  const d = Math.abs((a % mod) - (b % mod)) % mod
  return d > mod / 2 ? mod - d : d
}

/**
 * Shortest angular distance between two longitudes on the
 * zodiac circle, 0..180 deg
 */
export function angleDistance(a: number, b: number): number {
  return angleDistanceMod(a, b, 360)
}

/**
 * Barbo index: sum of the shortest arcs over every unique pair
 * of the given longitudes
 */
export function sumAngles(
  longitudes: number[],
  mod: number = 360
): number {
  let total = 0

  for (let i = 0; i < longitudes.length; i++) {
    for (let j = i + 1; j < longitudes.length; j++) {
      total += angleDistanceMod(longitudes[i], longitudes[j], mod)
    }
  }

  return total
}

/**
 * Barbo index for a set of bodies on a date
 */
export function sumAngleDistances(
  selectedPlanets: string[],
  date: Date,
  mod: number = 360
): number {
  return sumAngles(
    selectedPlanets.map(planet => pos(planet, date)),
    mod
  )
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
  dates: Date[],
  mod: number = 360
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
        values: dates.map((_, k) =>
          angleDistanceMod(
            longitudes[i].values[k],
            longitudes[j].values[k],
            mod
          )
        ),
        signs: longitudes[i].values.map(lon => Math.floor(lon / 30) % 12)
      })
    }
  }

  return pairs
}
