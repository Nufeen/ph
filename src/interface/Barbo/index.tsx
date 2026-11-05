// @ts-nocheck

import s from './index.module.css'

import {
  SettingContext,
  SettingContextType
} from '../../SettingContext'
import {
  CelestialContext,
  CelestialContextType
} from '../../CelestialContext'

import {useContext} from 'react'
import {useEffect, useState} from 'react'
import {useMemo} from 'react'

import planets from '../../assets/planets.json'
import {} from '../../assets/zodiac.json'

import {sumAngleDistances, subgraphDeltas} from '../../compute/barbo'

export const upperPlanets = [
  'Jupiter',
  'Saturn',
  // 'Mars',
  'Uranus',
  'Neptune',
  'Pluto'
]

// SVG Canvas Width
// 1200 is nice for 12 * i math
const W = 1200
const H = 500

// hard bounds for the ephemeris walk: the UI must never
// try to compute an unbounded range no matter what is stored
export const MIN_BARBO_YEAR = 1400
export const MAX_BARBO_YEAR = 2100

// distinct hue per pair curve (golden angle stepping)
const colorFor = index => `hsl(${(index * 137) % 360}, 100%, 70%)`

// pair values under this arc (deg) are marked with a dot:
// the curve is nearly invisible at a near-conjunction moment
const NEAR_ZERO_DEG = 1

// horizontal reference lines at aspect angles; the prominent
// ones (45, 90, 135) are drawn red on top of the faint set
const DEG_LINES = [60, 120, 180]
  .map(v => ({v, prominent: false}))
  .concat([45, 90, 135].map(v => ({v, prominent: true})))

