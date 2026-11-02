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

        {/* total index, always visible */}
        <Curve
          H={H}
          values={deltas}
          scale={scale}
          pad={pad}
          min={min}
          y1={y1}
          y2={y2}
          samplesPerYear={isWideRange ? 1 : 12}
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
              samplesPerYear={isWideRange ? 1 : 12}
              color={colorFor(i)}
              name={series.name.split('-').map(p => planets[p]).join('')}
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
  name
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
