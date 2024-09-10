/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */

import React, {useEffect} from 'react'

import Stars from './Stars'

import s from './index.module.css'

import {Body, Ecliptic, GeoVector} from 'astronomy-engine'

import planets from '../assets/planets.json'
import houses from '../assets/houses.json'

import {Origin, Horoscope} from 'circular-natal-horoscope-js/dist/index.js'

const {sin, cos, abs} = Math

const l = [...Array(12).keys()]

type P = keyof typeof planets

type Props = {
  calendarDay: Date
  lat: number
  lng: number
}

function getHouse(calendarDay: Date, latitude: number, longitude: number) {
  const year = calendarDay.getFullYear()
  const month = calendarDay.getMonth()
  const date = calendarDay.getDate()
  const hour = calendarDay.getHours()
  const minute = calendarDay.getMinutes()

  const origin = new Origin({
    year,
    month, // 0 = January, 11 = December!
    date,
    hour,
    minute,
    latitude,
    longitude
  })

  const horoscope = new Horoscope({
    origin: origin,
    houseSystem: 'placidus',
    zodiac: 'tropical',
    aspectPoints: ['bodies', 'points', 'angles'],
    aspectWithPoints: ['bodies', 'points', 'angles'],
    aspectTypes: ['major', 'minor'],
    customOrbs: {},
    language: 'en'
  })

  return horoscope.Houses
}

export default function Zodiac(props: Props) {
  const {calendarDay, lat, lng} = props

  const x0 = 150
  const y0 = 155

  const r = 130

  const sunHouse = house('Sun', calendarDay)

  const zero = -90

  return (
    <div className={s.wrapper}>
      <svg width="300" height="300" viewBox="0 0 300 300" className={s.figure}>
        <circle cx={x0} cy={y0} r={r} />

        {l.map(i => (
          <line
            key={i}
            x1={x0}
            y1={y0}
            x2={x0 + r * sin((i * 30 * 3.14 + zero) / 180)}
            y2={y0 + r * cos((i * 30 * 3.14 + zero) / 180)}
            stroke="currentColor"
          />
        ))}

        <circle cx={x0} cy={y0} r="100" />
        <circle cx={x0} cy={y0} r="70" />
        <circle cx={x0} cy={y0} r="144" />

        {l.map(i => (
          <text
            className={s.house}
            key={i}
            fill="currentColor"
            x={x0 - 5 + (r - 15) * sin(((i * 30 + zero + 15) * 3.14) / 180)}
            y={y0 + 3 + (r - 15) * cos(((i * 30 + zero + 15) * 3.14) / 180)}
          >
            {houses[i]}
          </text>
        ))}

        <Houses {...{calendarDay, zero, x0, y0, lat, lng}} />
        <TraditionalPlanetes {...{calendarDay, zero, x0, y0}} />
        <Aspects {...{calendarDay, zero, x0, y0}} />
        <Stars {...{calendarDay, zero, x0, y0}} />
      </svg>
    </div>
  )
}

function Houses({calendarDay, zero, x0, y0, lat, lng}) {
  const H = getHouse(calendarDay, lat, lng)

  function deg(i) {
    const x = H[i].ChartPosition.StartPosition.Ecliptic.DecimalDegrees
    return ((x + zero) * 3.14) / 180
  }

  const l = 155
  const A = ['ASC', 2, 3, 'IC', 5, 6, 'DSC', 8, 9, 'MC', 11, 12]

  return (
    <>
      {H.map((_, i) => (
        <line
          key={i}
          stroke="violet"
          strokeOpacity={i % 3 == 0 ? 0.4 : 0.2}
          x1={x0 + (l - 56) * sin(deg(i))}
          y1={y0 + (l - 56) * cos(deg(i))}
          x2={x0 + l * sin(deg(i))}
          y2={y0 + l * cos(deg(i))}
        />
      ))}

      {H.map((_, i) => (
        <text
          fill="violet"
          fontSize={5}
          opacity={0.5}
          key={i}
          x={x0 + (l + 1) * sin(deg(i)) - 7}
          y={y0 + (l + 5) * cos(deg(i))}
        >
          {i % 3
            ? ''
            : `${A[i]} ${~~(H[i].ChartPosition.StartPosition.Ecliptic.DecimalDegrees % 30)}°`}
        </text>
      ))}
    </>
  )
}

