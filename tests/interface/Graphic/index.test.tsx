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
  graphicType = 'transit'
) => ({
  objects: {planets: {...planetsOff, ...planetsEnabled}},
  interface: {},
  colors: {},
  zodiacType: 'Tropical',
  chartType: 'transit',
  graphicType
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
  graphicType?: 'transit' | 'progressed'
}

const renderChart = ({
  transitDate = new Date(2024, 6, 1, 12),
  natalDate = new Date(2024, 0, 15),
  planetsEnabled = {Sun: true},
  graphicType = 'transit'
}: RenderChartProps = {}) =>
  render(
    <SettingContext.Provider
      value={{settings: makeSettings(planetsEnabled, graphicType)} as any}
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
})

describe('GraphicChart (progressed)', () => {
  // Born 2000-01-01, transit date 2024-06-01 12:00
  // -> age is 24.416... years, axis spans 25 years (to the next birthday)
  const natalDate = new Date(2000, 0, 1)
  const transitDate = new Date(2024, 5, 1, 12)
  const age =
    (transitDate.getTime() - natalDate.getTime()) /
    (365.25 * MS_PER_DAY)
  const span = Math.ceil(age)

  const renderProgressed = (props = {}) =>
    renderChart({
      transitDate,
      natalDate,
      graphicType: 'progressed',
      ...props
    })

  test('draws a year grid from birth to the next birthday', () => {
    const {container} = renderProgressed()
    expect(
      container.querySelectorAll('[data-testid="grid-line"]')
    ).toHaveLength(span + 1)

    const labels = Array.from(
      container.querySelectorAll('[data-testid="grid-label"]')
    ).map(t => t.textContent)
    expect(labels).toContain('2000')
    expect(labels).toContain('2024')
    expect(labels).toHaveLength(13) // every 2nd year
  })

  test('does not draw month labels', () => {
    const {container} = renderProgressed()
    expect(container.textContent).not.toContain('January')
  })

  test('places the current age line at the current age', () => {
    const {container} = renderProgressed()
    const line = container.querySelector('[data-testid="current-date-line"]')
    const expectedY = (age / span) * H
    expect(parseFloat(line!.getAttribute('y1')!)).toBeCloseTo(
      expectedY,
      5
    )
  })

  test('starts each progressed curve at the natal position', () => {
    const {container} = renderProgressed()
    const path = container.querySelector('path[data-body="Sun"]')!
    const first = parsePath(path.getAttribute('d')!)[0]
    const natalX = pos('Sun', natalDate)
    expect(first.x).toBeCloseTo(natalX, 5)
    expect(first.y).toBeCloseTo(0, 5)

    // The natal line marks the same position
    const natalLine = container.querySelector('[data-testid="natal-line"]')!
    expect(parseFloat(natalLine.getAttribute('x1')!)).toBeCloseTo(
      natalX,
      5
    )
  })

  test('ends the progressed curve one day per year after birth', () => {
    const {container} = renderProgressed()
    // Axis spans to the next birthday: last sample = age `span`
    // -> ephemeris position `span` days after birth
    const axisEndDate = new Date(natalDate.getTime() + span * MS_PER_DAY)
    const expectedX = pos('Sun', axisEndDate)

    const paths = Array.from(
      container.querySelectorAll('path[data-body="Sun"]')
    )
    const points = parsePath(paths[0].getAttribute('d')!)
    const last = points[points.length - 1]
    expect(last.x).toBeCloseTo(expectedX, 5)
    expect(last.y).toBeCloseTo(H, 5)
  })

  test('draws different curves than transit mode', () => {
    const progressed = renderProgressed()
    const transit = renderChart({transitDate, natalDate})

    const progressedD = Array.from(
      progressed.container.querySelectorAll('path[data-body="Sun"]')
    ).map(p => p.getAttribute('d'))
    const transitD = Array.from(
      transit.container.querySelectorAll('path[data-body="Sun"]')
    ).map(p => p.getAttribute('d'))

    expect(progressedD).not.toEqual(transitD)
  })

  test('still renders natal lines', () => {
    const {container} = renderProgressed()
    expect(
      container.querySelectorAll('[data-testid="natal-line"]')
    ).toHaveLength(1)
  })
})
