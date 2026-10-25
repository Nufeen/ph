import s from './index.module.css'

import {Body, Ecliptic, GeoVector} from 'astronomy-engine'
import {Fragment, memo, useContext, useMemo} from 'react'
import {SettingContext, SettingContextType} from '../../SettingContext'
import {
  CelestialContext,
  CelestialContextType
} from '../../CelestialContext'

import {clampStartYear, defaultStartYear} from '../../compute/graphic'

import planets from '../../assets/planets.json'
import zodiacSigns from '../../assets/zodiac.json'

// SVG Canvas Height
const H = 600

// SVG Canvas Width
// 1200 is nice for 12 * i math
const W = 1200

// Consecutive x jump (px) that marks the 360° -> 0° wrap,
// splitting a planet path in two segments
const WRAP_GAP = 500

const MS_PER_DAY = 86400000
const DAYS_PER_YEAR = 365.25

// 1 year axis resolution: weekly samples
const AXIS_SAMPLES_PER_YEAR = 52

// Multi-year spans use adaptive resolution: keep the total
// amount of curve samples per planet around MAX_SAMPLES
const MAX_SAMPLES = 60

function samplesPerYear(span: number): number {
  return Math.max(1, Math.round(MAX_SAMPLES / span))
}

const posCache = new Map<string, number>()

export function pos(body: PlanetName, date: Date): number {
  const key = `${body}:${date.getTime()}`
  const cached = posCache.get(key)
  if (cached !== undefined) return cached

  const vector = GeoVector(Body[body], date, false)
  const {elon} = Ecliptic(vector)
  const x = (elon / 360) * W

  posCache.set(key, x)
  return x
}

export type PlanetName = keyof typeof planets

export interface Point {
  x: number
  y: number
}

// A curve sample: an ephemeris date and its y position on the axis
export interface Sample {
  date: Date
  y: number
}

