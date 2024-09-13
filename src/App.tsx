import {useState, useRef, useEffect} from 'react'
import {getSunrise} from 'sunrise-sunset-js'

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

import defaultSettings from './defaultSettings.json'

function valid(dateString: string) {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(+date)
}

const LS = window.localStorage

/**
 * Layout and global state is set here
 */
function App() {
  const localSavedSettings = JSON.parse(LS.getItem('settings'))

  /**
   * Interface settings management
   */
  const [settings, setSettings] = useState(
    localSavedSettings ?? defaultSettings
  )

  const settingsContextValue = {settings, setSettings}

  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)

  /**
   * Setting cenered scroll position on mobile phones
   */
  const center = useRef(null)
  useEffect(() => {
    center.current.scrollIntoView()
  }, [])

  /**
   * Time management
   */
  const dateString = window.location.hash.replace('#', '')
  const now = valid(dateString) ? new Date(dateString) : new Date()

  const [date, setDate] = useState(now)

  const calendarDay = date
  const cDaySunrise = getSunrise(lat, lng, calendarDay)
  const morning = calendarDay.getTime() < cDaySunrise.getTime() // for planet hours
  const today = morning ? new Date(+new Date() - 86400000) : calendarDay

  const horoscope = getHoroscope(date, lat, lng)

  /**
   * TODO move to separate component: Planets/ModernitySelector
   */
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
              {settings.interface?.elements && (
                <ElementsTable {...{horoscope}} />
              )}
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
