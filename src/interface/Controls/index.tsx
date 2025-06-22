import {useContext, useRef, useState} from 'react'

import cityTimezones from 'city-timezones'
import moment from 'moment-timezone'

import {
  countries,
  getCitiesByCountryCode
} from 'country-city-location'

import {SettingContext} from '../../SettingContext'
import {CelestialContext} from '../../CelestialContext'

import s from './index.module.css'

import {openDB} from 'idb'

// for forced rerender of uncontrolled inputs
let shifter = 0

function valid(dateString: string) {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(+date)
}

const LS = window.localStorage

function deriveCitiesFrom(country) {
  let cities = (country && getCitiesByCountryCode(country)) ?? []

  let uniqueNames = new Set()
  cities = cities.reduce((acc, item) => {
    if (!uniqueNames.has(item.name)) {
      uniqueNames.add(item.name)
      acc.push(item)
    }
    return acc.sort((a, b) => a.name.localeCompare(b.name))
  }, [])
  return cities
}

// Try to get city timezone, if fails, set local \o/
// TODO check country in case of several cities
function timezone(city: string) {
  return cityTimezones.lookupViaCity(city ?? '')?.[0]?.timezone ?? ''
}

export default function ControlPane(props) {
  const inputRef = {
    transit: useRef(null),
    natal: useRef(null)
  }
  const cityRef = useRef(null)

  const {settings, setSettings} = useContext(SettingContext)
  const {natalData, transitData} = useContext(CelestialContext)

  const [successfulSave, setSuccessfulSave] = useState(false)

  const data = {
    transit: transitData,
    natal: natalData
  }

  const cities = {
    transit: deriveCitiesFrom(transitData.country),
    natal: deriveCitiesFrom(natalData.country)
  }

  const setter = {
    transit: props.setTransitData,
    natal: props.setNatalData
  }

  function handleCurrentTimeSetterClick(chartType) {
    inputRef[chartType].current.value = new Date()
      .toISOString()
      .slice(0, -5)

    setter[chartType]({
      ...data[chartType],
      date: new Date(),
      // hack to rerender input via key
      name: new Date().toString()
    })
  }

  function handleDateInput(e, chartType) {
    if (!valid(e.target.value as string)) {
      return
    }

    let date = moment(e.target.value).toDate()

    setter[chartType]({
      ...data[chartType],
      date
    })
  }

  /**
   * We keep time in LOCAL datetime, since we have to
   * Maybe it was a mistake and UTC should have used everywhere
   * but localdatetime inputs are easiest way to interact
   * on mobiles etc without bothering with UI
   * So here we hack the input to show correct time after rerender
   */
  const localDateTime = chartType => {
    const tz = timezone(data[chartType]?.city)

    let date = data[chartType]?.date

    const tzUTCOffset = moment(date).tz(tz)?.utcOffset()
    const localUTCOffset = moment(date)?.utcOffset()
    const delta = localUTCOffset - tzUTCOffset

    date = new Date(date.getTime() + delta * 60000)

    return (
      moment(date).tz(tz)?.format()?.substring(0, 16) ??
      new Date().toUTCString()
    )
  }

  function handleCitySelect(e, chartType) {
    const city = e.target.value

    const tz = timezone(city)

    setter[chartType]({
      ...data[chartType],
      city,
      tz
    })
  }

  function handleCountrySelection(e, chartType) {
    const country = e.target.value
    let cities = getCitiesByCountryCode(country)

    setter[chartType]({
      ...data[chartType],
      country,
      city: cities[0].name
    })
  }

  function swap() {
    props.setNatalData(transitData)
    props.setTransitData(natalData)
    shifter += 1
  }

  function setChartType(chartType) {
    const s = {
      ...settings,
      chartType
    }
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  function handleHouseVisibility(e, chartType) {
    const s = {
      ...settings,
      objects: {
        ...settings.objects,
        houses: {
          ...(settings.objects?.houses ?? {}),
          visibility: {
            ...(settings.objects?.houses?.visibility ?? {}),
            [chartType]: e.target.checked
          }
        }
      }
    }
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  const save = async chartType => {
    let name = prompt('Enter name')

    const db = await openDB('astro-ph-db1', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('people')) {
          db.createObjectStore('people', {
            keyPath: 'name'
          })
        }
      }
    })

    const value = await db.get('people', name)

    if (!value) {
      await db.add('people', {
        name,
        date: data[chartType].date,
        city: data[chartType].city,
        country: data[chartType].country
      })
    } else {
      alert(
        'Person already exists with the same name.\n' +
          'Please use a different name.'
      )
    }
    setSuccessfulSave(true)
    props.setDbScreenVisible(false)

    setTimeout(() => {
      setSuccessfulSave(false)
    }, 1000)
  }

  return (
    <div className={s.wrapper}>
      {['transit', 'graphic'].includes(settings.chartType) && (
        <div className={s.swap}>
          <button onClick={swap}>⇄</button>
          swap
        </div>
      )}

      <div className={s.chartTypeSelector}>
        {[
          'natal',
          'transit',
          'progressed',
          'graphic'
          // WIP:
          // 'barbo'
        ].map(type => (
          <button
            key={type}
            disabled={settings.chartType === type}
            onClick={() => setChartType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {(['transit', 'progressed', 'graphic', 'barbo'].includes(
        settings.chartType
      )
        ? ['natal', 'transit']
        : ['natal']
      ).map(chartType => (
        <section key={chartType}>
          <button
            title="set time to current"
            className={s.reset}
            onClick={() => handleCurrentTimeSetterClick(chartType)}
          >
            ⌛
          </button>
          <div className={s.checkboxWrapper}>
            houses
            <input
              type="checkbox"
              className={s.cosmogram}
              checked={
                settings.objects?.houses?.visibility[chartType]
              }
              onChange={e => handleHouseVisibility(e, chartType)}
            />
          </div>
          <input
            key={
              data[chartType]?.city + data[chartType]?.name + shifter
            }
            ref={inputRef[chartType]}
            className={s.input}
            type="datetime-local"
            onInput={e => handleDateInput(e, chartType)}
            defaultValue={localDateTime(chartType)}
          />
          <select
            onChange={e => handleCountrySelection(e, chartType)}
            value={data[chartType].country ?? null}
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
            disabled={data[chartType].country == null}
            onChange={e => handleCitySelect(e, chartType)}
            value={data[chartType].city ?? ''}
          >
            <option disabled value="aa">
              Location
            </option>
            {cities[chartType].map(x => (
              <option key={x.name} value={x.name}>
                {x.name}
              </option>
            ))}
          </select>
          <div className={s.transitInfo}>
            <button onClick={() => save(chartType)}>
              {successfulSave ? '✅' : '💾'}
            </button>

            {chartType == 'natal' && (
              <button
                onClick={() =>
                  props.setDbScreenVisible(!props.dbScreenVisible)
                }
              >
                {props.dbScreenVisible ? '←' : '👫'}
              </button>
            )}

            <ul className={s.dates}>
              <FormattedDate data={data} chartType={chartType} />
            </ul>
            <span></span>
          </div>
        </section>
      ))}
    </div>
  )
}

/**
 * Yet another localdatetime hack
 */
const FormattedDate = ({data, chartType}) => {
  const d0 = data[chartType]?.date
  const tz = timezone(data[chartType]?.city)
  const tzUTCOffset = moment(d0).tz(tz)?.utcOffset()
  const localUTCOffset = moment(d0)?.utcOffset()
  const delta = localUTCOffset - tzUTCOffset
  const date = new Date(d0.getTime() + delta * 60000)
  const formattedDate = moment(date).tz(tz)?.format('lll Z')

  return (
    <li>
      {tz}: {formattedDate}
    </li>
  )
}
