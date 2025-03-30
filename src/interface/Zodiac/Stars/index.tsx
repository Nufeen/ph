/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */

import {useContext} from 'react'

import s from './index.module.css'

import {CelestialContext} from '../../../CelestialContext.js'

const {sin, cos} = Math
const π = Math.PI

export default function Stars({zero, x0, y0}) {
  const {stars, fictivePointsStars} = useContext(CelestialContext)

  const flatten = [
    ...Object.values(stars),
    ...Object.values(fictivePointsStars)
  ]
    .map(x => x && [x[0]])
    .flat()
    .filter(x => !!x)

  // case of planet conjunction
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
