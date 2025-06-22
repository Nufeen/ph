import {useState, useRef, useEffect} from 'react'
import {getSunrise} from 'sunrise-sunset-js'

import Zodiac from './interface/Zodiac'
import ElementsTable from './interface/Elements'

import HourTable from './interface/Hours'
import TraditionalPlanetsTable from './interface/Planets/Traditional'
import ModernPlanetsTable from './interface/Planets/Modern'
import ThirtyDegrees from './interface/Planets/ThirtyDegrees'
import AspectTable from './interface/Planets/Aspects'

import Settings from './interface/Settings'
import UISettings from './interface/UISettings'
import ControlPane from './interface/Controls'
import GraphicChart from './interface/Graphic'
import Barbo from './interface/Barbo'
import DbScreen from './interface/IndexedDB'

import getHoroscope from './compute/horoscope'

import {connectedStars, starsOnFictivePoints} from './compute/stars'

import {SettingContext} from './SettingContext.js'
import {CelestialContext} from './CelestialContext.js'

import {getCitiesByCountryCode} from 'country-city-location'
import cityTimezones from 'city-timezones'

import s from './App.module.css'

import defaultSettings from './defaultSettings.json'

const LS = window.localStorage

/**
 * Time and location management
 * Read from URL in case of new location
 * If not, read latest from LS then provide state store
 */
const useData = () => {
  const urlParams = new URLSearchParams(window.location.search)

  const LSNatalData = JSON.parse(LS.getItem('natalData'))
  const LSTransitData = JSON.parse(LS.getItem('transitData'))

  const natalCity =
    urlParams.get('city') ?? LSNatalData?.city ?? null

  const natalTZ =
    cityTimezones.lookupViaCity(natalCity || '')?.[0]?.timezone ?? ''

  const date =
    (urlParams.get('date')
      ? new Date(+urlParams.get('date'))
      : null) ??
    (LSNatalData?.date && new Date(LSNatalData?.date)) ??
    new Date()

  const transitCity =
    urlParams.get('city2') ?? LSTransitData?.city ?? null

  const transitTZ =
    cityTimezones.lookupViaCity(transitCity || '')?.[0]?.timezone ??
    ''

  const date2 =
    (urlParams.get('date2')
      ? new Date(+urlParams.get('date2'))
      : null) ??
    (LSTransitData?.date && new Date(LSTransitData?.date)) ??
    new Date()

  const [natalData, setNatalData] = useState({
    city: natalCity,
    tz: natalTZ,
    country:
      urlParams.get('country') ?? LSNatalData?.country ?? null,
    date
  })

  const [transitData, setTransitData] = useState({
    city: urlParams.get('city2') ?? LSTransitData?.city ?? null,
    tz: transitTZ,
    country:
      urlParams.get('country2') ?? LSTransitData?.country ?? null,
    date: date2
  })

  return {natalData, setNatalData, transitData, setTransitData}
}

