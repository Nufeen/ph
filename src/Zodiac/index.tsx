import React from 'react'

import s from './index.module.css'

import {Body, Ecliptic, GeoVector} from 'astronomy-engine'

import planets from '../assets/planets.json'
import houses from '../assets/houses.json'
import dignity from '../assets/dignity.json'
import exaltation from '../assets/exaltation.json'

const {sin, cos, abs} = Math

const l = [...Array(12).keys()]

type Props = {
  calendarDay: Date
}

export default function Zodiac(props: Props) {
  const {calendarDay} = props
  const x0 = 150
  const y0 = 155

  const r = 130

  const sunPos = pos('Sun', calendarDay)
  const sunHouse = house('Sun', calendarDay)

  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className={s.figure}>
      <circle cx={x0} cy={y0} r={r} />

      {l.map(i => (
        <line
          key={i}
          x1={x0}
          y1={y0}
          x2={x0 + r * sin((i * 30 * 3.14) / 180)}
          y2={y0 + r * cos((i * 30 * 3.14) / 180)}
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
          x={x0 - 5 + (r - 15) * sin(((i * 30 - 90 + 15) * 3.14) / 180)}
          y={y0 + 3 + (r - 15) * cos(((i * 30 - 90 + 15) * 3.14) / 180)}
        >
          {houses[i]}
        </text>
      ))}

      {l.map(i => (
        <text
          className={s.dignity}
          key={i}
          fill={i == sunHouse - 1 ? 'gold' : 'gray'}
          x={x0 - 4 + (r + 7) * sin(((i * 30 - 90 + 15) * 3.14) / 180)}
          y={y0 + 3 + (r + 7) * cos(((i * 30 - 90 + 15) * 3.14) / 180)}
        >
          {planets[dignity[i]]}
        </text>
      ))}

      {l.map(
        i =>
          exaltation[i] && (
            <text
              className={s.exaltation}
              key={i}
              fill="chocolate"
              x={x0 - 4 + (r + 7) * sin(((i * 30 - 90 + 10) * 3.14) / 180)}
              y={y0 + 3 + (r + 7) * cos(((i * 30 - 90 + 10) * 3.14) / 180)}
            >
              {planets[exaltation[i]]}
            </text>
          )
      )}

      {Object.entries(planets).map(([key, value]) => (
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
              sin(((pos(key, calendarDay) - 90) * 3.14) / 180)
          }
          y={
            y0 +
            5 +
            +(85 + (key == 'Sun' ? -10 : 0)) *
              cos(((pos(key, calendarDay) - 90) * 3.14) / 180)
          }
        >
          {value}
        </text>
      ))}
    </svg>
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
