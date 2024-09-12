import React, {useContext} from 'react'
import {getSunrise, getSunset} from 'sunrise-sunset-js'
import {Body, Ecliptic, GeoVector} from 'astronomy-engine'

import {CelestialContext} from '../../CelestialContext.js'

import {SettingContext} from '../../SettingContext.js'

import s from './index.module.css'

type Props = {lat: number; lng: number; calendarDay: Date; today: Date}

const icons = {
  Aries: '♈︎︎',
  Taurus: '♉︎︎',
  Gemini: '♊︎︎',
  Cancer: '♋︎︎',
  Leo: '♌︎︎',
  Virgo: '♍︎︎',
  Libra: '♎︎︎',
  Scorpio: '♏︎︎',
  Sagittarius: '♐︎︎',
  Capricorn: '♑︎︎',
  Aquarius: '♒︎︎',
  Pisces: '♓︎︎'
}

const romanNumbers = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII'
]

export default function ModernPlanetsTable({lat, lng, calendarDay, today}) {
  const horoscope = useContext(CelestialContext)

  const {settings} = useContext(SettingContext)

  return (
    <table className={s.table}>
      <thead className={s.thead}>
        <tr>
          <th> </th>
          <th className={s.sign}></th>
          <th></th>
          <th className={s.house}>house</th>
        </tr>
      </thead>
      <tbody>
        {Object.values(horoscope.CelestialBodies)
          .filter((body: any) => settings.objects.planets[body.label])
          .map((body: any, i) => (
            <tr key={i}>
              <td>{body.label}</td>
              <td className={s.sign}>{icons[body?.Sign?.label]}</td>

              <td className={s.degrees}>
                {body.ChartPosition?.Horizon?.ArcDegreesFormatted30}
              </td>

              <td className={s.house}>{romanNumbers[body.House?.id - 1]}</td>
            </tr>
          ))}
      </tbody>
    </table>
  )
}