/**
 * Layout and global state is set here
 *
 * -> time and place of both maps are kept in uri params in order
 *    to keep ability to share and save bookmark in web
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

  for (const [name, value] of Object.entries(
    settings.colors || {}
  )) {
    document.documentElement.style.setProperty(
      `--${name}`,
      value as string
    )
  }

  const settingsContextValue = {settings, setSettings}

  /**
   * Interface State
   */
  const [dbScreenVisible, setDbScreenVisible] = useState(false)

  /**
   * Setting cenered scroll position on mobile phones
   */
  const centerSectionRef = useRef(null)
  useEffect(() => {
    centerSectionRef?.current?.scrollIntoView()
  }, [])

  const {natalData, setNatalData, transitData, setTransitData} =
    useData()

  const url = new URL(window.location.toString())

  Object.entries(natalData).forEach(
    ([k, v]) => !!v && url.searchParams.set(k, v?.toString())
  )

  !!natalData?.date &&
    url.searchParams.set('date', (+natalData?.date).toString())

  window.history.pushState({}, '', url)

  LS.setItem('natalData', JSON.stringify(natalData))
  LS.setItem('transitData', JSON.stringify(transitData))

  /**
   * Geocalculations
   */
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

  /**
   * Prepare horoscopes context for all types
   */
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

  function calculateProgressedDate(dateA, dateB) {
    const timestamp =
      dateA.getTime() + Math.abs((dateA - dateB) / 365.25)

    return new Date(timestamp)
  }

  const progressedDate = calculateProgressedDate(
    natalData.date,
    transitData.date
  )

  const progressedHoroscope = getHoroscope(
    progressedDate,
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
  const today = morning
    ? new Date(+new Date() - 86400000)
    : natalData.date

  function selectPlanetsTable(planets) {
    const s = {
      ...settings,
      interface: {...settings.interface, planets}
    }
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  function selectSettingsScreen(chosen) {
    const s = {
      ...settings,
      interface: {...settings.interface, settings: chosen}
    }

    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  const actualPlanets = Object.entries(settings.objects.planets)
    .filter(([k, v]) => !!v)
    .map(([k, v]) => k)

  return (
    <SettingContext.Provider value={settingsContextValue}>
      <CelestialContext.Provider
        value={{
          horoscope,
          transitHoroscope,
          progressedHoroscope,
          stars: connectedStars(natalData.date, actualPlanets),
          transitStars: connectedStars(
            transitData.date,
            actualPlanets
          ),
          progressedStars: connectedStars(
            progressedDate,
            actualPlanets
          ),
          fictivePointsStars: starsOnFictivePoints(
            natalData.date,
            horoscope
          ),
          natalData,
          transitData,
          chart: latlng
        }}
      >
        <div className={s.main}>
          <header className={s.header}>
            <ControlPane
              {...{
                setNatalData,
                setTransitData
              }}
              setDbScreenVisible={setDbScreenVisible}
              dbScreenVisible={dbScreenVisible}
            />
          </header>

          <main className={s.layout} dir="ltr">
            <section className={s.left}>
              <div className={s.settingsSelector}>
                {['sky', 'ui'].map(chosen => (
                  <button
                    disabled={
                      settings.interface?.settings === chosen
                    }
                    onClick={() => selectSettingsScreen(chosen)}
                    key={chosen}
                  >
                    {chosen}
                  </button>
                ))}
              </div>

              {settings.interface.settings == 'sky' ? (
                <Settings />
              ) : (
                <UISettings />
              )}
            </section>

            {/* Basic sky screen */}
            {settings.chartType != 'graphic' &&
              settings.chartType != 'barbo' && (
                <section className={s.center} ref={centerSectionRef}>
                  {dbScreenVisible ? (
                    <DbScreen
                      setDbScreenVisible={setDbScreenVisible}
                      {...{
                        setNatalData,
                        setTransitData
                      }}
                    />
                  ) : (
                    <>
                      {settings.interface?.elements && (
                        <ElementsTable {...{horoscope}} />
                      )}
                      <Zodiac
                        {...{calendarDay: natalData.date, lat, lng}}
                      />
                    </>
                  )}
                </section>
              )}

            {/* graphic ephemeris chart */}
            {settings.chartType == 'graphic' && (
              <section className={s.center} ref={centerSectionRef}>
                <GraphicChart />
              </section>
            )}

            {/* Cycle indexes chart */}
            {settings.chartType == 'barbo' && (
              <section className={s.center} ref={centerSectionRef}>
                <Barbo />
              </section>
            )}

            {settings.chartType != 'graphic' &&
              settings.chartType != 'barbo' && (
                <section className={s.right}>
                  <div className={s.tablesSelector}>
                    {[
                      'modern',
                      'traditional',
                      'hours',
                      'aspects'
                    ].map(planet => (
                      <button
                        disabled={
                          settings.interface?.planets === planet
                        }
                        onClick={() => selectPlanetsTable(planet)}
                        key={planet}
                      >
                        {planet}
                      </button>
                    ))}
                  </div>

                  {settings.interface?.planets != 'hours' &&
                    settings.interface?.thirty && <ThirtyDegrees />}

                  {settings.interface?.planets == 'traditional' && (
                    <TraditionalPlanetsTable
                      lat={lat}
                      lng={lng}
                      calendarDay={natalData.date}
                      today={today}
                    />
                  )}

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

                  {settings.interface?.planets == 'aspects' && (
                    <AspectTable />
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
