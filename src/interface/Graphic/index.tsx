import s from './index.module.css'

import {Body, Ecliptic, GeoVector} from 'astronomy-engine'
import {Fragment, useContext, useMemo} from 'react'
import {SettingContext, SettingContextType} from '../../SettingContext'
import {
  CelestialContext,
  CelestialContextType
} from '../../CelestialContext'

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

// Progressed axis resolution: curve samples per year of life
const SAMPLES_PER_YEAR = 12

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

export function pos(body: PlanetName, date: Date): number {
  const vector = GeoVector(Body[body], date, false)
  const {elon} = Ecliptic(vector)
  return (elon / 360) * W
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
 * Transit mode: one sample per day of the transit year,
 * y axis is the day of the year
 */
function buildTransitAxis(date: Date) {
  const dates = getStartDatesOfEveryDayPerYear(date.getFullYear())
  const year = date.getFullYear()

  return {
    samples: dates.map(
      (dt, i): Sample => ({date: dt, y: (i * H) / dates.length})
    ),
    grid: months.map(
      (mo, i): GridLine => ({
        y: i * (H / 12),
        label: `${mo} ${year}`,
        showLabel: true
      })
    ),
    currentY: ((dayNum(date) - 1) / dates.length) * H
  }
}

/**
 * Progressed mode (secondary progressions, 1 day = 1 year):
 * y axis is the age, from birth to the current age rounded up
 * to the next birthday. A planet at age A sits at its ephemeris
 * position A days after birth.
 */
function buildProgressedAxis(natal: Date, transit: Date) {
  const ageYears = Math.abs(
    (transit.getTime() - natal.getTime()) /
      (DAYS_PER_YEAR * MS_PER_DAY)
  )
  const span = Math.max(1, Math.ceil(ageYears))

  const samples: Sample[] = Array.from(
    {length: span * SAMPLES_PER_YEAR + 1},
    (_, i) => {
      const age = i / SAMPLES_PER_YEAR
      return {
        date: new Date(natal.getTime() + age * MS_PER_DAY),
        y: (age / span) * H
      }
    }
  )

  // Keep the amount of year labels readable
  const labelStep = Math.max(1, Math.round(span / 12))
  const grid: GridLine[] = Array.from({length: span + 1}, (_, i) => ({
    y: (i / span) * H,
    label: `${natal.getFullYear() + i}`,
    showLabel: i % labelStep === 0
  }))

  return {samples, grid, currentY: (ageYears / span) * H}
}

export default function GraphicChart() {
  const {settings} = useContext(SettingContext) as SettingContextType
  const {transitData, natalData} = useContext(
    CelestialContext
  ) as CelestialContextType

  const isProgressed = (settings.graphicType ?? 'transit') === 'progressed'

  const natal = natalData.date
  const transit = transitData.date

  const {samples, grid, currentY} = useMemo(
    () =>
      isProgressed
        ? buildProgressedAxis(natal, transit)
        : buildTransitAxis(transit),
    [isProgressed, natal, transit]
  )

  const enabledPlanets = useMemo(
    () =>
      (Object.keys(settings.objects.planets) as PlanetName[]).filter(
        name => settings.objects.planets[name]
      ),
    [settings.objects.planets]
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
        {enabledPlanets.map(body => (
          <NatalLine key={body} body={body} />
        ))}

        {/* Transit / progressed planets */}
        {enabledPlanets.map(body => (
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

function Lines({body, samples}: {body: PlanetName; samples: Sample[]}) {
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
}

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
