import {useContext} from 'react'

import {CelestialContext} from '../../../CelestialContext.js'

import {SettingContext} from '../../../SettingContext.js'

import React from 'react'

import s from './index.module.css'

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

export default function ModernPlanetsTable() {
  const {horoscope, stars} = useContext(CelestialContext)

  const {settings} = useContext(SettingContext)

  return (
    <table className={s.table}>
      <thead className={s.thead}>
        <tr>
          <th></th>
          <th></th>
          <th className={s.sign}></th>
          <th></th>
          <th className={s.house}>house</th>
        </tr>
      </thead>
      <tbody>
        {Object.values(horoscope.CelestialBodies)
          .filter(
            (body: any) => settings.objects.planets[body.label]
          )
          .map((body: any, i) => (
            <tr key={i}>
              <td className={s.retro}>{body.isRetrograde && 'R'}</td>
              <td>{body.label}</td>
              <td className={s.sign}>{icons[body?.Sign?.label]}</td>
              <td className={s.degrees}>
                {body.ChartPosition?.Ecliptic?.ArcDegreesFormatted30}
              </td>
              <td className={s.house}>
                {romanNumbers[body.House?.id - 1]}
              </td>
              {settings.objects.celestialPoints?.fixedStars
                ?.table && (
                <td className={s.star}>
                  <pre>
                    {stars[body.label]
                      .sort((a, b) => (a.size > b.size ? 1 : -1))
                      .filter((x, i) => i < 1)
                      .map(x => (
                        <React.Fragment key={x.name}>
                          <span
                            onClick={() => {
                              window.open(
                                `https://www.google.com/search?q=${x.name}+astrology`
                              )
                            }}
                          >
                            {x.name} ({x.size})
                          </span>
                          <span className={s.starDetail}>
                            {details[x.name]}
                          </span>
                        </React.Fragment>
                      ))}
                  </pre>
                </td>
              )}
            </tr>
          ))}
      </tbody>
    </table>
  )
}

/**
 * TODO parse descriptions from classic books
 */
const details = {
  Rigel:
    'Rigel has particular meaning when found in charts of government officials, military people, politicians, leaders of political parties, barristers and priests. Rigel gives splendor, honor, riches, and happiness to those who are born under it.',

  Regulus: 'The heart of the Lion',

  'Deneb Adige':
    'A white star in the tail of the Swan. The native is mentally quick, psychic, and idealist, has a keen intellect, a very likable person, intelligent',

  Unukalhai:
    'Cor Serpentis, the Serpent’s Heart. It gives immorality, accidents, violence and danger of poison',

  Sadachbia: 'The Lucky Star of Hidden Things'
}
