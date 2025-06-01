import {useContext} from 'react'
import {SettingContext} from '../../../SettingContext.js'
import {CelestialContext} from '../../../CelestialContext.js'

import planets from '../../../assets/planets.json'

import s from './index.module.css'

const {abs, min} = Math

export default function Aspects() {
  const {settings} = useContext(SettingContext)
  const {horoscope, progressedHoroscope, transitHoroscope} =
    useContext(CelestialContext)

  const threshold = settings.interface.aspectOrb ?? 4

  const [natal, transit, progressed] = [
    horoscope,
    transitHoroscope,
    progressedHoroscope
  ].map(x =>
    x.CelestialBodies.all
      .filter(
        (planet: {label: string}) =>
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
  const conjunctions = []

  const uniqueAspects = new Set<number>()

  M.natal.forEach((a: [string, number]) => {
    M[settings.chartType].forEach((b: [string, number]) => {
      const aspect = aspectBetween(a, b, threshold)
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

  M.natal.forEach((a: [string, number]) => {
    M[settings.chartType].forEach((b: [string, number]) => {
      const aspect = conjunctionBetween(a, b, threshold)
      if (aspect && !uniqueAspects.has(aspect.d0)) {
        uniqueAspects.add(aspect.d0)
        conjunctions.push(aspect)
      }
    })
  })

  // sort for order in table: exact go up
  negative.sort((a, b) => a.d - b.d)
  positive.sort((a, b) => a.d - b.d)
  conjunctions.sort((a, b) => a.d - b.d)

  return (
    <div className={s.wrap} data-type={settings.chartType}>
      <div data-alot={conjunctions.length > 12}>
        {conjunctions.map(({d, d0, label1, label2}, index) => (
          <ul key={index} className={s.list}>
            <li className={s.conjunction} data-exact={d <= 1}>
              <span>{planets[label1]}</span>
              <span>{~~d0 || '☌'}</span>
              <span>{planets[label2]}</span>
            </li>
          </ul>
        ))}
      </div>

      <div data-alot={negative.length > 12}>
        {negative.map(({d, d0, label1, label2}, index) => (
          <ul key={index} className={s.list}>
            <li className={s.neg} data-exact={d <= 1}>
              <span>{planets[label1]}</span>
              <span>{~~d0}</span>
              <span>{planets[label2]}</span>
            </li>
          </ul>
        ))}
      </div>

      <div className={s.positive} data-alot={positive.length > 12}>
        {positive.map(({d, d0, label1, label2}, index) => (
          <ul key={index} className={s.list}>
            <li className={s.pos} data-exact={d <= 1}>
              <span>{planets[label1]}</span>
              <span>{~~d0}</span>
              <span>{planets[label2]}</span>
            </li>
          </ul>
        ))}
      </div>
    </div>
  )
}

function aspectBetween(
  [label1, a]: [string, number],
  [label2, b]: [string, number],
  threshold: number
) {
  let d = angleDistance(a, b)

  if (d < 50 || (d > 133 && d < 170)) return null

  if (d % 30 <= threshold || 30 - (d % 30) < threshold) {
    return {
      a,
      b,
      d: min(d % 30, 30 - (d % 30)),
      d0: d,
      label1,
      label2
    }
  }

  return null
}

function conjunctionBetween(
  [label1, a]: [string, number],
  [label2, b]: [string, number],
  threshold: number
) {
  let d = angleDistance(a, b)

  if (abs(d) <= threshold) {
    return {
      a,
      b,
      d: abs(d),
      d0: d,
      label1,
      label2
    }
  }

  return null
}

function angleDistance(a: number, b: number) {
  return Math.min(
    360 - (Math.abs(a - b) % 360),
    Math.abs(a - b) % 360
  )
}
