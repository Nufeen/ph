// @vitest-environment jsdom

import {render, cleanup} from '@testing-library/react'
import {afterEach, describe, expect, test} from 'vitest'
import GraphicChart, {
  dayNum,
  getStartDatesOfEveryDayPerYear,
  pos,
  splitArray
} from '../../../src/interface/Graphic/index'
import {CelestialContext} from '../../../src/CelestialContext'
import {SettingContext} from '../../../src/SettingContext'

const W = 1200
const H = 600
const MS_PER_DAY = 86400000

const planetsOff = {
  Sun: false,
  Moon: false,
  Mercury: false,
  Venus: false,
  Mars: false,
  Jupiter: false,
  Saturn: false,
  Uranus: false,
  Neptune: false,
  Pluto: false
}

const makeSettings = (
  planetsEnabled: Record<string, boolean> = {},
  graphicType = 'transit',
  graphicYears = 1,
  graphicStartYear?: number,
  transitPlanets?: Record<string, boolean>,
  graphicModulo?: number
) => ({
  objects: {
    planets: {...planetsOff, ...planetsEnabled},
    ...(transitPlanets ? {transitPlanets} : {})
  },
  interface: {},
  colors: {},
  zodiacType: 'Tropical',
  chartType: 'transit',
  graphicType,
  graphicYears,
  graphicStartYear,
  ...(graphicModulo ? {graphicModulo} : {})
})

const makeCelestial = (transitDate: Date, natalDate: Date) => ({
  natalData: {city: 'Berlin', tz: '', country: '', date: natalDate},
  transitData: {city: 'Berlin', tz: '', country: '', date: transitDate},
  chart: {natal: {lat: 0, lng: 0}, transit: {lat: 0, lng: 0}}
})

interface RenderChartProps {
  transitDate?: Date
  natalDate?: Date
  planetsEnabled?: Record<string, boolean>
  transitPlanets?: Record<string, boolean>
  graphicType?: 'transit' | 'progressed'
  graphicYears?: number
  graphicStartYear?: number
  graphicModulo?: number
}

const renderChart = ({
  transitDate = new Date(2024, 6, 1, 12),
  natalDate = new Date(2024, 0, 15),
  planetsEnabled = {Sun: true},
  transitPlanets,
  graphicType = 'transit',
  graphicYears = 1,
  graphicStartYear,
  graphicModulo
}: RenderChartProps = {}) =>
  render(
    <SettingContext.Provider
      value={{
        settings: makeSettings(
          planetsEnabled,
          graphicType,
          graphicYears,
          graphicStartYear,
          transitPlanets,
          graphicModulo
        )
      } as any}
    >
      <CelestialContext.Provider
        value={makeCelestial(transitDate, natalDate) as any}
      >
        <GraphicChart />
      </CelestialContext.Provider>
    </SettingContext.Provider>
  )

const parsePath = (d: string) =>
  Array.from(
    d.matchAll(/(?:M|L)\s+([-\d.]+)[,\s]+([-\d.]+)/g),
    m => ({x: parseFloat(m[1]), y: parseFloat(m[2])})
  )

afterEach(cleanup)

describe('dayNum', () => {
  test('returns 1 for January 1st', () => {
    expect(dayNum(new Date(2024, 0, 1))).toBe(1)
  })

  test('returns 365 for December 31st of a non-leap year', () => {
    expect(dayNum(new Date(2023, 11, 31, 12))).toBe(365)
  })

  test('returns 366 for December 31st of a leap year', () => {
    expect(dayNum(new Date(2024, 11, 31, 12))).toBe(366)
  })
})

describe('getStartDatesOfEveryDayPerYear', () => {
  test('returns 365 dates for a non-leap year', () => {
    expect(getStartDatesOfEveryDayPerYear(2023)).toHaveLength(365)
  })

  test('returns 366 dates for a leap year', () => {
    expect(getStartDatesOfEveryDayPerYear(2024)).toHaveLength(366)
  })

  test('starts on January 1st and stays within the year', () => {
    const dates = getStartDatesOfEveryDayPerYear(2024)
    expect(dates[0].getMonth()).toBe(0)
    expect(dates[0].getDate()).toBe(1)
    expect(dates.every(d => d.getFullYear() === 2024)).toBe(true)
  })

  test('returns independent Date objects', () => {
    const dates = getStartDatesOfEveryDayPerYear(2024)
    expect(new Set(dates).size).toBe(366)
  })
})

