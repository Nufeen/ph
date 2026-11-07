import s from './index.module.css'

import {Body, Ecliptic, GeoVector} from 'astronomy-engine'
import {
  Fragment,
  memo,
  useContext,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent
} from 'react'
import {
  SettingContext,
  SettingContextType
} from '../../SettingContext'
import {
  CelestialContext,
  CelestialContextType
} from '../../CelestialContext'

import {
  clampStartYear,
  defaultStartYear
} from '../../compute/graphic'

import planets from '../../assets/planets.json'
import zodiacSigns from '../../assets/zodiac.json'
import useFullscreenToggle from '../../hooks/useFullscreen'

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

// Multi-year spans use fixed per-year resolution, dense enough to
// keep consecutive samples well inside the wrap threshold:
// weekly for spans up to 10 years, bi-weekly for 30, monthly for 100
function samplesPerYear(span: number): number {
  if (span <= 10) return 52
  if (span <= 30) return 26
  return 12
}

const posCache = new Map<string, number>()

export function pos(
  body: PlanetName,
  date: Date,
  modulo = 360
): number {
  const key = `${body}:${date.getTime()}:${modulo}`
  const cached = posCache.get(key)
  if (cached !== undefined) return cached

  const vector = GeoVector(Body[body], date, false)
  const {elon} = Ecliptic(vector)
  const x = ((elon % modulo) / modulo) * W

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

export function getStartDatesOfEveryDayPerYear(
  year: number
): Date[] {
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
    const [p1, p2] = [points[i], points[i + 1]]
    group.push(p1)
    if (Math.abs(p1.x - p2.x) > WRAP_GAP) {
      // the curve wraps around the modulo boundary between the
      // samples: cut both segments exactly at the chart edge
      const crossing = wrapCrossing(p1, p2)
      group.push(crossing)
      groups.push(group)
      group = [{x: W - crossing.x, y: crossing.y}]
    }
  }
  group.push(points[points.length - 1])
  groups.push(group)
  return groups
}

/**
 * The point where the p1 -> p2 segment crosses the modulo
 * boundary (x = 0/W), with y interpolated along the segment
 */
function wrapCrossing(p1: Point, p2: Point): Point {
  const forward = p2.x < p1.x
  const edge = forward ? W : 0
  // unwrap p2 so the segment is continuous
  const x2 = p2.x + (forward ? W : -W)
  const t = (edge - p1.x) / (x2 - p1.x)
  return {x: edge, y: p1.y + t * (p2.y - p1.y)}
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
 * Transit mode: one sample per week of the start year,
 * y axis is the day of the year. The current date line is
 * only shown when the transit date falls inside the axis year
 */
function buildTransitAxis(startYear: number, date: Date) {
  const daysInYear = getStartDatesOfEveryDayPerYear(startYear).length
  const start = new Date(startYear, 0, 1).getTime()
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
        label: `${mo} ${startYear}`,
        showLabel: true
      })
    ),
    currentY:
      date.getFullYear() === startYear
        ? ((dayNum(date) - 1) / daysInYear) * H
        : null,
    startMs: start,
    endMs: start + yearMs
  }
}

/**
 * Progressed mode (secondary progressions, 1 day = 1 year):
 * every sample date of the axis is mapped to its progressed
 * date -- natal + elapsed time / 365.25
 */
function progressedDateOf(date: Date, natal: Date): Date {
  return new Date(
    natal.getTime() +
      (date.getTime() - natal.getTime()) / DAYS_PER_YEAR
  )
}

/**
 * Multi-year spans (10/30/100): the y axis is the years range
 * from startYear to startYear + span, sampled at a fixed
 * per-year rate. The 30° modulo wraps often: samples per year
 * are doubled so the curves keep enough points per segment
 */
