import {useContext} from 'react'
import {SettingContext} from '../../../SettingContext.js'

import s from './index.module.css'

const {sin, cos} = Math
const π = Math.PI

import dnames from '../../../assets/dnames.json'
import planets from '../../../assets/planets.json'
import {Body, Ecliptic, GeoVector} from 'astronomy-engine'

function pos(body: keyof typeof Body, date: Date) {
  const x = GeoVector(Body[body], date, false)
  const pos = Ecliptic(x)
  return pos.elon
}
export default function Decans72({zero, x0, r, y0, calendarDay}) {
  const {settings} = useContext(SettingContext)

  const P = Object.entries(planets)
    .filter(([key]) => settings.objects.planets[key])
    .map(([key]: any) => pos(key, calendarDay))
    .map(p => ~~(p / 5))

  const ll = [...Array(72).keys()].map(i => ({
    x1:
      x0 +
      (r + (i % 2 ? 15 : 18)) *
        sin(((i * 5 + zero + 1) * π - π) / 180),
    y1:
      y0 +
      (r + (i % 2 ? 15 : 18)) *
        cos(((i * 5 + zero + 1) * π - π) / 180),
    x2: x0 + (r + 14) * sin(((i * 5 + zero + 1) * π - π) / 180),
    y2: y0 + (r + 14) * cos(((i * 5 + zero + 1) * π - π) / 180),

    x3: x0 - (r + 14) * sin(((i * 5 + zero + 3.5) * π - π) / 180),
    y3: y0 - (r + 14) * cos(((i * 5 + zero + 3.5) * π - π) / 180),
    x4: x0 - (r + 0) * sin(((i * 5 + zero + 3.5) * π - π) / 180),
    y4: y0 - (r + 0) * cos(((i * 5 + zero + 3.5) * π - π) / 180)
  }))

  const nn = [...Array(72).keys()].map(i => ({
    x1:
      x0 +
      (r * 1.1 + 15) * sin(((i * 5 + zero + 4) * π - π) / 180) -
      10,
    y1:
      y0 +
      (r * 1.1 + 15) * cos(((i * 5 + zero + 4) * π - π) / 180) -
      0
  }))

  return (
    <>
      {ll.map((x, i) => (
        <line
          className={s.dline}
          opacity={P.includes(i) ? 0.2 : 0}
          key={i}
          x1={x.x3}
          y1={x.y3}
          x2={x.x4}
          y2={x.y4}
          stroke="red"
        />
      ))}
      {ll.map((x, i) => (
        <line
          opacity={0.5}
          key={i}
          x1={x.x1}
          y1={x.y1}
          x2={x.x2}
          y2={x.y2}
          stroke="cyan"
        />
      ))}

      {dnames.map(([a, d], i) => (
        <text
          className={s.dname}
          key={a}
          data-planet={P.includes(i)}
          x={nn[i].x1}
          y={nn[i].y1}
        >
          {d}
        </text>
      ))}
    </>
  )
}
