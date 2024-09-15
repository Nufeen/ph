import {useContext, useRef} from 'react'

import cityTimezones from 'city-timezones'
import moment from 'moment-timezone'

import {countries, getCitiesByCountryCode} from 'country-city-location'

import {SettingContext} from '../../SettingContext'
import {CelestialContext} from '../../CelestialContext'

import s from './index.module.css'

// for rerender of uncontrolled inputs
let shifter = 0

function valid(dateString: string) {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(+date)
}

const LS = window.localStorage

export default function ControlPane(props) {
  const inputRef = useRef(null)
  const cityRef = useRef(null)

  const {settings, setSettings} = useContext(SettingContext)
  const {natalData, transitData} = useContext(CelestialContext)

  function deriveCitiesFrom(country) {
    let cities = (country && getCitiesByCountryCode(country)) ?? []

    let uniqueNames = new Set()
    cities = cities.reduce((acc, item) => {
      if (!uniqueNames.has(item.name)) {
        uniqueNames.add(item.name)
        acc.push(item)
      }
      return acc
    }, [])
    return cities
  }

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
    inputRef.current.value = new Date().toISOString().slice(0, -5)

    setter[chartType]({
      ...data[chartType],
      date: new Date()
    })
  }

  function handleDateInput(e, chartType) {
    if (!valid(e.target.value as string)) {
      return
    }

    const date = new Date(e.target.value)

    setter[chartType]({
      ...data[chartType],
      date
    })
  }

  function handleCitySelect(e, chartType) {
    const city = e.target.value
    setter[chartType]({
      ...data[chartType],
      city
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

  return (
    <div className={s.wrapper}>
      {settings.chartType == 'transit' && (
        <div className={s.swap}>
          <button onClick={swap}>⇄</button>
          swap
        </div>
      )}

      <div className={s.chartTypeSelector}>
        <button
          disabled={settings.chartType == 'natal'}
          onClick={() => {
            const s = {
              ...settings,
              chartType: 'natal'
            }
            setSettings(s)
            LS.setItem('settings', JSON.stringify(s))
          }}
        >
          Natal
        </button>
        <button
          disabled={settings.chartType == 'transit'}
          onClick={() => {
            const s = {
              ...settings,
              chartType: 'transit'
            }
            setSettings(s)
            LS.setItem('settings', JSON.stringify(s))
          }}
        >
          Transit
        </button>
      </div>

      {(settings.chartType == 'natal' ? ['natal'] : ['natal', 'transit']).map(
        chartType => (
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
                checked={settings.objects?.houses?.visibility[chartType]}
                onChange={() => {
                  const s = {
                    ...settings,
                    objects: {
                      ...settings.objects,
                      houses: {
                        ...(settings.houses ?? {}),
                        visibility: {
                          ...(settings.objects?.houses?.visibility ?? {}),
                          [chartType]:
                            !settings.objects?.houses?.visibility[chartType]
                        }
                      }
                    }
                  }
                  setSettings(s)
                  LS.setItem('settings', JSON.stringify(s))
                }}
              />
            </div>
            <input
              key={data[chartType]?.city + shifter}
              ref={inputRef}
              className={s.input}
              type="datetime-local"
              onInput={e => handleDateInput(e, chartType)}
              defaultValue={
                moment(data[chartType].date)
                  .tz(
                    // TODO check country in case of several cities
                    cityTimezones.lookupViaCity(
                      data[chartType]?.city || ''
                    )?.[0]?.timezone ?? ''
                  )
                  ?.format()
                  ?.substring(0, 16) ?? new Date().toUTCString()
              }
            />
            <select
              onChange={e => handleCountrySelection(e, chartType)}
              value={data[chartType].country ?? ''}
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
              <span>
                {moment(data[chartType]?.date)
                  ?.tz(
                    cityTimezones.lookupViaCity(
                      data[chartType]?.city || ''
                    )?.[0]?.timezone ?? ''
                  )
                  ?.format('LLLL Z')}
              </span>
            </div>
          </section>
        )
      )}
    </div>
  )
}
