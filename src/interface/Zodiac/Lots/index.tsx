import {useContext} from 'react'
import {SettingContext} from '../../../SettingContext.js'
import {CelestialContext} from '../../../CelestialContext.js'

import s from './index.module.css'

const {sin, cos} = Math
const π = Math.PI

export default function Lots({x0, y0}) {
  const {settings} = useContext(SettingContext)

  const {
    horoscope: {_ascendant, CelestialBodies}
  } = useContext(CelestialContext)

  const zero =
    settings.objects.houses.visibility.natal &&
    settings.interface.startFrom == 'Asc'
      ? -_ascendant.ChartPosition.Ecliptic.DecimalDegrees - 90
      : -90

  const NF =
    _ascendant.ChartPosition.Ecliptic.DecimalDegrees +
    (CelestialBodies.sun.ChartPosition.Ecliptic.DecimalDegrees +
      0 -
      (CelestialBodies.moon.ChartPosition.Ecliptic.DecimalDegrees +
        0))

  const DF =
    _ascendant.ChartPosition.Ecliptic.DecimalDegrees -
    (CelestialBodies.sun.ChartPosition.Ecliptic.DecimalDegrees -
      CelestialBodies.moon.ChartPosition.Ecliptic.DecimalDegrees)

  const dayBirth =
    _ascendant.ChartPosition.Ecliptic.DecimalDegrees -
      CelestialBodies.sun.ChartPosition.Ecliptic.DecimalDegrees <
    180

  /**
   * Hermetic lots formulas:
   *
   * Fortune = ASC + MOON - SUN (Day Birth) or ASC + SUN - MOON (Night Birth)
   *
   * Courage = ASC + Fortune - MARS
   * Nemesis (Divine Punishment) = Asc + Fortune - SATURN
   * Victory = ASC + JUPITER - Spirit
   *
   * Eros = ASC + VENUS - Spirit for day  and the reverse for night births (ASC + Spirit - VENUS)
   * Necessity = ASC + Fortune - MERCURY for Day Charts and the reverse for Night
   */

  const PF = dayBirth ? DF : NF
  const PS = dayBirth ? NF : DF

  return (
    <g className={s.lots}>
      {settings.objects.lots?.fortune && (
        <>
          <circle
            cx={x0 + 100 * sin(((PF + zero) * π) / 180)}
            cy={y0 + 100 * cos(((PF + zero) * π) / 180)}
            r="1"
          />

          <text
            fill="currentColor"
            fontSize={10}
            x={x0 + 109 * sin(((PF + zero) * π) / 180) - 3}
            y={y0 + 109 * cos(((PF + zero) * π) / 180) + 6}
          >
            ⊗
          </text>

          {settings.interface.planetAngles && (
            <text
              fill="currentColor"
              fontSize={4}
              x={x0 + 109 * sin(((PF + zero) * π) / 180) - 2}
              y={y0 + 109 * cos(((PF + zero) * π) / 180) - 2}
            >
              {~~PF % 30}°
            </text>
          )}
        </>
      )}

      {settings.objects.lots?.spirit && (
        <>
          <circle
            cx={x0 + 100 * sin(((PS + zero) * π) / 180)}
            cy={y0 + 100 * cos(((PS + zero) * π) / 180)}
            r="1"
          />

          <text
            fill="currentColor"
            x={x0 + 109 * sin(((PS + zero) * π) / 180) - 3}
            y={y0 + 109 * cos(((PS + zero) * π) / 180) + 2}
          >
            PS
          </text>
          {settings.interface.planetAngles && (
            <text
              fill="currentColor"
              fontSize={4}
              x={x0 + 109 * sin(((PS + zero) * π) / 180) - 2}
              y={y0 + 109 * cos(((PS + zero) * π) / 180) - 4}
            >
              {~~PS % 30}°
            </text>
          )}
        </>
      )}
    </g>
  )
}
