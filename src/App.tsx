import React, {useState, useRef, useEffect} from 'react'
import {getSunrise} from 'sunrise-sunset-js'
import {Origin, Horoscope} from 'circular-natal-horoscope-js/dist/index.js'

import Zodiac from './Zodiac'
import HourTable from './Hours'
import TraditionalPlanetsTable from './Planets/Traditional'
import ModernPlanetsTable from './Planets/Modern'
import Settings from './Settings'
import ControlPane from './Controls'

import s from './App.module.css'

import {SettingContext} from './SettingContext.js'
import {CelestialContext} from './CelestialContext.js'

function valid(dateString: string) {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(+date)
}

const LS = window.localStorage

const elementMap = {
  aries: 'fire',
  taurus: 'earth',
  gemini: 'air',
  cancer: 'water',
  leo: 'fire',
  virgo: 'earth',
  libra: 'air',
  scorpio: 'water',
  sagittarius: 'fire',
  capricorn: 'earth',
  aquarius: 'air',
  pisces: 'water'
}

const elements = {water: '🜄', fire: '🜂', earth: '🜃', air: '🜁'}

function reduceToElements(horoscope) {
  return Object.values(horoscope.CelestialBodies).reduce((acc, body: any) => {
    const sign = body?.Sign?.key
    if (!sign) return acc
    if (!acc[elementMap[sign]]) {
      acc[elementMap[sign]] = 0
    }
    acc[elementMap[sign]] += 1
    return acc
  }, {})
}

/**
 * Layout and global state is set here
 */
function App() {
  const lss = JSON.parse(LS.getItem('settings'))

  const center = useRef(null)

  const [settings, setSettings] = useState(
    lss ?? {
      objects: {
        planets: {
          Saturn: true,
          Jupiter: true,
          Mars: true,
          Sun: true,
          Venus: true,
          Mercury: true,
          Moon: true,
          Pluto: true,
          Neptune: true,
          Uranus: true
        },
        celestialPoints: {
          lilith: true,
          northnode: true,
          southnode: true
        }
      },
      interface: {
        planets: 'modern'
      }
    }
  )

  const settingsContextValue = {settings, setSettings}

  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)

  useEffect(() => {
    center.current.scrollIntoView()
  }, [])

  const dateString = window.location.hash.replace('#', '')
  const now = valid(dateString) ? new Date(dateString) : new Date()

  const [date, setDate] = useState(now)

  const calendarDay = date
  const cDaySunrise = getSunrise(lat, lng, calendarDay)
  const morning = calendarDay.getTime() < cDaySunrise.getTime()
  const today = morning ? new Date(+new Date() - 86400000) : calendarDay

  const horoscope = getHoroscope(date, lat, lng)

  function modernPlanets() {
    const s = {...settings, interface: {planets: 'modern'}}
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  function traditionalPlanets() {
    const s = {...settings, interface: {planets: 'traditional'}}
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  return (
    <SettingContext.Provider value={settingsContextValue}>
      <CelestialContext.Provider value={horoscope}>
        <div className={s.Hours}>
          <header className={s.header}>
            <ControlPane
              {...{setLat, setLng, setDate, lat, lng, dateString, today}}
            />
          </header>

          <main className={s.layout} dir="ltr">
            <section>
              <Settings />
            </section>

            <section className={s.tables} ref={el => (center.current = el)}>
              <div className={s.elements}>
                <table>
                  <tbody>
                    {Object.entries(reduceToElements(horoscope))
                      .sort((a, b) => b[1] - a[1])
                      .map(([s, v]) => (
                        <tr>
                          <td>{elements[s]}</td>
                          <td>{v}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <Zodiac {...{calendarDay, lat, lng}} />

              <div className={s.tablesSelector}>
                <button
                  disabled={settings.interface?.planets == 'modern'}
                  onClick={modernPlanets}
                >
                  modern
                </button>
                <button
                  disabled={settings.interface?.planets == 'traditional'}
                  onClick={traditionalPlanets}
                >
                  traditional
                </button>
              </div>
              {settings.interface?.planets == 'traditional' && (
                <TraditionalPlanetsTable
                  lat={lat}
                  lng={lng}
                  calendarDay={calendarDay}
                  today={today}
                />
              )}
              {settings.interface?.planets == 'modern' && (
                <ModernPlanetsTable
                  lat={lat}
                  lng={lng}
                  calendarDay={calendarDay}
                  today={today}
                />
              )}
            </section>

            <section>
              <HourTable
                lat={lat}
                lng={lng}
                calendarDay={calendarDay}
                today={today}
              />
            </section>
          </main>
        </div>
      </CelestialContext.Provider>
    </SettingContext.Provider>
  )
}

export default App

function getHoroscope(calendarDay: Date, latitude: number, longitude: number) {
  const year = calendarDay.getFullYear()
  const month = calendarDay.getMonth()
  const date = calendarDay.getDate()
  const hour = calendarDay.getHours()
  const minute = calendarDay.getMinutes()

  const origin = new Origin({
    year,
    month, // 0 = January, 11 = December!
    date,
    hour,
    minute,
    latitude,
    longitude
  })

  const horoscope = new Horoscope({
    origin: origin,
    houseSystem: 'placidus',
    zodiac: 'tropical',
    aspectPoints: ['bodies', 'points', 'angles'],
    aspectWithPoints: ['bodies', 'points', 'angles'],
    aspectTypes: ['major', 'minor'],
    customOrbs: {},
    language: 'en'
  })

  return horoscope
}
