/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */

import React from 'react'

import s from './index.module.css'

import {Body, Ecliptic, GeoVector} from 'astronomy-engine'

const {sin, cos} = Math

import raw from '../../assets/stars.json'
import planets from '../../assets/planets.json'

const z = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces'
] as const

type Sign = (typeof z)[number]

const stars = raw.map(parse)

export default function Stars({calendarDay, zero, x0, y0}) {
  return (
    <>
      {stars.map(({name, elon, type}) => (
        <g key={name}>
          <circle
            data-visible={planetAspect(elon, calendarDay)}
            className={s.star}
            data-star={name}
            data-type={type}
            cx={x0 + 144 * sin(((elon + zero) * 3.14) / 180)}
            cy={y0 + 144 * cos(((elon + zero) * 3.14) / 180)}
            r="1"
          />

          <line
            data-visible={planetAspect(elon, calendarDay)}
            className={s.starline}
            stroke="lightgray"
            strokeWidth=".3"
            x1={x0 + 144 * sin(((elon + zero) * 3.14) / 180)}
            y1={y0 + 144 * cos(((elon + zero) * 3.14) / 180)}
            x2={x0 + 70 * sin(((elon + zero) * 3.14) / 180)}
            y2={y0 + 70 * cos(((elon + zero) * 3.14) / 180)}
          />

          <text
            className={s.text}
            fill="currentColor"
            x={x0 + 144 * sin(((elon + zero) * 3.14) / 180)}
            y={y0 - 5 + 144 * cos(((elon + zero) * 3.14) / 180)}
          >
            {name}
          </text>
        </g>
      ))}
    </>
  )
}

function pos(body: keyof typeof Body, date: Date) {
  const x = GeoVector(Body[body], date, false)
  const pos = Ecliptic(x)
  return pos.elon
}

function parse(d) {
  return {
    name: d[0],
    elon: elon(d[3]),
    type: d[9]
  }
}

function elon(s: `${number} ${Sign} ${number}`) {
  const [deg, sign, min] = s.split(' ')
  const n = z.findIndex(x => x == sign)
  return n >= 0 ? n * 30 + +deg + +min / 60 : null
}

function planetAspect(elon, calendarDay) {
  type P = keyof typeof planets
  const pos2 = Object.keys(planets).map((x: P) => pos(x, calendarDay))
  const near = pos2.findIndex(x => Math.abs(x - elon) < 1)
  return near >= 0
}