describe('splitArray', () => {
  const pt = (x: number, y = 0) => ({x, y})

  test('returns empty array for empty input', () => {
    expect(splitArray([])).toEqual([])
  })

  test('keeps a single point in one group', () => {
    const groups = splitArray([pt(42)])
    expect(groups).toHaveLength(1)
    expect(groups[0]).toEqual([pt(42)])
  })

  test('keeps points in one group when x changes smoothly', () => {
    const groups = splitArray([pt(0), pt(100), pt(250)])
    expect(groups).toHaveLength(1)
    expect(groups[0]).toHaveLength(3)
  })

  test('splits when the x jump exceeds the wrap threshold', () => {
    const groups = splitArray([pt(1190), pt(1195), pt(3), pt(8)])
    expect(groups).toHaveLength(2)
    expect(groups[0]).toEqual([pt(1190), pt(1195)])
    expect(groups[1]).toEqual([pt(3), pt(8)])
  })
})

describe('pos', () => {
  test('maps ecliptic longitude to x within canvas width', () => {
    for (const body of ['Sun', 'Moon', 'Mars'] as const) {
      const x = pos(body, new Date(Date.UTC(2024, 6, 1, 12)))
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(W)
    }
  })

  test('increases for the Sun before the 360° wrap', () => {
    const february = pos('Sun', new Date(Date.UTC(2024, 1, 10)))
    const march = pos('Sun', new Date(Date.UTC(2024, 2, 10)))
    expect(march).toBeGreaterThan(february)
  })

  test('differs between dates for a fast moving body', () => {
    const moon1 = pos('Moon', new Date(Date.UTC(2024, 0, 1)))
    const moon2 = pos('Moon', new Date(Date.UTC(2024, 0, 15)))
    expect(moon1).not.toBe(moon2)
  })

  test('wraps a position beyond the modulo into the range', () => {
    // Sun is at ~99° on July 1st 2024 -> 99 mod 90 = 9°
    const x = pos('Sun', new Date(Date.UTC(2024, 6, 1, 12)), 90)
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x).toBeLessThan(W / 2)
  })

  test('returns the plain position for the 360 modulo', () => {
    expect(pos('Sun', new Date(Date.UTC(2024, 6, 1, 12)), 360)).toBe(
      pos('Sun', new Date(Date.UTC(2024, 6, 1, 12)))
    )
  })
})

