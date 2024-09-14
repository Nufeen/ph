import {useContext} from 'react'

import {SettingContext} from '../../../SettingContext.js'

import {CelestialContext} from '../../../CelestialContext.js'

const {sin, cos, abs} = Math

export default function TransitAspects({calendarDay, zero, x0, y0}) {
  const {horoscope, transitHoroscope} = useContext(CelestialContext)

  const {settings} = useContext(SettingContext)

  const threshold = settings.interface.aspectOrb ?? 4

  const A = horoscope.CelestialBodies.all
    .filter(planet => settings?.objects?.planets[planet?.label])
    .map(x => x.ChartPosition.Ecliptic.DecimalDegrees)

  const B = transitHoroscope.CelestialBodies.all
    .filter(planet => settings?.objects?.planets[planet?.label])
    .map(x => x.ChartPosition.Ecliptic.DecimalDegrees)

  const AT = []

  A.forEach(a => {
    B.forEach(b => {
      const aspect = aspectBetween(a, b)
      if (aspect) {
        AT.push(aspect)
      }
    })
  })

  function aspectBetween(a, b) {
    const d = abs(a - b)

    if (d < 50 || (d > 125 && d < 170)) return null

    if (d % 30 < threshold) {
      return {
        a,
        b,
        d: d % 30
      }
    }

    return null
  }

  function deg(x) {
    return ((x + zero) * 3.14) / 180
  }

  return (
    <>
      {AT.map(({a, b, d}) => (
        <line
          key={JSON.stringify([a, b])}
          x1={x0 + 70 * sin(deg(a))}
          y1={y0 + 70 * cos(deg(a))}
          x2={x0 + 70 * sin(deg(b))}
          y2={y0 + 70 * cos(deg(b))}
          stroke={abs(a - b) % 45 < 12 ? 'red' : 'deepskyblue'}
          strokeWidth={d < 1 ? 1 : 0.3}
        />
      ))}
    </>
  )
}