function TraditionalPlanetes({calendarDay, zero, x0, y0}) {
  const sunPos = pos('Sun', calendarDay)

  return (
    <>
      {Object.entries(planets).map(([key, value]: any) => (
        <text
          data-planet={key}
          data-burn={abs(sunPos - pos(key, calendarDay)) < 4}
          data-in-mid-of-sun={abs(sunPos - pos(key, calendarDay)) < 0.4}
          className={s.planet}
          key={key}
          fill="currentColor"
          x={
            x0 -
            5 +
            (88 + (key == 'Sun' ? -10 : 0)) *
              sin(((pos(key, calendarDay) + zero) * 3.14) / 180)
          }
          y={
            y0 +
            5 +
            +(85 + (key == 'Sun' ? -10 : 0)) *
              cos(((pos(key, calendarDay) + zero) * 3.14) / 180)
          }
        >
          {value}
        </text>
      ))}
    </>
  )
}

function Aspects({calendarDay, zero, x0, y0}) {
  const l = Object.keys(planets) as P[]

  const aspectTable = l.reduce((a, planet1, i) => {
    a[i] = a[i] || []

    l.forEach((planet2, j) => {
      if (i <= j) a[i][j] = checkAspect(planet1, planet2, calendarDay)
    })

    return a
  }, [])

  return (
    <>
      {aspectTable.map((al, i) =>
        al.map(
          (n: number, j: number) =>
            n != 0 && (
              <line
                key={JSON.stringify([i, j])}
                x1={
                  x0 + 70 * sin(((pos(l[i], calendarDay) + zero) * 3.14) / 180)
                }
                y1={
                  y0 + 70 * cos(((pos(l[i], calendarDay) + zero) * 3.14) / 180)
                }
                x2={
                  x0 + 70 * sin(((pos(l[j], calendarDay) + zero) * 3.14) / 180)
                }
                y2={
                  y0 + 70 * cos(((pos(l[j], calendarDay) + zero) * 3.14) / 180)
                }
                stroke={n < 0 ? 'red' : 'deepskyblue'}
                strokeWidth={Math.abs(n) > 1 ? '1' : '.3'}
              />
            )
        )
      )}
      {Object.entries(planets).map(([key]: any) => (
        <circle
          data-planet={key}
          key={key}
          fill="currentColor"
          strokeWidth="3"
          cx={x0 + 70 * sin(((pos(key, calendarDay) + zero) * 3.14) / 180)}
          cy={y0 + 70 * cos(((pos(key, calendarDay) + zero) * 3.14) / 180)}
          r="1"
        />
      ))}
    </>
  )
}

function pos(body: keyof typeof Body, date: Date) {
  const x = GeoVector(Body[body], date, false)
  const pos = Ecliptic(x)
  return pos.elon
}

function house(body: keyof typeof Body, date: Date) {
  const x = GeoVector(Body[body], date, false)
  const pos = Ecliptic(x)
  const house = ~~(pos.elon / 30) + 1
  return house
}

function checkAspect(planet1, planet2, calendarDay) {
  if (planet1 == planet2) {
    return 0
  }

  let [a, b] = [pos(planet1, calendarDay), pos(planet2, calendarDay)]

  if (a > 180) a = a - 360
  if (b > 180) b = b - 360

  let orb = 3

  if (
    [planet1, planet2].includes('Jupiter') ||
    [planet1, planet2].includes('Moon')
  ) {
    orb = 4
  }

  if ([planet1, planet2].includes('Saturn')) {
    orb = 5
  }

  if ([planet1, planet2].includes('Sun')) {
    orb = 7
  }

  const d = abs(a - b)

  const aspects = [abs(d - 120), abs(d - 60), abs(d - 180), abs(d - 90), d]

  const exact = aspects.findIndex(x => x < 1) + 1

  if (exact) {
    return exact > 2 ? -2 : 2
  }

  const inorb = aspects.findIndex(x => x < orb) + 1

  if (inorb) {
    return inorb > 2 ? -1 : 1
  }

  return 0
}
