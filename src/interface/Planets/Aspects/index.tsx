import {useContext} from 'react'
import {SettingContext} from '../../../SettingContext.js'
import {CelestialContext} from '../../../CelestialContext.js'

import planets from '../../../assets/planets.json'

import React from 'react'

import s from './index.module.css'

const {sin, cos, abs, min} = Math

export default function Aspects() {
  const {horoscope, progressedHoroscope, transitHoroscope} =
    useContext(CelestialContext)

  const {settings} = useContext(SettingContext)

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

  const positive = []
  const negative = []

  const uniqueAspects = new Set<number>()

  M.natal.forEach((a: [any, any]) => {
    M[settings.chartType].forEach((b: any) => {
      const aspect = aspectBetween(a, b)
      if (aspect && !uniqueAspects.has(aspect.d0)) {
        uniqueAspects.add(aspect.d0)

        if (
          abs(aspect.d0) % 45 < 6 ||
          abs(aspect.d0) % 45 > 45 - 6
        ) {
          negative.push(aspect)
        } else {
          positive.push(aspect)
        }
      }
    })
  })

  // sort for order in table: exact go up
  negative.sort((a, b) => a.d - b.d)
  positive.sort((a, b) => a.d - b.d)

  function angleDistance(a: number, b: number) {
    return Math.min(
      360 - (Math.abs(a - b) % 360),
      Math.abs(a - b) % 360
    )
  }

  function aspectBetween([label1, a], [label2, b]) {
    let d = angleDistance(a, b)

    if (d < 50 || (d > 133 && d < 170)) return null

    if (d % 30 <= threshold || 30 - (d % 30) < threshold) {
      return {
        a,
        b,
        d: min(d % 30, 30 - (d % 30)),
        d0: d,
        label1,
        label2,
        caption: `${planets[label1]} ${~~d}° ${planets[label2]} `
      }
    }

    return null
  }

  return (
    <div className={s.wrap} data-type={settings.chartType}>
      <div>
        {negative.map(
          ({a, b, d, d0, x, y, label1, label2}, index) => (
            <ul key={index} className={s.list}>
              <li className={s.neg} data-exact={d <= 1}>
                <span>{planets[label1]}</span>
                <span>{~~d0}</span>
                <span>{planets[label2]}</span>
              </li>
            </ul>
          )
        )}
      </div>

      <div>
        {positive.map(
          ({a, b, d, d0, x, y, label1, label2}, index) => (
            <ul key={index} className={s.list}>
              <li className={s.pos} data-exact={d <= 1}>
                <span>{planets[label1]}</span>
                <span>{~~d0}</span>
                <span>{planets[label2]}</span>
              </li>
            </ul>
          )
        )}
      </div>
    </div>
  )
}

function getMidpoint(x1, y1, x2, y2) {
  const centerX = (x1 + x2) / 2
  const centerY = (y1 + y2) / 2
  return {centerX, centerY}
}
