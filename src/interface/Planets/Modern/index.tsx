import React, {useContext} from 'react'
import {
  CelestialContext,
  CelestialContextType
} from '../../../CelestialContext.js'
import {
  SettingContext,
  SettingContextType
} from '../../../SettingContext.js'

import s from './index.module.css'

import planets from '../../../assets/planets.json'

import details from './details.json'

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

const fictivePointsIcons = {
  lilith: '⚸',
  northnode: '☊',
  southnode: '☋'
}

export default function ModernPlanetsTable() {
  const {horoscope, transitHoroscope, stars, fictivePointsStars} =
    useContext(CelestialContext) as CelestialContextType

  const {settings} = useContext(SettingContext) as SettingContextType

  return (
    <table className={s.table}>
      <thead className={s.thead}>
        <tr>
          {settings.chartType == 'transit' && (
            <>
              <th data-type={settings.chartType}>T</th>
            </>
          )}
          <th></th>
          <th></th>
          <th>N</th>
          <th className={s.house}>house</th>
          {settings.objects.celestialPoints?.fixedStars?.table && (
            <th>N</th>
          )}
        </tr>
      </thead>

      <tbody>
        {Object.values(horoscope.CelestialBodies)
          .filter(
            (body: any) => settings.objects.planets[body.label]
          )
          .map((body: any, i) => (
            <tr key={i}>
              {settings.chartType == 'transit' && (
                <td
                  className={s.degrees}
                  data-type={settings.chartType}
                >
                  <CelestialPoint
                    body={transitHoroscope.CelestialBodies[body.key]}
                  />
                </td>
              )}

              {settings.chartType == 'transit' && (
                <td
                  className={s.retro}
                  data-type={settings.chartType}
                >
                  {transitHoroscope.CelestialBodies[body.key]
                    ?.isRetrograde && 'R'}
                </td>
              )}

              <td className={s.label}>{planets[body.label]}</td>
              <td className={s.retro}>{body.isRetrograde && 'R'}</td>

              <td className={s.degrees}>
                <CelestialPoint body={body} />
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
                            {details[x.name]?.summary}
                          </span>
                        </React.Fragment>
                      ))}
                  </pre>
                </td>
              )}
            </tr>
          ))}
      </tbody>

      <tbody className={s.CelestialPoints}>
        {Object.values(horoscope.CelestialPoints)
          .filter(
            (body: any) => settings.objects.celestialPoints[body.key]
          )
          .map((body: any, i) => (
            <tr key={i}>
              {settings.chartType == 'transit' && (
                <td
                  className={s.degrees}
                  data-type={settings.chartType}
                >
                  <CelestialPoint
                    body={transitHoroscope.CelestialPoints[body.key]}
                  />
                </td>
              )}

              {settings.chartType == 'transit' && (
                <td className={s.retro}></td>
              )}

              <td>{fictivePointsIcons[body.key]}</td>

              <td className={s.retro}></td>

              <td className={s.degrees}>
                <CelestialPoint body={body} />
              </td>
              <td className={s.house}>
                {romanNumbers[body.House?.id - 1]}
              </td>
              {settings.objects.celestialPoints?.fixedStars
                ?.table && (
                <td className={s.star}>
                  <pre>
                    {fictivePointsStars[body.key]
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
                            {details[x.name]?.summary}
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

const CelestialPoint = ({body}) => {
  const arcDegrees =
    body?.ChartPosition?.Ecliptic?.ArcDegreesFormatted30.split('°')

  return (
    <>
      <span>{arcDegrees[0]}</span>
      <span>{icons[body?.Sign?.label]}</span>
      <span> {addZeros(arcDegrees[1])}</span>
    </>
  )
}

function addZeros(input) {
  const [minutes, seconds] = input.trim().split(' ')
  const formattedMinutes = minutes.padStart(3, '0')
  const formattedSeconds = seconds.padStart(4, '0')
  return `${formattedMinutes} ${formattedSeconds}`
}