export function getStartDatesOfEveryDayPerYear(year: number): Date[] {
  const dates: Date[] = []
  const date = new Date(year, 0, 1)
  while (date.getFullYear() === year) {
    dates.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return dates
}

export function splitArray(points: Point[]): Point[][] {
  if (points.length === 0) return []

  const groups: Point[][] = []
  let group: Point[] = []
  for (let i = 0; i < points.length - 1; i++) {
    group.push(points[i])
    if (Math.abs(points[i].x - points[i + 1].x) > WRAP_GAP) {
      groups.push(group)
      group = []
    }
  }
  group.push(points[points.length - 1])
  groups.push(group)
  return groups
}

export function dayNum(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - startOfYear.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const color: Record<PlanetName, string> = {
  Sun: '#ff0',
  Moon: '#444',
  Venus: 'green',
  Mars: 'red',
  Mercury: 'orange',
  Jupiter: '#007FFF',
  Saturn: 'grey',
  Uranus: 'crimson',
  Neptune: '#4D4DFF',
  Pluto: 'purple'
}

interface GridLine {
  y: number
  label: string
  showLabel: boolean
}

/**
 * Transit mode: one sample per week of the transit year,
 * y axis is the day of the year
 */
function buildTransitAxis(date: Date) {
  const year = date.getFullYear()
  const daysInYear = getStartDatesOfEveryDayPerYear(year).length
  const start = new Date(year, 0, 1).getTime()
  const yearMs = daysInYear * MS_PER_DAY

  return {
    samples: Array.from(
      {length: AXIS_SAMPLES_PER_YEAR + 1},
      (_, i): Sample => ({
        date: new Date(start + (i / AXIS_SAMPLES_PER_YEAR) * yearMs),
        y: (i / AXIS_SAMPLES_PER_YEAR) * H
      })
    ),
    grid: months.map(
      (mo, i): GridLine => ({
        y: i * (H / 12),
        label: `${mo} ${year}`,
        showLabel: true
      })
    ),
    currentY: ((dayNum(date) - 1) / daysInYear) * H
  }
}

/**
 * Progressed mode (secondary progressions, 1 day = 1 year):
 * every sample date of the axis is mapped to its progressed
 * date -- natal + elapsed time / 365.25
 */
function progressedDateOf(date: Date, natal: Date): Date {
  return new Date(
    natal.getTime() + (date.getTime() - natal.getTime()) / DAYS_PER_YEAR
  )
}

/**
 * Multi-year spans (10/30/100): the y axis is the years range
 * from startYear to startYear + span. Resolution adapts to the
 * span so the total sample count stays around MAX_SAMPLES
 */
function buildMultiYearAxis(startYear: number, span: number, transit: Date) {
  // Keep the axis inside the fast ephemeris range
  const clampedStartYear = clampStartYear(startYear, span)
  const spy = samplesPerYear(span)
  const count = span * spy
  const start = new Date(clampedStartYear, 0, 1).getTime()
  const yearMs = DAYS_PER_YEAR * MS_PER_DAY

  const samples: Sample[] = Array.from({length: count + 1}, (_, i) => ({
    date: new Date(start + (i / spy) * yearMs),
    y: (i / count) * H
  }))

  // Keep the amount of year labels readable
  const labelStep = Math.max(1, Math.round(span / 12))
  const grid: GridLine[] = Array.from({length: span + 1}, (_, i) => ({
    y: (i / span) * H,
    label: `${clampedStartYear + i}`,
    showLabel: i % labelStep === 0
  }))

  const yearsSinceStart = (transit.getTime() - start) / yearMs

  return {samples, grid, currentY: (yearsSinceStart / span) * H}
}

export default function GraphicChart() {
  const {settings} = useContext(SettingContext) as SettingContextType
  const {transitData, natalData} = useContext(
    CelestialContext
  ) as CelestialContextType

  const isProgressed = (settings.graphicType ?? 'transit') === 'progressed'
  const graphicYears = settings.graphicYears ?? 1
  const startYear =
    settings.graphicStartYear ??
    defaultStartYear(graphicYears, natalData.date, transitData.date)

  const {samples, grid, currentY} = useMemo(() => {
    // 1 year span keeps the month axis, other spans use years
    const axis =
      graphicYears > 1
        ? buildMultiYearAxis(startYear, graphicYears, transitData.date)
        : buildTransitAxis(transitData.date)

    if (!isProgressed) return axis

    return {
      ...axis,
      samples: axis.samples.map(({date, y}): Sample => ({
        date: progressedDateOf(date, natalData.date),
        y
      }))
    }
  }, [isProgressed, graphicYears, startYear, natalData, transitData])

  const natalPlanets = useMemo(
    () =>
      (Object.keys(settings.objects.planets) as PlanetName[]).filter(
        name => settings.objects.planets[name]
      ),
    [settings.objects.planets]
  )

  const transitPlanets = useMemo(
    () =>
      (
        Object.keys(
          settings.objects.transitPlanets ?? settings.objects.planets
        ) as PlanetName[]
      ).filter(
        name =>
          (settings.objects.transitPlanets ??
            settings.objects.planets)[name]
      ),
    [settings.objects.transitPlanets, settings.objects.planets]
  )

  return (
    <div className={s.wrap}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lets draw some grid */}
        {zodiacSigns.map((sign, index) => (
          <Fragment key={sign}>
            <line
              className={s.signline}
              data-testid="sign-line"
              x1={index * 100}
              y1="0"
              x2={index * 100}
              y2={H}
            />
            <text x={index * 100 + 45} y="-10" opacity=".5">
              {sign}
            </text>
          </Fragment>
        ))}

        {grid.map(({y, label, showLabel}) => (
          <Fragment key={label}>
            <line
              className={s.monthline}
              data-testid="grid-line"
              x1={0}
              y1={y}
              x2={W}
              y2={y}
            />
            {showLabel && (
              <text
                className={s.month}
                data-testid="grid-label"
                x={10}
                y={y + H / 24 + 5}
              >
                {label}
              </text>
            )}
          </Fragment>
        ))}

        {/* Current date line */}
        <line
          className={s.currentdateline}
          data-testid="current-date-line"
          x1={0}
          y1={currentY}
          x2={W}
          y2={currentY}
        />

        {/* Natal planets */}
        {natalPlanets.map(body => (
          <NatalLine key={body} body={body} />
        ))}

        {/* Transit / progressed planets */}
        {transitPlanets.map(body => (
          <Lines key={body} body={body} samples={samples} />
        ))}
      </svg>
    </div>
  )
}

function NatalLine({body}: {body: PlanetName}) {
  const {natalData} = useContext(
    CelestialContext
  ) as CelestialContextType
  const x = pos(body, natalData.date)
  return (
    <>
      <line
        className={s.natalline}
        data-testid="natal-line"
        x1={x}
        y1={10}
        x2={x}
        y2={H}
      />
      <text className={s.natalText} data-testid="natal-label" x={x - 4} y={8}>
        {planets[body]}
      </text>
    </>
  )
}

const Lines = memo(function Lines({
  body,
  samples
}: {
  body: PlanetName
  samples: Sample[]
}) {
  const lines = useMemo(() => {
    const points: Point[] = samples.map(sample => ({
      x: pos(body, sample.date),
      y: sample.y
    }))
    return splitArray(points)
  }, [body, samples])

  return (
    <>
      {lines.map((line, index) => (
        <Path key={index} points={line} color={color[body]} body={body} />
      ))}

      {lines.map((line, index) => (
        <text
          key={index}
          data-body={body}
          fontSize={12}
          x={line[line.length - 1].x}
          y={line[line.length - 1].y + 10}
          fill={color[body]}
        >
          {planets[body]}
        </text>
      ))}
    </>
  )
})

function Path({
  points,
  color,
  body
}: {
  points: Point[]
  color: string
  body: PlanetName
}) {
  const [head, ...tail] = points

  const d =
    `M ${head.x} ${head.y} ` +
    tail.map(p => `L ${p.x}, ${p.y}`).join(' ')

  return (
    <path
      data-body={body}
      d={d}
      stroke={color}
      fill="transparent"
    />
  )
}