describe('GraphicChart (transit)', () => {
  test('renders an svg with viewBox 0 0 1200 600', () => {
    const {container} = renderChart()
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg!.getAttribute('viewBox')).toBe(`0 0 ${W} ${H}`)
  })

  test('renders 12 zodiac sign lines and 12 month grid lines', () => {
    const {container} = renderChart()
    expect(
      container.querySelectorAll('[data-testid="sign-line"]')
    ).toHaveLength(12)
    expect(
      container.querySelectorAll('[data-testid="grid-line"]')
    ).toHaveLength(12)
  })

  test('labels the 12 months with the transit year', () => {
    const {container} = renderChart()
    const labels = Array.from(
      container.querySelectorAll('[data-testid="grid-label"]')
    ).map(t => t.textContent)
    expect(labels).toHaveLength(12)
    expect(labels[0]).toBe('January 2024')
    expect(labels![11]).toContain('2024')
  })

  test('aligns the current date line with the transit date', () => {
    const {container} = renderChart()
    const line = container.querySelector('[data-testid="current-date-line"]')
    expect(line).not.toBeNull()
    // July 1st 2024 is day 183 of a 366 day year, zero-based -> 182
    const expectedY = (182 / 366) * H
    expect(parseFloat(line!.getAttribute('y1')!)).toBeCloseTo(
      expectedY,
      5
    )
  })

  test('starts the current date line at the top on January 1st', () => {
    const {container} = renderChart({
      transitDate: new Date(2024, 0, 1, 12)
    })
    const line = container.querySelector('[data-testid="current-date-line"]')
    expect(parseFloat(line!.getAttribute('y1')!)).toBeCloseTo(0, 5)
  })

  test('honors the start year in the 1 year span', () => {
    const {container} = renderChart({
      graphicStartYear: 2030
    })
    expect(
      container.querySelectorAll('[data-testid="grid-line"]')
    ).toHaveLength(12)
    const labels = Array.from(
      container.querySelectorAll('[data-testid="grid-label"]')
    ).map(t => t.textContent)
    expect(labels[0]).toBe('January 2030')
  })

  test('hides the current date line when the transit date is outside the 1 year axis', () => {
    const {container} = renderChart({
      graphicStartYear: 2030
    })
    expect(
      container.querySelector('[data-testid="current-date-line"]')
    ).toBeNull()
    // the curves of the start year axis are still drawn
    expect(container.querySelector('path[data-body="Sun"]')).not.toBeNull()
  })

  test('hides the current date line when the transit date is outside a multi-year axis', () => {
    const {container} = renderChart({
      natalDate: new Date(2000, 5, 15),
      graphicYears: 10,
      graphicStartYear: 2000
    })
    expect(
      container.querySelector('[data-testid="current-date-line"]')
    ).toBeNull()
  })

  test('renders natal lines only for enabled planets', () => {
    const {container} = renderChart({
      planetsEnabled: {Sun: true, Mars: true}
    })
    expect(
      container.querySelectorAll('[data-testid="natal-line"]')
    ).toHaveLength(2)
    const natalTexts = Array.from(
      container.querySelectorAll('[data-testid="natal-label"]')
    ).map(t => t.textContent)
    expect(natalTexts).toContain('☉')
    expect(natalTexts).toContain('♂')
  })

  test('renders transit paths with data-body for enabled planets', () => {
    const {container} = renderChart({
      planetsEnabled: {Sun: true, Mars: true}
    })
    const bodies = Array.from(
      container.querySelectorAll('path[data-body]')
    ).map(p => p.getAttribute('data-body'))
    expect(bodies.length).toBeGreaterThanOrEqual(2)
    expect(bodies).toContain('Sun')
    expect(bodies).toContain('Mars')
  })

  test('does not render paths for disabled planets', () => {
    const {container} = renderChart({planetsEnabled: {Moon: true}})
    expect(
      container.querySelector('path[data-body="Moon"]')
    ).not.toBeNull()
    expect(container.querySelector('path[data-body="Sun"]')).toBeNull()
  })

  test('labels transit paths with planet glyphs', () => {
    const {container} = renderChart()
    const labels = Array.from(
      container.querySelectorAll('text[data-body="Sun"]')
    ).map(t => t.textContent)
    expect(labels.length).toBeGreaterThanOrEqual(1)
    expect(labels.every(l => l === '☉')).toBe(true)
  })

  test('renders a path per wrap segment', () => {
    const {container} = renderChart()
    // The Sun crosses 360° -> 0° once per year, splitting the path in two
    expect(
      container.querySelectorAll('path[data-body="Sun"]')
    ).toHaveLength(2)
  })

  test('renders no planet lines when all planets are disabled', () => {
    const {container} = renderChart({planetsEnabled: {}})
    expect(container.querySelectorAll('path[data-body]')).toHaveLength(0)
    expect(
      container.querySelectorAll('[data-testid="natal-line"]')
    ).toHaveLength(0)
  })

  test('separates natal and transit visibility', () => {
    const {container} = renderChart({
      planetsEnabled: {Sun: true, Mars: true},
      transitPlanets: {Sun: false, Mars: true}
    })
    // both planets are natal enabled
    expect(
      container.querySelectorAll('[data-testid="natal-line"]')
    ).toHaveLength(2)
    // curves only for the transit enabled planet (Mars)
    expect(container.querySelector('path[data-body="Mars"]')).not.toBeNull()
    expect(container.querySelector('path[data-body="Sun"]')).toBeNull()
  })
})