export function buildMultiYearAxis(
  startYear: number,
  span: number,
  transit: Date,
  modulo = 360
) {
  // Keep the axis inside the fast ephemeris range
  const clampedStartYear = clampStartYear(startYear, span)
  const spy =
    modulo === 30 ? samplesPerYear(span) * 2 : samplesPerYear(span)
  const count = span * spy
  const start = new Date(clampedStartYear, 0, 1).getTime()
  const yearMs = DAYS_PER_YEAR * MS_PER_DAY

  const samples: Sample[] = Array.from(
    {length: count + 1},
    (_, i) => ({
      date: new Date(start + (i / spy) * yearMs),
      y: (i / count) * H
    })
  )

  // Keep the amount of year labels readable
  const labelStep = Math.max(1, Math.round(span / 12))
  const grid: GridLine[] = Array.from(
    {length: span + 1},
    (_, i) => ({
      y: (i / span) * H,
      label: `${clampedStartYear + i}`,
      showLabel: i % labelStep === 0
    })
  )

  const yearsSinceStart = (transit.getTime() - start) / yearMs

  return {
    samples,
    grid,
    currentY:
      yearsSinceStart >= 0 && yearsSinceStart <= span
        ? (yearsSinceStart / span) * H
        : null,
    startMs: start,
    endMs: start + span * yearMs
  }
}

