import {useContext} from 'react'

import {SettingContext} from '../../../SettingContext.js'

import s from './index.module.css'

import {Body, Ecliptic, GeoVector} from 'astronomy-engine'

import planets from '../../../assets/planets.json'
import {CelestialContext} from '../../../CelestialContext.js'

const {sin, cos, abs} = Math

export default function Planets({calendarDay, zero, x0, y0}) {
  const sunPos = pos('Sun', calendarDay)

  const {settings} = useContext(SettingContext)
  const {horoscope} = useContext(CelestialContext)

  return (
    <>
      {Object.entries(planets)
        .filter(([key]) => settings.objects.planets[key])
        .map(([key, value]: any) => (
          <g key={key + 'G'}>
            <text
              data-planet={key}
              data-burn={abs(sunPos - pos(key, calendarDay)) < 4}
              data-in-mid-of-sun={
                abs(sunPos - pos(key, calendarDay)) < 0.4
              }
              className={s.planet}
              key={key + 'T'}
              fill="currentColor"
              x={
                x0 -
                5 +
                (88 +
                  (key == 'Sun' ? -10 : 0) +
                  (key == 'Moon' ? -7 : 0)) *
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
              {horoscope.CelestialBodies[key.toLowerCase()]
                .isRetrograde && <tspan dy="2">R</tspan>}
            </text>

            <text
              data-planet={key}
              data-burn={abs(sunPos - pos(key, calendarDay)) < 4}
              data-in-mid-of-sun={
                abs(sunPos - pos(key, calendarDay)) < 0.4
              }
              className={s.planet}
              key={key + 'Tt'}
              fill="currentColor"
              x={
                x0 -
                4 +
                (88 +
                  (key == 'Sun' ? -10 : 0) +
                  (key == 'Moon' ? -7 : 0)) *
                  sin(((pos(key, calendarDay) + zero) * 3.14) / 180)
              }
              y={
                y0 -
                5 +
                +(85 + (key == 'Sun' ? -10 : 0)) *
                  cos(((pos(key, calendarDay) + zero) * 3.14) / 180)
              }
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
              cx={
                x0 +
                70 *
                  sin(((pos(key, calendarDay) + zero) * 3.14) / 180)
              }
              cy={
                y0 +
                70 *
                  cos(((pos(key, calendarDay) + zero) * 3.14) / 180)
              }
              r="1"
            />

            <circle
              data-planet={key}
              key={'ccv1' + key}
              fill="currentColor"
              strokeWidth="3"
              cx={
                x0 +
                100 *
                  sin(((pos(key, calendarDay) + zero) * 3.14) / 180)
              }
              cy={
                y0 +
                100 *
                  cos(((pos(key, calendarDay) + zero) * 3.14) / 180)
              }
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
