import {useEffect, useRef, useState} from 'react'
import {countries, getCitiesByCountryCode} from 'country-city-location'
import s from './index.module.css'

function valid(dateString: string) {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(+date)
}

const LS = window.localStorage

export default function ControlPane(props) {
  const inputRef = useRef(null)
  const cityRef = useRef(null)

  const [country, setCountry] = useState(LS.getItem('country') ?? null)

  let cities = (country && getCitiesByCountryCode(country)) ?? []

  let uniqueNames = new Set()
  cities = cities.reduce((acc, item) => {
    if (!uniqueNames.has(item.name)) {
      uniqueNames.add(item.name)
      acc.push(item)
    }
    return acc
  }, [])

  const [city, setCity] = useState(LS.getItem('city') ?? null)

  useEffect(() => {
    country && city && updateLatLng()
  })

  function handleCurrentTimeSetterClick() {
    history.pushState(
      '',
      document.title,
      window.location.pathname + window.location.search
    )

    inputRef.current.value = new Date().toISOString().slice(0, -5)

    props.setDate(new Date())
  }

  function handleDateInput(e) {
    if (!valid(e.target.value as string)) {
      return
    }

    const x = new Date(e.target.value)
    window.location.hash = e.target.value.toString()
    props.setDate(x)
  }

  function handleCitySelect(e) {
    const name = e.target.value
    LS.setItem('city', name)
    setCity(name)
    updateLatLng()
  }

  function updateLatLng() {
    const cc = cities?.find(x => x.name === city)
    if (!cc) return
    const {lat, lng} = cc
    props.setLat(+lat)
    props.setLng(+lng)
  }

  function handleCountrySelection(e) {
    const country = e.target.value
    LS.setItem('country', country)
    let cities = getCitiesByCountryCode(country)
    setCountry(country)
    setCity(cities[0].name)
    updateLatLng()
  }

  return (
    <div className={s.wrapper}>
      <section>
        <button
          title="set time to current"
          className={s.reset}
          onClick={handleCurrentTimeSetterClick}
        >
          ⌛
        </button>

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
      </section>

      <section>
        <select
          className={s.select}
          onChange={handleCountrySelection}
          value={country}
        >
          <option disabled value={null}>
            Location
          </option>
          {countries.map((x, i) => (
            <option key={i} value={x.Alpha2Code}>
              {x.Name}
            </option>
          ))}
        </select>

        <select
          ref={cityRef}
          disabled={country == null}
          className={s.select}
          onChange={handleCitySelect}
          value={city}
        >
          <option disabled value="aa">
            Location
          </option>
          {cities.map(x => (
            <option key={x.name} value={x.name}>
              {x.name}
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
    </div>
  )
}
