import {useState, useRef, useEffect} from 'react'
import {getSunrise} from 'sunrise-sunset-js'

import Zodiac from './interface/Zodiac'
import ElementsTable from './interface/Elements'

import HourTable from './interface/Hours'
import TraditionalPlanetsTable from './interface/Planets/Traditional'
import ModernPlanetsTable from './interface/Planets/Modern'
import ThirtyDegrees from './interface/Planets/ThirtyDegrees'

import Settings from './interface/Settings'
import ControlPane from './interface/Controls'

import s from './App.module.css'

import getHoroscope from './compute/horoscope'

import {connectedStars} from './compute/stars'

import {SettingContext} from './SettingContext.js'
import {CelestialContext} from './CelestialContext.js'

import defaultSettings from './defaultSettings.json'

import {getCitiesByCountryCode} from 'country-city-location'

import GraphicChart from './interface/Graphic'

const LS = window.localStorage

/**
 * Layout and global state is set here
 *
 * -> time and place of both maps are kept in uri params in order to save bookmark
 * -> all horoscope data is then shared via CelestialContext
 * -> user ui settings are kept in local storage and shared via SettingContext
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

  /**
   * Setting cenered scroll position on mobile phones
   */
  const center = useRef(null)
  useEffect(() => {
    center.current.scrollIntoView()
  }, [])

  /**
   * Time and location management
   */
  const urlParams = new URLSearchParams(window.location.search)

  const LSNatalData = JSON.parse(LS.getItem('natalData'))
  const LSTransitData = JSON.parse(LS.getItem('transitData'))

  const [natalData, setNatalData] = useState({
    city: urlParams.get('city') ?? LSNatalData?.city ?? null,
    country: urlParams.get('country') ?? LSNatalData?.country ?? null,
    date:
      (urlParams.get('date') ? new Date(+urlParams.get('date')) : null) ??
      (LSNatalData?.date && new Date(LSNatalData?.date)) ??
      new Date()
  })

  const [transitData, setTransitData] = useState({
    city: urlParams.get('city2') ?? LSTransitData?.city ?? null,
    country: urlParams.get('country2') ?? LSTransitData?.country ?? null,
    date:
      (urlParams.get('date2') ? new Date(+urlParams.get('date')) : null) ??
      (LSTransitData?.date && new Date(LSTransitData?.date)) ??
      new Date()
  })

  const url = new URL(window.location.toString())

  Object.entries(natalData).forEach(
    ([k, v]) => !!v && url.searchParams.set(k, v?.toString())
  )

  !!natalData?.date &&
    url.searchParams.set('date', (+natalData?.date).toString())

  window.history.pushState({}, '', url)

  LS.setItem('natalData', JSON.stringify(natalData))
  LS.setItem('transitData', JSON.stringify(transitData))

  const {country, city} = natalData

  let cities = (country && getCitiesByCountryCode(country)) ?? []

  let uniqueNames = new Set()
  cities = cities.reduce((acc, item) => {
    if (!uniqueNames.has(item.name)) {
      uniqueNames.add(item.name)
      acc.push(item)
    }
    return acc.sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  const {lat, lng} = deriveLatLngFromLocation(city)

  const latlng = {
    natal: deriveLatLngFromLocation(natalData.city),
    transit: deriveLatLngFromLocation(transitData.city)
  }

  function deriveLatLngFromLocation(city) {
    const cc = cities?.find(x => x.name === city)
    if (!cc) return {lat: 0, lng: 0}
    return {lat: +cc.lat, lng: +cc.lng}
  }

  const horoscope = getHoroscope(
    natalData.date,
    latlng.natal.lat,
    latlng.natal.lng,
    settings?.interface?.houseSystem
  )

  const transitHoroscope = getHoroscope(
    transitData.date,
    latlng.transit.lat,
    latlng.transit.lng,
    settings?.interface?.houseSystem
  )

  /**
   * Planetary hours
   */
  const cDaySunrise = getSunrise(
    latlng.natal.lat,
    latlng.natal.lng,
    natalData.date
  )
  const morning = natalData.date.getTime() < cDaySunrise.getTime() // for planet hours
  const today = morning ? new Date(+new Date() - 86400000) : natalData.date

  function selectPlanetsTable(planets) {
    const s = {...settings, interface: {...settings.interface, planets}}
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  return (
    <SettingContext.Provider value={settingsContextValue}>
      <CelestialContext.Provider
        value={{
          horoscope,
          transitHoroscope,
          stars: connectedStars(natalData.date),
          natalData,
          transitData,
          chart: latlng
        }}
      >
        <div>
          <header className={s.header}>
            <ControlPane
              {...{
                setNatalData,
                setTransitData
              }}
            />
          </header>

          <main className={s.layout} dir="ltr">
            <section className={s.left}>
              <Settings />
            </section>

            {settings.chartType != 'graphic' && (
              <section className={s.center} ref={el => (center.current = el)}>
                {settings.interface?.elements && (
                  <ElementsTable {...{horoscope}} />
                )}
                <Zodiac {...{calendarDay: natalData.date, lat, lng}} />
              </section>
            )}

            {settings.chartType == 'graphic' && (
              <section className={s.center} ref={el => (center.current = el)}>
                <GraphicChart />
              </section>
            )}

            {settings.chartType != 'graphic' && (
              <section className={s.right}>
                <div className={s.tablesSelector}>
                  <button
                    disabled={settings.interface?.planets == 'modern'}
                    onClick={() => selectPlanetsTable('modern')}
                  >
                    modern
                  </button>
                  <button
                    disabled={settings.interface?.planets == 'traditional'}
                    onClick={() => selectPlanetsTable('traditional')}
                  >
                    traditional
                  </button>
                  <button
                    disabled={settings.interface?.planets == 'hours'}
                    onClick={() => selectPlanetsTable('hours')}
                  >
                    hours
                  </button>
                </div>

                {settings.interface?.planets == 'traditional' && (
                  <TraditionalPlanetsTable
                    lat={lat}
                    lng={lng}
                    calendarDay={natalData.date}
                    today={today}
                  />
                )}
                {settings.interface?.planets != 'hours' &&
                  settings.interface?.thirty && <ThirtyDegrees />}

                {settings.interface?.planets == 'modern' && (
                  <ModernPlanetsTable />
                )}
                {settings.interface?.planets == 'hours' && (
                  <HourTable
                    lat={lat}
                    lng={lng}
                    calendarDay={natalData.date}
                    today={today}
                  />
                )}
              </section>
            )}
          </main>
        </div>
      </CelestialContext.Provider>
    </SettingContext.Provider>
  )
}

export default App
