import React, {useState} from 'react'
import {getSunrise} from 'sunrise-sunset-js'

import s from './App.module.css'

import Zodiac from './Zodiac'
import HourTable from './Hours'
import PlanetsTable from './Planets'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import cityCSV from './assets/cities.csv'

const cities = cityCSV.reduce(
  (a, {city, lat, lng}) => ({...a, [city]: [+lat, +lng]}),
  {}
)

function valid(dateString: string) {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(+date)
}

const LS = window.localStorage

function App() {
  const city = LS.getItem('city') ?? ''

  const [lat, setLat] = useState(cities?.[city]?.[0] ?? 0)
  const [lng, setLng] = useState(cities?.[city]?.[1] ?? 0)

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

  function handleTransitCitySelect(e) {
    const city = e.target.value
    const [lat, lng] = cities[city]
    LS.setItem('city', city)
    setLat(lat)
    setLng(lng)
  }

  function handlePositionClick() {
    navigator.geolocation.getCurrentPosition(position => {
      if (!position) return
      LS.setItem('city', '')
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
      <header className={s.header}>
        <section className={s.transitButtons}>
          <button onClick={handleTimeClick}>set time to current</button>
          <button onClick={handlePositionClick}>use geolocation</button>
        </section>
        <section className={s.transit}>
          <input
            className={s.input}
            type="datetime-local"
            onInput={handleDateInput}
            defaultValue={
              valid(dateString)
                ? dateString
                : today.toISOString().substring(0, 16)
            }
          />
          <select
            className={s.select}
            onChange={handleTransitCitySelect}
            value={city}
          >
            <option disabled value="">
              Location
            </option>
            {Object.keys(cities).map(x => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </section>
        <section className={s.transitInfo}>
          <span>Transit:</span>
          <span>
            {lat.toFixed(2)}, {lng.toFixed(2)}
          </span>
        </section>
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
