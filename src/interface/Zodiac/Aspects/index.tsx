import {useContext} from 'react'
import {SettingContext} from '../../../SettingContext.js'
import {CelestialContext} from '../../../CelestialContext.js'

import React from 'react'

interface CelestialBody {
  label: string
  ChartPosition: {Ecliptic: {DecimalDegrees: number}}
}

interface CelestialContextType {
  horoscope: {CelestialBodies: {all: CelestialBody[]}}
  progressedHoroscope: {CelestialBodies: {all: CelestialBody[]}}
  transitHoroscope: {CelestialBodies: {all: CelestialBody[]}}
}

interface SettingContextType {
  settings: {
    objects: {planets: Record<string | number, boolean>}
    chartType: string
    interface: {
      aspectOrb: number
      aspectAngles: boolean
    }
  }
}

interface Aspect {
  a: number
  b: number
  d: number
  d0: number
  x: number
  y: number
}

const {sin, cos, abs} = Math

export default function Aspects({
  zero,
  x0,
  y0
}: {
  zero: number
  x0: number
  y0: number
}) {
  const context = useContext(
    CelestialContext
  ) as CelestialContextType
  const {horoscope, progressedHoroscope, transitHoroscope} = context

  const settingsContext = useContext(
    SettingContext
  ) as SettingContextType
  const {settings} = settingsContext

  const threshold = settings.interface.aspectOrb ?? 4

  const [natal, transit, progressed] = [
    horoscope,
    transitHoroscope,
    progressedHoroscope
  ].map(x =>
    x.CelestialBodies.all
      .filter(
        (planet: {label: string | number}) =>
          settings?.objects?.planets[planet?.label]
      )
      .map(
        (z: {
          label: string
          ChartPosition: {Ecliptic: {DecimalDegrees: number}}
        }) => [z.label, z.ChartPosition.Ecliptic.DecimalDegrees]
      )
  )

  const M = {
    transit,
    progressed,
    natal
  }

  const AT: Aspect[] = []
  const uniqueAspects = new Set<number>()

  M.natal.forEach(a => {
    M[settings.chartType].forEach((b: any) => {
      const aspect = aspectBetween(a as [string, number], b)
      if (aspect && !uniqueAspects.has(aspect.d0)) {
        uniqueAspects.add(aspect.d0)

        AT.push(aspect)
      }
    })
  })

  // sort for collision detect
  AT.sort((a, b) => a.y - b.y)

  function angleDistance(a: number, b: number) {
    return Math.min(
      360 - (Math.abs(a - b) % 360),
      Math.abs(a - b) % 360
    )
  }

  function aspectBetween([, a], [, b]) {
    let d = angleDistance(a, b)

    if (d < 50 || (d > 133 && d < 170)) return null

    if (d % 30 <= threshold || 30 - (d % 30) < threshold) {
      return {
        a,
        b,
        d: Math.min(d % 30, 30 - (d % 30)),
        d0: d,
        x: getMidpoint(
          x0 + 70 * sin(deg(a)),
          y0 + 70 * cos(deg(a)),
          x0 + 70 * sin(deg(b)),
          y0 + 70 * cos(deg(b))
        ).centerX,
        y: getMidpoint(
          x0 + 70 * sin(deg(a)),
          y0 + 70 * cos(deg(a)),
          x0 + 70 * sin(deg(b)),
          y0 + 70 * cos(deg(b))
        ).centerY
      }
    }

    return null
  }

  // kind of naive collision detection
  for (let i = 0; i < AT.length - 1; i++) {
    if (
      abs(AT[i + 1].y - AT[i].y) < 10 &&
      AT[i + 1].x - AT[i].x < 5
    ) {
      AT[i + 1].y = AT[i].y + 4
    }
  }

  function deg(x: number) {
    return ((x + zero) * Math.PI) / 180
  }

  return (
    <>
      {AT.map(({a, b, d, d0, x, y}) => (
        <React.Fragment key={JSON.stringify([a, b])}>
          <line
            data-d={~~d0}
            x1={x0 + 70 * sin(deg(a))}
            y1={y0 + 70 * cos(deg(a))}
            x2={x0 + 70 * sin(deg(b))}
            y2={y0 + 70 * cos(deg(b))}
            stroke={
              abs(d0) % 45 < 6 ||
              abs(d0) % 45 > 45 - 6 ||
              abs(d0) % 90 < 10 ||
              90 - (abs(d0) % 90) < 10
                ? 'red'
                : 'deepskyblue'
            }
            strokeWidth={d <= 1 ? 1 : 0.3}
          />

          {settings.interface.aspectAngles && (
            <text
              fill="silver"
              fontSize={4}
              textAnchor="middle"
              x={x}
              y={y}
            >
              {~~d0}°
            </text>
          )}
        </React.Fragment>
      ))}
    </>
  )
}

function getMidpoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const centerX = (x1 + x2) / 2
  const centerY = (y1 + y2) / 2
  return {centerX, centerY}
}
