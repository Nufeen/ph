import {useContext} from 'react'

import s from './index.module.css'

import {CelestialContext} from '../../../CelestialContext.js'
import {SettingContext} from '../../../SettingContext.js'

const {sin, cos} = Math
const π = Math.PI

export default function Stars({calendarDay, zero, x0, y0}) {
  const {stars, transitStars, progressedStars, fictivePointsStars} =
    useContext(CelestialContext)

  const {settings} = useContext(SettingContext)

  const year = calendarDay.getFullYear()
  const delta = 2000 - year

  const flatten = [
    ...Object.values(stars),
    ...Object.values(fictivePointsStars),
    ...Object.values(
      settings.chartType === 'transit' ? transitStars : {}
    ),
    ...Object.values(
      settings.chartType === 'progressed' ? progressedStars : {}
    )
  ]
    .map(x => x && [x[0]])
    .flat()
    .filter(x => !!x)
    .map(x => ({
      ...x,
      // TODO test precession logic
      elon: x.elon - (1 / 72) * delta
    }))

  // in case of planet conjunction we get duplicates
  const uniq = Array.from(new Set(flatten))

  return (
    <>
      {uniq.map(({name, elon}) => (
        <g key={name} className={s.group}>
          <circle
            className={s.star}
            data-star={name}
            cx={x0 + 144 * sin(((elon + zero) * π) / 180)}
            cy={y0 + 144 * cos(((elon + zero) * π) / 180)}
            r="1"
          />

          {false && (
            <line
              className={s.starline}
              stroke="lightgray"
              strokeWidth=".3"
              x1={x0 + 144 * sin(((elon + zero) * π) / 180)}
              y1={y0 + 144 * cos(((elon + zero) * π) / 180)}
              x2={x0 + 70 * sin(((elon + zero) * π) / 180)}
              y2={y0 + 70 * cos(((elon + zero) * π) / 180)}
            />
          )}

          <text
            opacity={0.4}
            className={s.text}
            fill="currentColor"
            x={x0 + 155 * sin(((elon + zero) * π) / 180)}
            y={y0 + 159 * cos(((elon + zero) * π) / 180)}
          >
            {name}
          </text>
        </g>
      ))}
    </>
  )
}
