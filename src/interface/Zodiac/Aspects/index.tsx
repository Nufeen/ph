import {useContext} from 'react'
import {SettingContext} from '../../../SettingContext.js'
import {CelestialContext} from '../../../CelestialContext.js'
import s from './index.module.css'

import React from 'react'

const {sin, cos, abs} = Math

export default function Aspects({zero, x0, y0}) {
  const {horoscope, progressedHoroscope, transitHoroscope} =
    useContext(CelestialContext)

  const {settings} = useContext(SettingContext)

  const threshold = settings.interface.aspectOrb ?? 4

  const [natal, transit, progressed] = [
    horoscope,
    transitHoroscope,
    progressedHoroscope
  ].map(x =>
    x.CelestialBodies.all
      .filter(
        (planet: {label: string | number}) =>
          settings?.objects?.planets[planet?.label]
      )
      .map(
        (z: {ChartPosition: {Ecliptic: {DecimalDegrees: number}}}) =>
          z.ChartPosition.Ecliptic.DecimalDegrees
      )
  )

  const M = {
    transit,
    progressed,
    natal
  }

  const AT = []

  M.natal.forEach((a: any) => {
    M[settings.chartType].forEach((b: any) => {
      const aspect = aspectBetween(a, b)
      if (aspect) {
        AT.push(aspect)
      }
    })
  })

  function angleDistance(a, b) {
    return Math.min(
      360 - (Math.abs(a - b) % 360),
      Math.abs(a - b) % 360
    )
  }

  function aspectBetween(a: number, b: number) {
    let d = angleDistance(a, b)

    if (d < 50 || (d > 133 && d < 170)) return null

    if (d % 30 <= threshold || 30 - (d % 30) < threshold) {
      return {
        a,
        b,
        d: d % 30,
        d0: d
      }
    }

    return null
  }

  function deg(x: number) {
    return ((x + zero) * Math.PI) / 180
  }

  return (
    <>
      {AT.map(({a, b, d, d0}) => (
        <React.Fragment key={JSON.stringify([a, b])}>
          <line
            data-d={~~d0}
            x1={x0 + 70 * sin(deg(a))}
            y1={y0 + 70 * cos(deg(a))}
            x2={x0 + 70 * sin(deg(b))}
            y2={y0 + 70 * cos(deg(b))}
            stroke={
              abs(d0) % 45 < 10 || abs(d0) % 45 > 45 - 10
                ? 'red'
                : 'deepskyblue'
            }
            strokeWidth={d < 1 ? 1 : 0.3}
          />
          <line
            className={s.line}
            data-d={~~d0}
            x1={x0 + 70 * sin(deg(a))}
            y1={y0 + 70 * cos(deg(a))}
            x2={x0 + 70 * sin(deg(b))}
            y2={y0 + 70 * cos(deg(b))}
            stroke={'transparent'}
            strokeWidth={5}
          />
          {settings.interface.aspectAngles && (
            <text
              fill="silver"
              fontSize={4}
              textAnchor="middle"
              x={
                getMidpoint(
                  x0 + 70 * sin(deg(a)),
                  y0 + 70 * cos(deg(a)),
                  x0 + 70 * sin(deg(b)),
                  y0 + 70 * cos(deg(b))
                ).centerX
              }
              y={
                getMidpoint(
                  x0 + 70 * sin(deg(a)),
                  y0 + 70 * cos(deg(a)),
                  x0 + 70 * sin(deg(b)),
                  y0 + 70 * cos(deg(b))
                ).centerY
              }
            >
              {~~d0}°
            </text>
          )}
        </React.Fragment>
      ))}
    </>
  )
}

function getMidpoint(x1, y1, x2, y2) {
  const centerX = (x1 + x2) / 2
  const centerY = (y1 + y2) / 2
  return {centerX, centerY}
}
