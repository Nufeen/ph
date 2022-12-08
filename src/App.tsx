import React, {useState} from 'react'
import {getSunrise} from 'sunrise-sunset-js'

import s from './App.module.css'

import Zodiac from './Zodiac'
import HourTable from './Hours'
import PlanetsTable from './Planets'

const cities = {
  Moscow: [55.753215, 37.622504],
  Kazan: [55.796289, 49.108795]
}

const city = 'Moscow'

function valid(dateString: string) {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(+date)
}

function App() {
  const [lat, setLat] = useState(cities[city][0])
  const [lng, setLng] = useState(cities[city][1])

  const dateString = window.location.hash.replace('#', '')
  const now = valid(dateString) ? new Date(dateString) : new Date()

  const [date, setDate] = useState(now)

  function handleTimeClick() {
    history.pushState(
      '',
      document.title,
      window.location.pathname + window.location.search
    )
    setDate(new Date())
  }

  function handleDateInput(e) {
    if (!valid(e.target.value)) {
      return
    }

    const x = new Date(e.target.value)
    window.location.hash = e.target.value
    setDate(x)
  }

  function handlePositionClick() {
    navigator.geolocation.getCurrentPosition(position => {
      if (!position) return
      setLat(position?.coords?.latitude)
      setLng(position?.coords?.longitude)
    })
  }

  const calendarDay = date
  const cDaySunrise = getSunrise(lat, lng, calendarDay)
  const morning = calendarDay.getTime() < cDaySunrise.getTime()
  const today = morning ? new Date(+new Date() - 86400000) : calendarDay

  return (
    <div className={s.Hours}>
      <header>
        <h4>
          <button onClick={handleTimeClick}>now</button>

          <input
            type="datetime-local"
            onInput={handleDateInput}
            defaultValue={
              valid(dateString)
                ? dateString
                : today.toISOString().substring(0, 16)
            }
          />
        </h4>

        <h4>
          <span>
            {lat.toFixed(2)}, {lng.toFixed(2)}
          </span>
          <button onClick={handlePositionClick}>g</button>
        </h4>
      </header>

      <main className={s.layout}>
        <section>
          <Zodiac calendarDay={calendarDay} />
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
