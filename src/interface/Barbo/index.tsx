import s from './index.module.css'

import {Body, Ecliptic, GeoVector} from 'astronomy-engine'
import {SettingContext} from '../../SettingContext'
import {CelestialContext} from '../../CelestialContext'

import {useContext} from 'react'
import {useMemo} from 'react'

import planets from '../../assets/planets.json'
import zodiacSigns from '../../assets/zodiac.json'

// SVG Canvas Width
// 1200 is nice for 12 * i math
const W = 1200

const H = 600

function pos(body: keyof typeof Body, date: Date) {
  const x = GeoVector(Body[body], date, false)
  const pos = Ecliptic(x)
  return ((pos.elon - 0) / 360) * W
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

function range(a, b) {
  const out = []
  for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
    out.push(i)
  }
  return out
}

function pairs(A) {
  const pairs = []

  for (let i = 0; i < A.length - 1; i++) {
    for (let j = i + 1; j < A.length; j++) {
      pairs.push([A[i], A[j]])
    }
  }

  return pairs
}

const upperPlanets = [
  'Jupiter',
  'Saturn',
  'Mars',
  'Uranus',
  'Neptune',
  'Pluto'
]

const colorPairs = {}

for (let i = 0; i < upperPlanets.length - 1; i++) {
  for (let j = i + 1; j < upperPlanets.length; j++) {
    const pair = [upperPlanets[i], upperPlanets[j]]
    colorPairs[`${pair[0]}-${pair[1]}`] = colorPairs[
      `${pair[0]}-${pair[1]}`
    ] = `#${i * 2}${j * 2}${2}`.substring(0, 6)
  }
}

const y1 = 1900

const y2 = 2050

export default function Barbo() {
  const {settings} = useContext(SettingContext)
  const {natalData, transitData} = useContext(CelestialContext)

  const dts = useMemo(() => getStartDatesOfMonths(y1, y2), [y1, y2])

  const P = upperPlanets.filter(p => settings.objects.planets[p])

  const deltas = useMemo(() => {
    return dts.map(
      date => sumAngleDistances(P, date) * (180 / Math.PI)
    )
  }, [dts, P])

  const max = Math.max(...deltas)

  const scale = (~~(max / 100) * 100 + 100) / H

  return (
    <div className={s.wrap}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lets draw some grid */}
        {range(y1, y2).map((year, i) => {
          return (
            <>
              <line
                x1={((i + 1) * W) / (y2 - y1)}
                y1="0"
                x2={((i + 1) * W) / (y2 - y1)}
                y2={H}
                stroke="white"
                strokeWidth=".2"
                opacity={year % 10 == 0 ? 1 : 0.2}
              />
              {year % 10 == 0 && (
                <text
                  x={((i + 1) * W) / (y2 - y1) - 10}
                  y="-10"
                  opacity=".5"
                  fontSize={10}
                >
                  {year}
                </text>
              )}
            </>
          )
        })}

        {false &&
          pairs(P).map((pair, j) => (
            <g key={j}>
              {dts
                .map(
                  d =>
                    angleDistance(pos(pair[0], d), pos(pair[1], d)) *
                    (180 / Math.PI)
                )
                .map((y, i) => (
                  <>
                    {false && (
                      <circle
                        cx={((i + 1) * W) / (y2 - y1) / 12}
                        cy={H - y}
                        r="1"
                        stroke={colorPairs[`${pair[0]}-${pair[1]}`]}
                        fill={colorPairs[`${pair[0]}-${pair[1]}`]}
                        strokeWidth="1"
                      />
                    )}
                    {(y > 175 || y < 1) && (
                      <text
                        fontSize={10}
                        x={((i + 1) * W) / (y2 - y1) / 12 + 11}
                        y={H - y}
                        fill={colorPairs[`${pair[0]}-${pair[1]}`]}
                      >
                        {~~y}
                      </text>
                    )}
                  </>
                ))}
              <Path pair={pair} dts={dts} H={H} />
            </g>
          ))}

        <TotalPath deltas={deltas} H={H} />

        {/* Current date line */}
        <line
          x1={
            ((transitData.date.getFullYear() - y1 + 1) * W) /
            (y2 - y1)
          }
          y1="0"
          x2={
            ((transitData.date.getFullYear() - y1 + 1) * W) /
            (y2 - y1)
          }
          y2={H}
          stroke="red"
          opacity={1.4}
        />

        {/* Natal date line */}
        <line
          x1={
            ((natalData.date.getFullYear() - y1 + 1) * W) / (y2 - y1)
          }
          y1="0"
          x2={
            ((natalData.date.getFullYear() - y1 + 1) * W) / (y2 - y1)
          }
          y2={H}
          stroke="green"
          opacity={1.4}
        />
      </svg>
    </div>
  )
}

function Path({pair, dts, H}) {
  const deltas = dts.map(
    date =>
      angleDistance(pos(pair[0], date), pos(pair[1], date)) *
      (180 / Math.PI)
  )

  const [head, ...tail] = deltas

  const d =
    `M ${(1 * W) / (y2 - y1) / 12} ${H - head} ` +
    tail
      .map((y, i) => `L ${((i + 1) * W) / (y2 - y1) / 12}, ${H - y}`)
      .join(' ')

  return (
    <path
      d={d}
      stroke={colorPairs[`${pair[0]}-${pair[1]}`]}
      fill="transparent"
    />
  )
}

function TotalPath({H, deltas}) {
  const [head, ...tail] = deltas

  const d =
    `M ${(1 * W) / (y2 - y1) / 12} ${H - head} ` +
    tail
      .map((y, i) => `L ${((i + 1) * W) / (y2 - y1) / 12}, ${H - y}`)
      .join(' ')

  return <path d={d} stroke={'white'} fill="transparent" />
}

// TODO check
function angleDistance(a, b) {
  // Convert angles from degrees to radians
  const aRad = (a * Math.PI) / 180
  const bRad = (b * Math.PI) / 180

  // Calculate the sine of each angle
  const sinA = Math.sin(aRad)
  const sinB = Math.sin(bRad)

  // Calculate the arcsine of each sine value
  const arcsinA = Math.asin(sinA)
  const arcsinB = Math.asin(sinB)

  // Find the absolute difference between the arcsines
  let distance = Math.abs(arcsinA - arcsinB)

  // Use the modulus operation to ensure the result is in the range [0, π]
  distance = Math.min(distance, 2 * Math.PI - distance)

  return distance
}

function sumAngleDistances(upperPlanets, date) {
  let totalAngleDistance = 0

  for (let i = 0; i < upperPlanets.length; i++) {
    const planet1 = upperPlanets[i]
    for (let j = i + 1; j < upperPlanets.length; j++) {
      const planet2 = upperPlanets[j]
      const yValue = angleDistance(
        pos(planet1, date),
        pos(planet2, date)
      )
      totalAngleDistance += yValue
    }
  }

  return totalAngleDistance
}
