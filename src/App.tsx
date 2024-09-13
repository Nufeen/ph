import React, {useState, useRef, useEffect} from 'react'
import {getSunrise} from 'sunrise-sunset-js'
import {Origin, Horoscope} from 'circular-natal-horoscope-js/dist/index.js'
import {Body, Ecliptic, GeoVector} from 'astronomy-engine'

import Zodiac from './interface/Zodiac'
import ElementsTable from './interface/Elements'

import HourTable from './interface/Hours'
import TraditionalPlanetsTable from './interface/Planets/Traditional'
import ModernPlanetsTable from './interface/Planets/Modern'
import Settings from './interface/Settings'
import ControlPane from './interface/Controls'

import s from './App.module.css'

import getHoroscope from './compute/horoscope'

import {connectedStars} from './compute/stars'

import {SettingContext} from './SettingContext.js'
import {CelestialContext} from './CelestialContext.js'

function valid(dateString: string) {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(+date)
}

const LS = window.localStorage

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
      <CelestialContext.Provider
        value={{horoscope, stars: connectedStars(calendarDay)}}
      >
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
              <ElementsTable {...{horoscope}} />

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
