import React, {useContext} from 'react'

import s from './index.module.css'

import {CelestialContext} from '../../../CelestialContext.js'
import {SettingContext} from '../../../SettingContext'

import icons from '../../../assets/planets.json'

const {sin, cos} = Math

export default function TransitPlanets({zero, x0, y0}) {
  const {progressedHoroscope, transitHoroscope} =
    useContext(CelestialContext)

  const {settings} = useContext(SettingContext)

  let l = 126

  function deg(x) {
    const y = x.ChartPosition.Ecliptic.DecimalDegrees
    return ((y + zero) * Math.PI) / 180
  }

  const P = (
    settings.chartType == 'progressed'
      ? progressedHoroscope
      : transitHoroscope
  ).CelestialBodies.all
    .filter(planet => settings?.objects?.planets[planet?.label])
    .map(planet => ({
      planet,
      name: planet.label,
      lng: deg(planet),
      x: x0 - 4 + (l + 11) * sin(deg(planet)),
      y: y0 + 3 + (l + 10) * cos(deg(planet))
    }))
    .sort((a, b) => b.lng - a.lng)

  // kind of naive collision detection
  for (let i = 0; i < P.length - 1; i++) {
    if (
      Math.abs(P[i + 1].y - P[i].y) < 5 &&
      P[i + 1].x - P[i].x < 5
    ) {
      P[i + 1].x += 5
    }
  }

  return (
    <>
      {P.map(({name, lng, planet, x, y}) => (
        <React.Fragment key={name}>
          <circle
            className={s.transit}
            cx={x0 + (l - 56) * sin(lng)}
            cy={y0 + (l - 56) * cos(lng)}
            r="1"
          />

          <circle
            className={s.transit}
            cx={x0 + (l + 4) * sin(lng)}
            cy={y0 + (l + 4) * cos(lng)}
            r="1"
          />

          <text className={s.text} x={x} y={y} fontWeight={400}>
            {icons[planet.label]}
            {planet.isRetrograde && <tspan dy="2">R</tspan>}
          </text>

          <text
            className={s.text}
            x={x + 4}
            y={y - 5}
            fontWeight={400}
          >
            {settings.interface.planetAngles && (
              <tspan dy="0">
                {
                  planet.ChartPosition.Ecliptic.ArcDegreesFormatted30.split(
                    ' '
                  )[0]
                }
              </tspan>
            )}
          </text>
        </React.Fragment>
      ))}
    </>
  )
}
