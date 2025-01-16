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
    return ((y + zero) * 3.14) / 180
  }

  return (
    <>
      {(settings.chartType == 'progressed'
        ? progressedHoroscope
        : transitHoroscope
      ).CelestialBodies.all
        .filter(planet => settings?.objects?.planets[planet?.label])
        .map(planet => (
          <React.Fragment key={planet?.label}>
            <circle
              className={s.transit}
              cx={x0 + (l - 56) * sin(deg(planet))}
              cy={y0 + (l - 56) * cos(deg(planet))}
              r="1"
            />

            <circle
              className={s.transit}
              cx={x0 + (l + 4) * sin(deg(planet))}
              cy={y0 + (l + 4) * cos(deg(planet))}
              r="1"
            />

            <text
              className={s.text}
              x={x0 + (l + 11) * sin(deg(planet)) - 3}
              y={y0 + (l + 12) * cos(deg(planet)) + 2}
              fontWeight={400}
            >
              {icons[planet.label]}
              {planet.isRetrograde && <tspan dy="2">R</tspan>}
            </text>

            <text
              className={s.text}
              x={x0 + (l + 11) * sin(deg(planet)) + 2}
              y={y0 + (l + 12) * cos(deg(planet)) - 4}
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
