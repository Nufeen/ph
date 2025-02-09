import {useContext} from 'react'
import {SettingContext} from '../../../SettingContext.js'
import {
  Origin,
  Horoscope
} from 'circular-natal-horoscope-js/dist/index.js'

import s from './index.module.css'

const {sin, cos} = Math

export default function Fictive({
  calendarDay,
  zero,
  x0,
  y0,
  lat,
  lng
}) {
  const {settings} = useContext(SettingContext)

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
    latitude: lat,
    longitude: lng
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

  const ldd =
    horoscope.CelestialPoints.lilith.ChartPosition.Ecliptic
      .DecimalDegrees

  const ldd30 =
    horoscope.CelestialPoints.lilith.ChartPosition.Ecliptic
      .ArcDegreesFormatted30

  const lilithDeg = ((ldd + zero) * Math.PI) / 180

  const nndd =
    horoscope.CelestialPoints.northnode.ChartPosition.Ecliptic
      .DecimalDegrees

  const northnodeDeg = ((nndd + zero) * Math.PI) / 180

  return (
    <g className={s.wrapper}>
      {settings.objects.celestialPoints.lilith && (
        <>
          <text
            fill="violet"
            fontSize={8}
            x={x0 + 93 * sin(lilithDeg)}
            y={y0 + 95 * cos(lilithDeg)}
          >
            ⚸
          </text>

          {settings.interface.planetAngles && (
            <text
              fill="violet"
              fontSize={4}
              x={x0 + 93 * sin(lilithDeg)}
              y={y0 + 95 * cos(lilithDeg) - 8}
            >
              {ldd30.split(' ')[0]}
            </text>
          )}

          <circle
            className={s.fictive}
            cx={x0 + 70 * sin(lilithDeg)}
            cy={y0 + 70 * cos(lilithDeg)}
            r="1"
          />

          <circle
            className={s.fictive}
            cx={x0 + 100 * sin(lilithDeg)}
            cy={y0 + 100 * cos(lilithDeg)}
            r="1"
          />
        </>
      )}

      {settings.objects.celestialPoints.northnode && (
        <>
          <text
            fill="violet"
            fontSize={8}
            x={x0 + 90 * sin(northnodeDeg) - 7}
            y={y0 + 90 * cos(northnodeDeg)}
          >
            ☊
          </text>

          {settings.interface.planetAngles && (
            <text
              fill="violet"
              fontSize={4}
              x={x0 + 90 * sin(northnodeDeg) - 7}
              y={y0 + 90 * cos(northnodeDeg) - 8}
            >
              {
                horoscope.CelestialPoints.northnode.ChartPosition.Ecliptic.ArcDegreesFormatted30.split(
                  ' '
                )[0]
              }
            </text>
          )}

          {[
            {
              cx: x0 + 70 * sin(northnodeDeg),
              cy: y0 + 70 * cos(northnodeDeg)
            },
            {
              cx: x0 + 100 * sin(northnodeDeg),
              cy: y0 + 100 * cos(northnodeDeg)
            }
          ].map((circle, index) => (
            <circle
              key={index}
              className={s.fictive}
              cx={circle.cx}
              cy={circle.cy}
              r="1"
            />
          ))}
        </>
      )}

      {settings.objects.celestialPoints.southnode && (
        <>
          <text
            fill="violet"
            fontSize={8}
            x={x0 - 90 * sin(northnodeDeg) - 7}
            y={y0 - 90 * cos(northnodeDeg)}
          >
            ☋
          </text>

          {settings.interface.planetAngles && (
            <text
              fill="violet"
              fontSize={4}
              x={x0 - 90 * sin(northnodeDeg) - 7}
              y={y0 - 90 * cos(northnodeDeg) - 8}
            >
              {
                horoscope.CelestialPoints.southnode.ChartPosition.Ecliptic.ArcDegreesFormatted30.split(
                  ' '
                )[0]
              }
            </text>
          )}

          {[
            {
              cx: x0 - 70 * sin(northnodeDeg),
              cy: y0 - 70 * cos(northnodeDeg)
            },
            {
              cx: x0 - 100 * sin(northnodeDeg),
              cy: y0 - 100 * cos(northnodeDeg)
            }
          ].map((circle, index) => (
            <circle
              key={index}
              className={s.fictive}
              cx={circle.cx}
              cy={circle.cy}
              r="1"
            />
          ))}
        </>
      )}
    </g>
  )
}
