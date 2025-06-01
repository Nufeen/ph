import {useContext} from 'react'

import s from './index.module.css'

import {Body, Ecliptic, GeoVector} from 'astronomy-engine'

import planets from '../../../assets/planets.json'

import {CelestialContext} from '../../../CelestialContext.js'
import {SettingContext} from '../../../SettingContext.js'

const {sin, cos, abs} = Math
const π = Math.PI

export default function Planets({calendarDay, zero, x0, y0}) {
  // We later use ecliptical position of Sun
  // to calculate burned and kazimi status of planets
  const sunLng = pos('Sun', calendarDay)

  const {settings} = useContext(SettingContext)
  const {horoscope} = useContext(CelestialContext)

  // Chart data preparation
  const P = Object.entries(planets)
    .filter(([key]) => settings.objects.planets[key])
    .map(([key, value]: any) => ({
      key,
      value,
      lng: pos(key, calendarDay),
      angle: ((pos(key, calendarDay) + zero) * π) / 180,
      x:
        x0 +
        80 * sin(((pos(key, calendarDay) + zero) * π) / 180) -
        5,
      y:
        y0 + 5 + 85 * cos(((pos(key, calendarDay) + zero) * π) / 180)
    }))
    .sort((a, b) => a.x - b.x)

  // kind of naive collision detection
  for (let i = 0; i < P.length - 1; i++) {
    if (abs(P[i + 1].y - P[i].y) < 10 && P[i + 1].x - P[i].x < 5) {
      P[i + 1].x = P[i].x + 7
    }
  }

  return (
    <>
      {P.map(({key, value, lng, x, y}: any) => (
        <g key={key + 'G'}>
          <text
            data-planet={key}
            data-burn={abs(sunLng - lng) < 4}
            data-in-mid-of-sun={abs(sunLng - lng) < 0.4}
            className={s.planet}
            key={key + 'T'}
            fill="currentColor"
            x={x}
            y={y}
          >
            {value}
            {horoscope.CelestialBodies[key.toLowerCase()]
              .isRetrograde && <tspan dy="2">R</tspan>}
          </text>

          <text
            data-planet={key}
            data-burn={abs(sunLng - lng) < 4}
            data-in-mid-of-sun={abs(sunLng - lng) < 0.4}
            className={s.planet}
            key={key + 'Tt'}
            fill="currentColor"
            x={x}
            y={y - 9}
          >
            {settings.interface.planetAngles && (
              <tspan dy="0">
                {
                  horoscope.CelestialBodies[
                    key.toLowerCase()
                  ].ChartPosition.Ecliptic.ArcDegreesFormatted30.split(
                    ' '
                  )[0]
                }
              </tspan>
            )}
          </text>

          <circle
            data-planet={key}
            key={'ccv' + key}
            fill="currentColor"
            strokeWidth="3"
            cx={x0 + 70 * sin(((lng + zero) * π) / 180)}
            cy={y0 + 70 * cos(((lng + zero) * π) / 180)}
            r="1"
          />

          <circle
            data-planet={key}
            key={'ccv1' + key}
            fill="currentColor"
            strokeWidth="3"
            cx={x0 + 100 * sin(((lng + zero) * π) / 180)}
            cy={y0 + 100 * cos(((lng + zero) * π) / 180)}
            r="1"
          />
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
