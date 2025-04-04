import {useContext} from 'react'
import {SettingContext} from '../../../SettingContext.js'
import {CelestialContext} from '../../../CelestialContext.js'

import s from './index.module.css'

const {sin, cos} = Math

function calculateDegrees(
  horoscope: {
    CelestialPoints: {
      lilith: {ChartPosition: {Ecliptic: {DecimalDegrees: number}}}
      northnode: {
        ChartPosition: {Ecliptic: {DecimalDegrees: number}}
      }
    }
  },
  zero: number
) {
  const l =
    horoscope.CelestialPoints.lilith.ChartPosition.Ecliptic
      .DecimalDegrees

  const lilith = ((l + zero) * Math.PI) / 180

  const n =
    horoscope.CelestialPoints.northnode.ChartPosition.Ecliptic
      .DecimalDegrees

  const northnode = ((n + zero) * Math.PI) / 180

  return {lilith, northnode}
}

export default function Fictive({zero, x0, y0}) {
  const {settings} = useContext(SettingContext)

  const {horoscope, transitHoroscope, progressedHoroscope} =
    useContext(CelestialContext)

  const degrees = calculateDegrees(horoscope, zero)

  return (
    <g className={s.wrapper}>
      {settings.objects.celestialPoints.lilith && (
        <>
          <Lilith
            zero={zero}
            x0={x0}
            y0={y0}
            horoscope={horoscope}
            type="inner"
          />

          {['transit', 'progressed'].includes(
            settings.chartType
          ) && (
            <Lilith
              zero={zero}
              x0={x0}
              y0={y0}
              horoscope={
                settings.chartType == 'transit'
                  ? transitHoroscope
                  : progressedHoroscope
              }
              type="outer"
            />
          )}
        </>
      )}

      {settings.objects.celestialPoints.northnode && (
        <>
          <Node
            node="northnode"
            zero={zero}
            x0={x0}
            y0={y0}
            horoscope={horoscope}
            type="inner"
          />

          {['transit', 'progressed'].includes(
            settings.chartType
          ) && (
            <Node
              node="northnode"
              zero={zero}
              x0={x0}
              y0={y0}
              horoscope={
                settings.chartType == 'transit'
                  ? transitHoroscope
                  : progressedHoroscope
              }
              type="outer"
            />
          )}
        </>
      )}

      {settings.objects.celestialPoints.southnode && (
        <>
          <Node
            node="southnode"
            zero={zero}
            x0={x0}
            y0={y0}
            horoscope={horoscope}
            type="inner"
          />

          {['transit', 'progressed'].includes(
            settings.chartType
          ) && (
            <Node
              node="southnode"
              zero={zero}
              x0={x0}
              y0={y0}
              horoscope={
                settings.chartType == 'transit'
                  ? transitHoroscope
                  : progressedHoroscope
              }
              type="outer"
            />
          )}
        </>
      )}
    </g>
  )
}

function Lilith({x0, y0, zero, horoscope, type}) {
  const {settings} = useContext(SettingContext)

  const degrees = calculateDegrees(horoscope, zero)

  const degree30 =
    horoscope.CelestialPoints.lilith.ChartPosition.Ecliptic.ArcDegreesFormatted30.split(
      ' '
    )[0]

  const tx = type == 'inner' ? 108 : 150
  const cx1 = type == 'inner' ? 70 : 130
  const cx2 = type == 'inner' ? 100 : 144

  return (
    <>
      <text
        fill="violet"
        fontSize={8}
        x={x0 + tx * sin(degrees.lilith)}
        y={y0 + (tx + 2) * cos(degrees.lilith)}
      >
        ⚸
      </text>

      {settings.interface.planetAngles && (
        <text
          fill="violet"
          fontSize={4}
          x={x0 + tx * sin(degrees.lilith)}
          y={y0 + (tx + 2) * cos(degrees.lilith) - 8}
        >
          {degree30}
        </text>
      )}

      <circle
        className={s.fictive}
        cx={x0 + cx1 * sin(degrees.lilith)}
        cy={y0 + cx1 * cos(degrees.lilith)}
        r="1"
      />

      <circle
        className={s.fictive}
        cx={x0 + cx2 * sin(degrees.lilith)}
        cy={y0 + cx2 * cos(degrees.lilith)}
        r="1"
      />
    </>
  )
}

function Node({x0, y0, zero, horoscope, type, node}) {
  const {settings} = useContext(SettingContext)

  const degrees = calculateDegrees(horoscope, zero)

  const degree30 =
    horoscope.CelestialPoints[
      node
    ].ChartPosition.Ecliptic.ArcDegreesFormatted30.split(' ')[0]

  const tx = type == 'inner' ? 108 : 150
  const cx1 = type == 'inner' ? 70 : 130
  const cx2 = type == 'inner' ? 100 : 144

  const M = node == 'northnode' ? 1 : -1

  return (
    <>
      <text
        fill="violet"
        fontSize={8}
        x={x0 + M * tx * sin(degrees.northnode)}
        y={y0 + M * tx * cos(degrees.northnode)}
      >
        {node == 'northnode' ? '☊' : '☋'}
      </text>

      {settings.interface.planetAngles && (
        <text
          fill="violet"
          fontSize={4}
          x={x0 + M * tx * sin(degrees.northnode)}
          y={y0 + M * tx * cos(degrees.northnode) - 8}
        >
          {degree30}
        </text>
      )}

      {[
        {
          cx: x0 + M * cx1 * sin(degrees.northnode),
          cy: y0 + M * cx1 * cos(degrees.northnode)
        },
        {
          cx: x0 + M * cx2 * sin(degrees.northnode),
          cy: y0 + M * cx2 * cos(degrees.northnode)
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
  )
}
