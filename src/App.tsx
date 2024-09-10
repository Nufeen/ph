import React, {useState, useRef} from 'react'
import {getSunrise} from 'sunrise-sunset-js'

import s from './App.module.css'

import Zodiac from './Zodiac'
import HourTable from './Hours'
import PlanetsTable from './Planets'

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
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)

  const dateString = window.location.hash.replace('#', '')
  const now = valid(dateString) ? new Date(dateString) : new Date()

  const [date, setDate] = useState(now)

  const calendarDay = date
  const cDaySunrise = getSunrise(lat, lng, calendarDay)
  const morning = calendarDay.getTime() < cDaySunrise.getTime()
  const today = morning ? new Date(+new Date() - 86400000) : calendarDay

  return (
    <div className={s.Hours}>
      <header className={s.header}>
        <ControlPane
          {...{setLat, setLng, setDate, lat, lng, dateString, today}}
        />
      </header>

      <main className={s.layout}>
        <section>
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
  )
}

export default App