export default function GraphicChart({setTransitData}) {
  const {settings} = useContext(SettingContext) as SettingContextType
  const {transitData, natalData} = useContext(
    CelestialContext
  ) as CelestialContextType

  const isProgressed =
    (settings.graphicType ?? 'transit') === 'progressed'
  const graphicYears = settings.graphicYears ?? 1
  const startYear =
    settings.graphicStartYear ??
    defaultStartYear(graphicYears, natalData.date, transitData.date)

  const modulo = settings.graphicModulo ?? 360

  const {samples, grid, currentY, startMs, endMs} = useMemo(() => {
    // 1 year span keeps the month axis, other spans use years
    const axis =
      graphicYears > 1
        ? buildMultiYearAxis(
            startYear,
            graphicYears,
            transitData.date,
            modulo
          )
        : buildTransitAxis(startYear, transitData.date)

    if (!isProgressed) return axis

    return {
      ...axis,
      samples: axis.samples.map(
        ({date, y}): Sample => ({
          date: progressedDateOf(date, natalData.date),
          y
        })
      )
    }
  }, [isProgressed, graphicYears, startYear, natalData, transitData, modulo])

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

  // pointer position in svg units, null when the cursor is away
  const [cursor, setCursor] = useState<Point | null>(null)

  // F key toggles the fullscreen container class
  const fullscreen = useFullscreenToggle()

  // client px -> viewBox units, the svg is css-scaled
  const trackCursor = (e: ReactMouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCursor({
      x: ((e.clientX - rect.left) * W) / rect.width,
      y: ((e.clientY - rect.top) * H) / rect.height
    })
  }

  // the date under the pointer on the y axis
  const dateAt = (y: number) =>
    new Date(startMs + (y / H) * (endMs - startMs))

  // date label under the pointer: the y axis runs from the axis
  // start to the axis end, formatted as DD.MM.YYYY
  const cursorDate = (() => {
    if (cursor == null) return null
    const d = dateAt(cursor.y)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${day}.${month}.${d.getFullYear()}`
  })()

  // click -> set the transit date to the y axis date value
  const handleClick = (e: ReactMouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = ((e.clientY - rect.top) * H) / rect.height

    setTransitData({
      ...transitData,
      date: dateAt(y),
      // hack to rerender uncontrolled input via key,
      // same as the current-time setter does
      name: new Date().toString()
    })
  }

  // degree readout follows the chart's own x scale: the modulo
  // range runs from 0 at the left edge to modulo at the right
  const cursorDegree =
    cursor == null ? null : ((cursor.x / W) * modulo).toFixed(1)

  // tooltip hugs the pointer, flipping sides near the edges
  const TOOLTIP_W = 72
  const TOOLTIP_H = 22
  const tooltipX =
    cursor == null
      ? 0
      : cursor.x + 8 + TOOLTIP_W > W
        ? cursor.x - 8 - TOOLTIP_W
        : cursor.x + 8
  const tooltipY =
    cursor == null
      ? 0
      : Math.min(
          Math.max(cursor.y - TOOLTIP_H / 2, 2),
          H - TOOLTIP_H - 2
        )

  return (
    <div
      className={fullscreen ? `${s.wrap} ${s.fullscreen}` : s.wrap}
    >
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        onMouseMove={trackCursor}
        onMouseLeave={() => setCursor(null)}
        onClick={handleClick}
      >
        {/* Lets draw some grid */}
        <AxisX modulo={modulo} />

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
        {currentY !== null && (
          <line
            className={s.currentdateline}
            data-testid="current-date-line"
            x1={0}
            y1={currentY}
            x2={W}
            y2={currentY}
          />
        )}

        {/* Natal planets */}
        {natalPlanets.map(body => (
          <NatalLine key={body} body={body} modulo={modulo} />
        ))}

        {/* Transit / progressed planets */}
        {transitPlanets.map(body => (
          <Lines
            key={body}
            body={body}
            modulo={modulo}
            samples={samples}
          />
        ))}

        {/* vertical line following the mouse */}
        {cursor != null && (
          <line
            className={s.cursorline}
            data-testid="cursor-line"
            x1={cursor.x}
            y1="0"
            x2={cursor.x}
            y2={H}
            pointerEvents="none"
          />
        )}

        {/* tooltip: date and degree right at the pointer */}
        {cursor != null && cursorDate != null && (
          <g data-testid="cursor-tooltip" pointerEvents="none">
            <rect
              x={tooltipX}
              y={tooltipY}
              width={TOOLTIP_W}
              height={TOOLTIP_H}
              rx={3}
              fill="var(--background-color)"
              opacity={0.85}
            />
            <text
              x={tooltipX + TOOLTIP_W / 2}
              y={tooltipY + 9}
              textAnchor="middle"
              fontSize={9}
              fill="var(--text-color)"
            >
              {cursorDate}
            </text>
            <text
              x={tooltipX + TOOLTIP_W / 2}
              y={tooltipY + 19}
              textAnchor="middle"
              fontSize={9}
              fill="var(--text-color)"
            >
              {cursorDegree}°
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

/**
 * X axis of the graphic ephemeris:
 * - 360° modulo: one line per zodiac sign
 * - 90° modulo: degree ticks every 10° (10..90)
 * - 30° modulo: degree ticks every 5° (5..30)
 */
function AxisX({modulo}: {modulo: number}) {
  if (modulo === 360) {
    const segWidth = W / 12

    return (
      <>
        {zodiacSigns.map((sign, index) => (
          <Fragment key={sign}>
            <line
              className={s.signline}
              data-testid="sign-line"
              x1={index * segWidth}
              y1="0"
              x2={index * segWidth}
              y2={H}
            />
            <text x={index * segWidth + 45} y="-10" opacity=".5">
              {sign}
            </text>
          </Fragment>
        ))}
      </>
    )
  }

  const step = modulo === 90 ? 10 : 5

  return (
    <>
      {Array.from({length: modulo / step}, (_, i) => {
        const deg = (i + 1) * step
        const x = (deg / modulo) * W

        return (
          <Fragment key={deg}>
            <line
              className={s.signline}
              data-testid="sign-line"
              x1={x}
              y1="0"
              x2={x}
              y2={H}
            />
            <text
              x={x}
              y="-10"
              textAnchor="middle"
              opacity=".5"
              fontSize="8px"
            >
              {deg}°
            </text>
          </Fragment>
        )
      })}
    </>
  )
}

function NatalLine({
  body,
  modulo
}: {
  body: PlanetName
  modulo: number
}) {
  const {natalData} = useContext(
    CelestialContext
  ) as CelestialContextType
  const x = pos(body, natalData.date, modulo)
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
      <text
        className={s.natalText}
        data-testid="natal-label"
        x={x - 4}
        y={8}
      >
        {planets[body]}
      </text>
    </>
  )
}

const Lines = memo(function Lines({
  body,
  modulo,
  samples
}: {
  body: PlanetName
  modulo: number
  samples: Sample[]
}) {
  const lines = useMemo(() => {
    const points: Point[] = samples.map(sample => ({
      x: pos(body, sample.date, modulo),
      y: sample.y
    }))
    return splitArray(points)
  }, [body, modulo, samples])

  return (
    <>
      {lines.map((line, index) => (
        <Path
          key={index}
          points={line}
          color={color[body]}
          body={body}
        />
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
    <path data-body={body} d={d} stroke={color} fill="transparent" />
  )
}
