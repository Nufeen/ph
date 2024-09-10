import React, {useState, useRef, useEffect} from 'react'
import {getSunrise} from 'sunrise-sunset-js'
import {SettingContext, SettingDispatchContext} from './SettingContext.js'

import s from './App.module.css'

import Zodiac from './Zodiac'
import HourTable from './Hours'
import PlanetsTable from './Planets'

import Settings from './Settings'

import ControlPane from './Controls'

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
      }
    }
  )

  const value = {settings, setSettings}

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

  return (
    <SettingContext.Provider value={value}>
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

          <section ref={el => (center.current = el)}>
            <Zodiac {...{calendarDay, lat, lng}} />
            <PlanetsTable
              lat={lat}
              lng={lng}
              calendarDay={calendarDay}
              today={today}
            />
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
    </SettingContext.Provider>
  )
}

export default App