export default function Barbo() {
  const {settings} = useContext(SettingContext) as SettingContextType

  const {natalData, transitData} = useContext(
    CelestialContext
  ) as CelestialContextType

  // defensive clamp: settings may hold anything, the walk is
  // capped to a sane range no matter what
  const y1 = Math.min(
    Math.max(settings.barboStartYear ?? 2000, MIN_BARBO_YEAR),
    MAX_BARBO_YEAR - 1
  )

  const y2 = Math.min(
    Math.max(settings.barboEndYear ?? 2050, y1 + 1),
    MAX_BARBO_YEAR
  )

  const span = y2 - y1

  // 200+ years in view: thin out the axis and sample per year
  const isWideRange = span >= 200

  // axis density: every year, every 10th year from 200+,
  // every 50th year from 400+
  const axisStep = span >= 400 ? 50 : isWideRange ? 10 : 1

  const dts = useMemo(
    () =>
      isWideRange
        ? getStartDatesOfYears(y1, y2)
        : getStartDatesOfMonths(y1, y2),
    [y1, y2, isWideRange]
  )

  const P = useMemo(
    () => upperPlanets.filter(p => settings.objects.planets[p]),
    [settings.objects.planets]
  )

  // heavy ephemeris walk: deferred so UI changes stay responsive
  const [deltas, setDeltas] = useState([])
  const [subgraphs, setSubgraphs] = useState([])

  const subgraphsOn = settings.subgraphs ?? false

  useEffect(() => {
    if (subgraphsOn) {
      // the index decomposed into one series per pair;
      // the total is the exact elementwise sum of those series
      const pairs = subgraphDeltas(P, dts)
      setSubgraphs(pairs)
      setDeltas(
        pairs.length
          ? pairs[0].values.map((_, k) =>
              pairs.reduce((acc, s) => acc + s.values[k], 0)
            )
          : []
      )
    } else {
      setSubgraphs([])
      setDeltas(dts.map(date => sumAngleDistances(P, date)))
    }
  }, [dts, P, subgraphsOn])

  // fit the real [min, max] of the drawn series into the padded height
  const pad = 20

  // the total is always drawn, pair curves come on top
  const drawn = subgraphsOn
    ? [...deltas, ...subgraphs.flatMap(series => series.values)]
    : deltas

  const min = drawn.length
    ? drawn.reduce((acc, v) => Math.min(acc, v), Infinity)
    : 0

  const max = drawn.length
    ? drawn.reduce((acc, v) => Math.max(acc, v), -Infinity)
    : 0

  const scale = max > min ? (H - 2 * pad) / (max - min) : 1

  // marker lines are drawn only when their year is on the axis
  const yearInRange = (date: Date) => {
    const year = date.getFullYear()
    return year >= y1 && year <= y2
  }

  // pointer position in svg units, null when the cursor is away
  const [cursor, setCursor] = useState(null)

  // client px -> viewBox units, the svg is css-scaled
  const trackCursor = e => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCursor({
      x: ((e.clientX - rect.left) * W) / rect.width,
      y: ((e.clientY - rect.top) * H) / rect.height
    })
  }

  // one sample per year in wide range, otherwise per month
  const samplesPerYear = isWideRange ? 1 : 12

  // date label of the nearest sample: MM.YYYY per month,
  // plain year in wide range
  const cursorDate = (() => {
    if (!cursor) return null
    const i = Math.min(
      Math.max(
        Math.round((cursor.x * span * samplesPerYear) / W - 1),
        0
      ),
      span * samplesPerYear - 1
    )
    return samplesPerYear === 1
      ? String(y1 + i)
      : `${String((i % 12) + 1).padStart(2, '0')}.${y1 + Math.floor(i / 12)}`
  })()

  // degree readout follows the chart's own y scale: the padded
  // drawing area runs from min at the floor to max at the top,
  // so pointing at a curve point reads that curve's value
  const cursorDegree = (() => {
    if (cursor == null) return null
    if (max <= min) return min.toFixed(1)
    const v = min + (H - pad - cursor.y) / scale
    return Math.min(Math.max(v, min), max).toFixed(1)
  })()

  // tooltip hugs the pointer, flipping sides near the edges
  const TOOLTIP_W = 56
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

  // x position of a year, matching the year gridlines
  const xForYear = (date: Date) =>
    ((date.getFullYear() - y1 + 1) * W) / span

  return (
    <div className={s.wrap}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        onMouseMove={trackCursor}
        onMouseLeave={() => setCursor(null)}
      >
        {/* Lets draw some grid */}
        {range(y1, y2)
          .filter(year => year % axisStep === 0)
          .map(year => {
            const x = ((year - y1 + 1) * W) / span
            return (
              <g key={year}>
                <line
                  x1={x}
                  y1="0"
                  x2={x}
                  y2={H}
                  className={s.axis}
                  strokeWidth=".2"
                  opacity={year % 10 == 0 ? 1 : 0.2}
                />
                {year % 10 == 0 && (
                  <text
                    x={x - 10}
                    y="-10"
                    opacity=".5"
                    fontSize={10}
                  >
                    {year}
                  </text>
                )}
              </g>
            )
          })}

        {/* horizontal degree reference lines */}
        {DEG_LINES.filter(({v}) => v >= min && v <= max).map(
          ({v, prominent}) => (
            <line
              key={v}
              x1="0"
              y1={H - pad - (v - min) * scale}
              x2={W}
              y2={H - pad - (v - min) * scale}
              stroke={prominent ? 'red' : 'var(--barbo-total-color)'}
              strokeWidth=".4"
              opacity=".5"
            />
          )
        )}

        {/* total index, always visible */}
        <Curve
          H={H}
          values={deltas}
          scale={scale}
          pad={pad}
          min={min}
          y1={y1}
          y2={y2}
          samplesPerYear={samplesPerYear}
          className={s.total}
        />

        {/* pair curves on top when subgraphs are active */}
        {subgraphsOn &&
          subgraphs.map((series, i) => (
            <Curve
              key={series.name}
              H={H}
              values={series.values}
              scale={scale}
              pad={pad}
              min={min}
              y1={y1}
              y2={y2}
              samplesPerYear={samplesPerYear}
              color={colorFor(i)}
              name={series.name
                .split('-')
                .map(p => planets[p])
                .join('')}
              nearZeroMark={NEAR_ZERO_DEG}
            />
          ))}

        {/* Current date line, drawn only when in range */}
        {yearInRange(transitData.date) && (
          <line
            x1={xForYear(transitData.date)}
            y1="0"
            x2={xForYear(transitData.date)}
            y2={H}
            stroke="red"
            opacity={1.4}
          />
        )}

        {/* Natal date line, drawn only when in range */}
        {yearInRange(natalData.date) && (
          <line
            x1={xForYear(natalData.date)}
            y1="0"
            x2={xForYear(natalData.date)}
            y2={H}
            stroke="green"
            opacity={1.4}
          />
        )}

        {/* vertical line following the mouse */}
        {cursor != null && (
          <line
            x1={cursor.x}
            y1="0"
            x2={cursor.x}
            y2={H}
            stroke="var(--barbo-total-color)"
            strokeWidth=".5"
            strokeDasharray="4 4"
            opacity={0.6}
            pointerEvents="none"
          />
        )}

        {/* tooltip: date and degree right at the pointer */}
        {cursor != null && cursorDate != null && (
          <g pointerEvents="none">
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
        {/* Y axis: top, central and bottom values */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2={H}
          className={s.axis}
          strokeWidth=".2"
          opacity={0.4}
        />
        <text
          x={4}
          y={pad}
          dominantBaseline="hanging"
          fontSize={10}
          opacity={0.5}
        >
          {Math.round(max)}°
        </text>
        <text
          x={4}
          y={H / 2}
          dominantBaseline="middle"
          fontSize={10}
          opacity={0.5}
        >
          {Math.round((min + max) / 2)}°
        </text>
        <text x={4} y={H - pad} fontSize={10} opacity={0.5}>
          {Math.round(min)}°
        </text>
      </svg>
    </div>
  )
}

function Curve({
  H,
  values,
  scale,
  pad,
  min,
  y1,
  y2,
  samplesPerYear,
  color,
  className,
  name,
  nearZeroMark
}) {
  if (!values.length) {
    return null
  }

  const [head, ...tail] = values

  const x = i => ((i + 1) * W) / ((y2 - y1) * samplesPerYear)

  const y = v => H - pad - (v - min) * scale

  const d =
    `M ${x(0)} ${y(head)} ` +
    tail.map((v, i) => `L ${x(i + 1)} ${y(v)}`).join(' ')

  // indices where the arc dips under the near-zero threshold,
  // each becomes a dot since the curve itself hugs the floor
  const nearZeroIdx =
    nearZeroMark == null
      ? []
      : values.reduce((acc, v, i) => {
          if (v <= nearZeroMark) acc.push(i)
          return acc
        }, [])

  // caption sits near the highest point of the series
  let peakIndex = 0
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[peakIndex]) {
      peakIndex = i
    }
  }

  const captionX = Math.min(Math.max(x(peakIndex), 24), W - 24)

  return (
    <>
      <path
        d={d}
        stroke={color}
        fill="transparent"
        className={className}
      />
      {nearZeroIdx.map(i => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(values[i])}
          r={3}
          fill={color ?? 'var(--barbo-total-color)'}
        >
          <title>{`${name}: ${values[i].toFixed(2)}°`}</title>
        </circle>
      ))}
      {name && (
        <text
          x={captionX}
          y={y(values[peakIndex]) - 6}
          textAnchor="middle"
          fontSize={10}
          fill={color}
        >
          {name}
        </text>
      )}
    </>
  )
}

function getStartDatesOfMonths(startYear, endYear) {
  const startDates = []

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      // Create a Date object for the first day of the month
      const date = new Date(year, month - 1, 1)
      startDates.push(date)
    }
  }

  return startDates
}

function getStartDatesOfYears(startYear, endYear) {
  const startDates = []

  for (let year = startYear; year <= endYear; year++) {
    startDates.push(new Date(year, 0, 1))
  }

  return startDates
}

function range(a: number, b: number) {
  const out = []
  for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
    out.push(i)
  }
  return out
}

function pairs(A: any[]) {
  const pairs = []

  for (let i = 0; i < A.length - 1; i++) {
    for (let j = i + 1; j < A.length; j++) {
      pairs.push([A[i], A[j]])
    }
  }

  return pairs
}
