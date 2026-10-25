import {GraphicYearsSpan} from '../SettingContext'

/**
 * astronomy-engine computes planet positions with fast
 * interpolation only within its ephemeris table (Pluto: 0..4000),
 * outside it falls back to a very slow simulation.
 * Also keeps years clear of the JS Date 0..99 -> 1900s quirk.
 */
export const MIN_START_YEAR = 1000
export const MAX_START_YEAR = 3000

/**
 * Keep the axis start inside the fast ephemeris range,
 * also accounting for the axis end (startYear + span)
 */
export function clampStartYear(startYear: number, span: number): number {
  return Math.min(
    Math.max(Math.floor(startYear), MIN_START_YEAR),
    MAX_START_YEAR - span
  )
}

/**
 * Default start year of the graphic ephemeris axis,
 * depending on the selected years span:
 * - 1 year: the current year
 * - 10 years: the current decade
 * - 30 years: the year of the birth date
 * - 100 years: the current century
 */
export function defaultStartYear(
  span: GraphicYearsSpan,
  natalDate: Date,
  transitDate: Date
): number {
  const year = transitDate.getFullYear()

  switch (span) {
    case 10:
      return Math.floor(year / 10) * 10
    case 30:
      return natalDate.getFullYear()
    case 100:
      return Math.floor(year / 100) * 100
    default:
      return year
  }
}
