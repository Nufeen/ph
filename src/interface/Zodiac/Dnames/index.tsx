import {useContext} from 'react'
import {
  SettingContext,
  SettingContextType
} from '../../../SettingContext.js'

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
  const {settings} = useContext(SettingContext) as SettingContextType

  const sid = settings.zodiacType === 'Sidereal' ? 24 : 0

  const P = Object.entries(planets)
    .filter(([key]) => settings.objects.planets[key])
    .map(([key]: any) => pos(key, calendarDay) - sid)
    .map(p => ~~(p / 5))

  const lines = [...Array(72).keys()].map(i => ({
    x1:
      x0 +
      (r + (i % 2 ? 15 : 18)) *
        sin(((i * 5 + zero + sid + 1) * π) / 180),
    y1:
      y0 +
      (r + (i % 2 ? 15 : 18)) *
        cos(((i * 5 + zero + sid + 1) * π) / 180),
    x2: x0 + (r + 14) * sin(((i * 5 + zero + sid + 1) * π) / 180),
    y2: y0 + (r + 14) * cos(((i * 5 + zero + sid + 1) * π) / 180)
  }))

  const marks = [...Array(72).keys()].map(i => ({
    x1: x0 - (r + 14) * sin(((i * 5 + zero + sid + 3.5) * π) / 180),
    y1: y0 - (r + 14) * cos(((i * 5 + zero + sid + 3.5) * π) / 180),
    x2: x0 - (r + 0) * sin(((i * 5 + zero + sid + 3.5) * π) / 180),
    y2: y0 - (r + 0) * cos(((i * 5 + zero + sid + 3.5) * π) / 180)
  }))

  const nn = [...Array(72).keys()].map(i => ({
    x1:
      x0 +
      (r * 1.1 + 15) *
        sin(((i * 5 + zero + sid + 4) * π - π) / 180) -
      10,
    y1:
      y0 +
      (r * 1.1 + 15) *
        cos(((i * 5 + zero + sid + 4) * π - π) / 180) -
      0
  }))

  return (
    <>
      {marks.map(
        (x, i) =>
          P.includes(i) && (
            <line
              className={s.dline}
              opacity={0.2}
              key={i}
              {...x}
              stroke="green"
            />
          )
      )}

      {marks.map(
        (x, i) =>
          P.includes((i + 36) % 72) && (
            <line
              className={s.dline}
              opacity={0.2}
              key={i}
              {...x}
              stroke="red"
            />
          )
      )}

      {lines.map((x, i) => (
        <line opacity={0.5} key={i} {...x} stroke="cyan" />
      ))}

      {dnames.map(([a, d], i) => (
        <text
          className={s.dname}
          key={a}
          data-planet={P.includes(i)}
          data-opposite={P.includes((i + 36) % 72)}
          x={nn[i].x1}
          y={nn[i].y1}
        >
          {d}
        </text>
      ))}
    </>
  )
}
