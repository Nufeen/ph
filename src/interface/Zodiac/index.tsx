import Stars from './Stars'
import TransitPlanets from './TransitPlanets/index.js'
import Planets from './Planets/index.js'
import TransitAspects from './Aspects/index.js'
import Fictive from './FictivePoints/index.js'
import Lots from './Lots/index.js'
import Houses from './Houses/index.js'

import {useContext} from 'react'
import {SettingContext} from '../../SettingContext.js'
import {CelestialContext} from '../../CelestialContext.js'

import houses from '../../assets/zodiac.json'

import s from './index.module.css'

const {sin, cos} = Math
const π = Math.PI

const l = [...Array(12).keys()]

type Props = {
  calendarDay: Date
  lat: number
  lng: number
}

export default function Zodiac(props: Props) {
  const {calendarDay, lat, lng} = props

  const {settings} = useContext(SettingContext)

  const {
    horoscope: {_ascendant, CelestialBodies}
  } = useContext(CelestialContext)

  const zero =
    settings.objects.houses.visibility.natal &&
    settings.interface.startFrom == 'Asc'
      ? -_ascendant.ChartPosition.Ecliptic.DecimalDegrees - 90
      : -90

  const x0 = 150
  const y0 = 155

  const r = 130

  return (
    <div className={s.wrapper}>
      <svg
        width="300"
        height="300"
        viewBox="0 0 300 300"
        className={s.figure}
      >
        <circle cx={x0} cy={y0} r={r} />

        {l.map(i => (
          <line
            opacity={0.5}
            key={i}
            x1={x0}
            y1={y0}
            x2={x0 + r * sin(((i * 30 + zero + 1) * π - π) / 180)}
            y2={y0 + r * cos(((i * 30 + zero + 1) * π - π) / 180)}
            stroke="currentColor"
          />
        ))}

        <circle cx={x0} cy={y0} r="100" />
        <circle cx={x0} cy={y0} r="70" />
        <circle cx={x0} cy={y0} r="144" />

        {l.map(i => (
          <text
            className={s.house}
            key={i}
            fill="currentColor"
            x={
              x0 -
              5 +
              (r - 15) * sin(((i * 30 + zero + 15) * π) / 180)
            }
            y={
              y0 +
              2 +
              (r - 15) * cos(((i * 30 + zero + 15) * π) / 180)
            }
          >
            {houses[i]}
          </text>
        ))}

        {settings.objects?.houses?.visibility?.natal && (
          <Houses {...{zero, x0, y0}} chartType="natal" />
        )}

        {settings.chartType != 'natal' &&
          settings.objects?.houses?.visibility?.transit && (
            <Houses {...{zero, x0, y0}} chartType="transit" />
          )}

        <Planets {...{calendarDay, zero, x0, y0}} />
        <Fictive {...{calendarDay, zero, x0, y0, lat, lng}} />

        {settings.chartType == 'natal' && (
          <TransitAspects {...{calendarDay, zero, x0, y0}} />
        )}

        {(settings.chartType == 'transit' ||
          settings.chartType == 'progressed') && (
          <TransitAspects {...{calendarDay, zero, x0, y0}} />
        )}

        {(settings.chartType == 'transit' ||
          settings.chartType == 'progressed') && (
          <TransitPlanets {...{zero, x0, y0}} />
        )}
        {settings.objects.celestialPoints?.fixedStars?.chart && (
          <Stars {...{calendarDay, zero, x0, y0}} />
        )}

        <Lots x0={x0} y0={y0} />
      </svg>
    </div>
  )
}