describe('GraphicChart (progressed)', () => {
  const natalDate = new Date(2024, 0, 15)

  const renderProgressed = (props = {}) =>
    renderChart({natalDate, graphicType: 'progressed', ...props})

  test('shows the month grid of the current year', () => {
    const {container} = renderProgressed()
    expect(
      container.querySelectorAll('[data-testid="grid-line"]')
    ).toHaveLength(12)

    const labels = Array.from(
      container.querySelectorAll('[data-testid="grid-label"]')
    ).map(t => t.textContent)
    expect(labels[0]).toBe('January 2024')
    expect(labels).toHaveLength(12)
  })

  test('maps each day of the year to its progressed date', () => {
    const {container} = renderProgressed()

    // The progressed date of the current day on the axis
    // (a midnight date) is natal + elapsed / 365.25
    const dayDate = new Date(2024, 6, 1)
    const progressedDate = new Date(
      natalDate.getTime() +
        (dayDate.getTime() - natalDate.getTime()) / 365.25
    )
    const expectedX = pos('Sun', progressedDate)

    const line = container.querySelector('[data-testid="current-date-line"]')
    const currentY = parseFloat(line!.getAttribute('y1')!)

    // Weekly axis: the nearest sample to the current date line
    const points = Array.from(
      container.querySelectorAll('path[data-body="Sun"]')
    ).flatMap(p => parsePath(p.getAttribute('d')!))
    const onCurrentLine = points.reduce((a, b) =>
      Math.abs(b.y - currentY) < Math.abs(a.y - currentY) ? b : a
    )
    // within half a week of the axis
    expect(Math.abs(onCurrentLine.y - currentY)).toBeLessThan(H / 52)
    // Sun moves ~0.01 deg of ephemeris time per week of life
    expect(Math.abs(onCurrentLine.x - expectedX)).toBeLessThan(0.05)
  })

  test('draws different curves than transit mode', () => {
    const progressed = renderProgressed()
    const transit = renderChart({natalDate})

    const progressedD = Array.from(
      progressed.container.querySelectorAll('path[data-body="Sun"]')
    ).map(p => p.getAttribute('d'))
    const transitD = Array.from(
      transit.container.querySelectorAll('path[data-body="Sun"]')
    ).map(p => p.getAttribute('d'))

    expect(progressedD).not.toEqual(transitD)
  })
})

describe('GraphicChart (multi-year span)', () => {
  const natalDate = new Date(2000, 5, 15)
  const transitDate = new Date(2024, 6, 1, 12)

  const getLabels = (container: Element) =>
    Array.from(
      container.querySelectorAll('[data-testid="grid-label"]')
    ).map(t => t.textContent)

  test('draws a year grid from the decade for the 10 years span', () => {
    const {container} = renderChart({
      transitDate,
      natalDate,
      graphicYears: 10
    })
    // start year defaults to the decade -> 2020..2030, every line labeled
    expect(
      container.querySelectorAll('[data-testid="grid-line"]')
    ).toHaveLength(11)
    const labels = getLabels(container)
    expect(labels[0]).toBe('2020')
    expect(labels).toHaveLength(11)
  })

  test('places the current date line within the span', () => {
    const {container} = renderChart({
      transitDate,
      natalDate,
      graphicYears: 10
    })
    const line = container.querySelector('[data-testid="current-date-line"]')
    const start = new Date(2020, 0, 1).getTime()
    const yearsSinceStart =
      (transitDate.getTime() - start) / (365.25 * MS_PER_DAY)
    const expectedY = (yearsSinceStart / 10) * H
    expect(parseFloat(line!.getAttribute('y1')!)).toBeCloseTo(expectedY, 5)
  })

  test('defaults the 30 years span to the birth year', () => {
    const {container} = renderChart({
      transitDate,
      natalDate,
      graphicYears: 30
    })
    expect(
      container.querySelectorAll('[data-testid="grid-line"]')
    ).toHaveLength(31)
    const labels = getLabels(container)
    expect(labels[0]).toBe('2000')
    expect(labels).toContain('2030')
  })

  test('honors an explicit start year', () => {
    const {container} = renderChart({
      transitDate,
      natalDate,
      graphicYears: 10,
      graphicStartYear: 2015
    })
    const labels = getLabels(container)
    expect(labels[0]).toBe('2015')
    expect(labels[10]).toBe('2025')
  })

  test('progressed multi-year curves map the axis through the progression', () => {
    const {container} = renderChart({
      transitDate,
      natalDate,
      graphicType: 'progressed',
      graphicYears: 10
    })

    const progressedOf = (d: Date) =>
      new Date(
        natalDate.getTime() + (d.getTime() - natalDate.getTime()) / 365.25
      )

    const path = container.querySelector('path[data-body="Sun"]')!
    const points = parsePath(path.getAttribute('d')!)
    const first = points[0]
    const last = points[points.length - 1]

    // axis years are 365.25-day years: 10 years = 3652.5 days after start
    const axisEnd = new Date(
      new Date(2020, 0, 1).getTime() + 10 * 365.25 * MS_PER_DAY
    )

    expect(first.x).toBeCloseTo(
      pos('Sun', progressedOf(new Date(2020, 0, 1))),
      5
    )
    expect(first.y).toBeCloseTo(0, 5)
    expect(last.x).toBeCloseTo(pos('Sun', progressedOf(axisEnd)), 5)
    expect(last.y).toBeCloseTo(H, 5)
  })

  test('keeps curve resolution bounded on multi-year spans', () => {
    const {container} = renderChart({
      transitDate,
      natalDate,
      graphicYears: 10
    })
    // 6 samples per year for a 10 years span -> 61 points in total
    const points = Array.from(
      container.querySelectorAll('path[data-body="Sun"]')
    ).flatMap(p => parsePath(p.getAttribute('d')!))
    expect(points).toHaveLength(61)
  })

  test('clamps the axis to the fast ephemeris range', () => {
    const {container} = renderChart({
      transitDate,
      natalDate,
      graphicYears: 10,
      graphicStartYear: 20201
    })
    // 20201 clamps to 3000 - 10 -> axis 2990..3000
    const labels = getLabels(container)
    expect(labels[0]).toBe('2990')
    expect(labels[10]).toBe('3000')
  })

  test('keeps the month grid for the 1 year span', () => {
    const {container} = renderChart({
      transitDate,
      natalDate,
      graphicYears: 1
    })
    expect(
      container.querySelectorAll('[data-testid="grid-line"]')
    ).toHaveLength(12)
    expect(getLabels(container)[0]).toBe('January 2024')
  })
})

