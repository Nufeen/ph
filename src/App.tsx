import React, {useState, useRef} from 'react'
import {getSunrise} from 'sunrise-sunset-js'

import s from './App.module.css'

import Zodiac from './Zodiac'
import HourTable from './Hours'
import PlanetsTable from './Planets'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import cityCSV from './assets/cities.csv'

const cities = cityCSV.reduce(
  (a: any, {city, lat, lng}: any) => ({...a, [city]: [+lat, +lng]}),
  {}
)

function valid(dateString: string) {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(+date)
}

const LS = window.localStorage

function ControlPane(props) {
  const inputRef = useRef(null)

  function handleCurrentTimeSetterClick() {
    history.pushState(
      '',
      document.title,
      window.location.pathname + window.location.search
    )

    inputRef.current.value = new Date().toISOString().slice(0, -5)

    props.setDate(new Date())
  }

  function handlePositionClick() {
    navigator.geolocation.getCurrentPosition(position => {
      if (!position) return
      LS.setItem('city', '')
      props.setLat(position?.coords?.latitude)
      props.setLng(position?.coords?.longitude)
    })
  }

  function handleDateInput(e) {
    if (!valid(e.target.value as string)) {
      return
    }

    const x = new Date(e.target.value)
    window.location.hash = e.target.value.toString()
    props.setDate(x)
  }

  function handleTransitCitySelect(e) {
    const city = e.target.value
    const [lat, lng] = cities[city]
    LS.setItem('city', city)
    props.setLat(lat)
    props.setLng(lng)
  }

  return (
    <>
      <section className={s.transitButtons}>
        <button onClick={handleCurrentTimeSetterClick}>
          set time to current
        </button>
        <button onClick={handlePositionClick}>use geolocation</button>
      </section>

      <section className={s.transit}>
        <input
          ref={inputRef}
          className={s.input}
          type="datetime-local"
          onInput={handleDateInput}
          defaultValue={
            valid(props.dateString)
              ? props.dateString
              : props.today.toISOString().substring(0, 16)
          }
        />
        <select
          className={s.select}
          onChange={handleTransitCitySelect}
          value={props.city}
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
        <span></span>
        <span>
          {props.lat.toFixed(2)}, {props.lng.toFixed(2)}
        </span>
      </section>
    </>
  )
}

/**
 * Layout and global state is set here
 */
function App() {
  const city = LS.getItem('city') ?? ''

  const [lat, setLat] = useState(cities?.[city]?.[0] ?? 0)
  const [lng, setLng] = useState(cities?.[city]?.[1] ?? 0)

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
          {...{setLat, setLng, setDate, lat, lng, city, dateString, today}}
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
