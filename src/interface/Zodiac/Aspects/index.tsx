import {useContext} from 'react'
import {SettingContext} from '../../../SettingContext.js'
import {CelestialContext} from '../../../CelestialContext.js'
import s from './index.module.css'

import React from 'react'

const {sin, cos, abs} = Math

export default function Aspects({calendarDay, zero, x0, y0}) {
  const {horoscope, transitHoroscope} = useContext(CelestialContext)

  const {settings} = useContext(SettingContext)

  const threshold = settings.interface.aspectOrb ?? 4

  const N = horoscope.CelestialBodies.all
    .filter(planet => settings?.objects?.planets[planet?.label])
    .map(x => x.ChartPosition.Ecliptic.DecimalDegrees)

  const T = transitHoroscope.CelestialBodies.all
    .filter(planet => settings?.objects?.planets[planet?.label])
    .map(x => x.ChartPosition.Ecliptic.DecimalDegrees)

  const AT = []

  N.forEach(a => {
    ;(settings.chartType == 'transit' ? T : N).forEach(b => {
      const aspect = aspectBetween(a, b)
      if (aspect) {
        AT.push(aspect)
      }
    })
  })

  function aspectBetween(a, b) {
    let d = abs(a - b)

    if (d > 170) {
      d = 360 - a + b
    }

    if (d < 50 || (d > 133 && d < 170)) return null

    if (d % 30 < threshold || d % 30 > 30 - threshold) {
      return {
        a,
        b,
        d: d % 30,
        d0: d
      }
    }

    return null
  }

  function deg(x) {
    return ((x + zero) * 3.14) / 180
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
          {false && (
            <text
              fill="white"
              fontSize={4}
              textAnchor="middle"
              x={1 * (1 * sin(deg(a)) - 1 * sin(deg(b))) + x0}
              y={1 * (1 * cos(deg(a)) - 1 * cos(deg(b))) + y0}
            >
              {~~d0}°
            </text>
          )}
        </React.Fragment>
      ))}
    </>
  )
}