describe('GraphicChart (modulo)', () => {
  const getSignLines = (container: Element) =>
    container.querySelectorAll('[data-testid="sign-line"]')

  test('draws 12 sign lines for the 360° modulo', () => {
    const {container} = renderChart({graphicModulo: 360})
    expect(getSignLines(container)).toHaveLength(12)
  })

  test('draws degree ticks every 10° for the 90° modulo', () => {
    const {container} = renderChart({graphicModulo: 90})
    const lines = getSignLines(container)
    expect(lines).toHaveLength(9)
    expect(
      parseFloat(lines[0].getAttribute('x1')!)
    ).toBeCloseTo((10 / 90) * W, 5)
    expect(
      parseFloat(lines[8].getAttribute('x1')!)
    ).toBeCloseTo(W, 5)

    const labels = Array.from(
      container.querySelectorAll('text')
    ).map(t => t.textContent)
    expect(labels).toContain('10°')
    expect(labels).toContain('90°')
  })

  test('draws degree ticks every 5° for the 30° modulo', () => {
    const {container} = renderChart({graphicModulo: 30})
    const lines = getSignLines(container)
    expect(lines).toHaveLength(6)
    expect(
      parseFloat(lines[0].getAttribute('x1')!)
    ).toBeCloseTo((5 / 30) * W, 5)
    expect(
      parseFloat(lines[5].getAttribute('x1')!)
    ).toBeCloseTo(W, 5)

    const labels = Array.from(
      container.querySelectorAll('text')
    ).map(t => t.textContent)
    expect(labels).toContain('5°')
    expect(labels).toContain('30°')
  })

  test('maps curve positions into the 90° modulo range', () => {
    const {container} = renderChart({graphicModulo: 90})
    const path = container.querySelector('path[data-body="Sun"]')!
    const points = parsePath(path.getAttribute('d')!)

    // first axis sample is January 1st 2024
    const expectedX = pos('Sun', new Date(2024, 0, 1), 90)
    expect(points[0].x).toBeCloseTo(expectedX, 5)
    expect(points.every(p => p.x >= 0 && p.x < W)).toBe(true)
  })

  test('maps the natal line into the 90° modulo range', () => {
    const {container} = renderChart({graphicModulo: 90})
    const line = container.querySelector('[data-testid="natal-line"]')!
    expect(parseFloat(line.getAttribute('x1')!)).toBeCloseTo(
      pos('Sun', new Date(2024, 0, 15), 90),
      5
    )
  })

  test('doubles the axis samples for the 30° modulo', () => {
    const base = renderChart({graphicYears: 10, graphicModulo: 360})
    const doubled = renderChart({graphicYears: 10, graphicModulo: 30})

    const count = (root: HTMLElement) =>
      Array.from(
        root.querySelectorAll('path[data-body="Sun"]')
      ).flatMap(p => parsePath(p.getAttribute('d')!)).length

    // samples double per year; the axis start/end sample stays single
    expect(count(doubled.container)).toBe(
      (count(base.container) - 1) * 2 + 1
    )
  })
})
