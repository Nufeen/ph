import {useContext} from 'react'

import {CelestialContext} from '../../../CelestialContext.js'

import {SettingContext} from '../../../SettingContext.js'

import s from './index.module.css'

import planets from '../../../assets/planets.json'

export default function ThirtyDegrees() {
  const {horoscope, transitHoroscope} = useContext(CelestialContext)

  const {settings} = useContext(SettingContext)

  return (
    <div className={s.layout}>
      <div className={s.ruler}>
        <div className={s.cell}></div>
        <div className={s.cell}></div>
        <div className={s.cell}></div>
      </div>
      {Object.values(horoscope.CelestialBodies)
        .filter(body => settings.objects.planets[body.label])
        .map((body: any, i) => (
          <div
            key={i}
            className={s.body}
            style={{
              left: `${((body.ChartPosition.Ecliptic.DecimalDegrees % 30) / 30) * 100}%`,
              top: `${i * 4}%`,
              height: `calc(57px - ${i * 4}%)`
            }}
          >
            <span>{planets[body.label]}</span>
          </div>
        ))}

      {settings.chartType == 'transit' && (
        <div className={s.transit}>
          {Object.values(transitHoroscope.CelestialBodies)
            .filter(body => settings.objects.planets[body.label])
            .map((body: any, i) => (
              <div
                key={i}
                className={s.tbody}
                style={{
                  left: `${((body.ChartPosition.Ecliptic.DecimalDegrees % 30) / 30) * 100}%`,
                  bottom: `${i * 4}%`,
                  height: `calc(57px - ${i * 4}%)`
                }}
              >
                <span>{planets[body.label]}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
