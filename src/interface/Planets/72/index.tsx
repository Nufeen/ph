import React, {useContext} from 'react'
import {CelestialContext} from '../../../CelestialContext.js'
import {SettingContext} from '../../../SettingContext.js'

import s from './index.module.css'

import planets from '../../../assets/planets.json'

import dnames from '../../../assets/dnames.json'

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

export default function DTable() {
  const {horoscope} = useContext(CelestialContext)

  const {settings} = useContext(SettingContext)

  return (
    <table className={s.table}>
      <tbody>
        {Object.values(horoscope.CelestialBodies)
          .filter(
            (body: any) => settings.objects.planets[body.label]
          )
          .map((body: any, i) => (
            <tr key={i}>
              <td className={s.aname}>
                <Name body={body} show="a" />
              </td>

              <td className={s.label}>{planets[body.label]}</td>
              <td className={s.retro}>{body.isRetrograde && 'R'}</td>

              <td className={s.aname}>
                <Name body={body} show="x" />
              </td>

              <td className={s.aname}>
                <Name body={body} show="d" />
              </td>
              <td className={s.degrees}>
                <CelestialPoint body={body} />
              </td>

              <td className={s.house}>
                {romanNumbers[body.House?.id - 1]}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  )
}

function Name({body, show}) {
  const d = body.ChartPosition.Ecliptic.DecimalDegrees

  const x = ~~((d / 360) * 72)

  let out = {
    d: dnames[x]?.[1],
    a: dnames[x]?.[0],
    x: x + 1
  }

  return out[show]
}

const CelestialPoint = ({body}) => {
  const arcDegrees =
    body?.ChartPosition?.Ecliptic?.ArcDegreesFormatted30.split('°')

  return (
    <>
      <span>{arcDegrees[0]}</span>
      <span>{icons[body?.Sign?.label]}</span>
    </>
  )
}
