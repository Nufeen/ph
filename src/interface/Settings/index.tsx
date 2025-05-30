import React, {useContext} from 'react'
import {SettingContext} from '../../SettingContext.js'
import {CelestialContext} from '../../CelestialContext.js'

import s from './index.module.css'

import planets from '../../assets/planets.json'

const LS = window.localStorage

const PlanetCheckboxTable = () => {
  const {settings, setSettings} = useContext(SettingContext)

  function handlePlanetVisibility(planet: string) {
    const s = {
      ...settings,
      objects: {
        ...settings.objects,
        planets: {
          ...settings.objects.planets,
          [planet]: !settings.objects.planets[planet]
        }
      }
    }
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  function handlePointVisibility(point: string) {
    const s = {
      ...settings,
      objects: {
        ...settings.objects,
        celestialPoints: {
          ...(settings.objects?.celestialPoints || {}),
          [point]: !settings.objects.celestialPoints?.[point]
        }
      }
    }
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  function handleStarsVisibility(loc: string) {
    const s = {
      ...settings,
      objects: {
        ...settings.objects,
        celestialPoints: {
          ...(settings.objects?.celestialPoints || {}),
          fixedStars: {
            ...(settings.objects?.celestialPoints?.fixedStars || {}),
            ...settings.objects.celestialPoints?.fixedStars,
            [loc]:
              !settings.objects.celestialPoints?.fixedStars?.[loc]
          }
        }
      }
    }
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  function handleElementsVisibility() {
    const s = {
      ...settings,
      interface: {
        ...settings.interface,
        elements: !settings.interface.elements
      }
    }
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  function handleThirtyVisibility() {
    const s = {
      ...settings,
      interface: {
        ...settings.interface,
        thirty: !settings.interface.thirty
      }
    }
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  function handleHouseSystemSelect(e: {target: {value: any}}) {
    const s = {
      ...settings,
      interface: {
        ...settings.interface,
        houseSystem: e.target.value
      }
    }
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  function handleCircleStartSelect(e: {target: {value: any}}) {
    const s = {
      ...settings,
      interface: {
        ...settings.interface,
        startFrom: e.target.value
      }
    }
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  function handleAspectAnglesVisibility(e: {
    target: {checked: any}
  }) {
    const s = {
      ...settings,
      interface: {
        ...settings.interface,
        aspectAngles: e.target.checked
      }
    }
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  function handlePlanetAnglesVisibility(e: {
    target: {checked: any}
  }) {
    const s = {
      ...settings,
      interface: {
        ...settings.interface,
        planetAngles: e.target.checked
      }
    }
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  function handleFortuneLotVisibility(e: {target: {checked: any}}) {
    const s = {
      ...settings,
      objects: {
        ...settings.objects,
        lots: {
          ...settings.objects.lots,
          fortune: e.target.checked
        }
      }
    }

    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  function handleSpiritLotVisibility(e: {target: {checked: any}}) {
    const s = {
      ...settings,
      objects: {
        ...settings.objects,
        lots: {
          ...settings.objects.lots,
          spirit: e.target.checked
        }
      }
    }
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))
  }

  function setOrb(e: {target: {value: string | number}}) {
    const s = {
      ...settings,
      interface: {
        ...settings.interface,
        aspectOrb: +e.target.value
      }
    }
    setSettings(s)

    LS.setItem('settings', JSON.stringify(s))
  }

  return (
    <div className={s.wrapper}>
      <table className={s.planetes}>
        <thead className={s.thead}>
          <tr>
            <th></th>
            <th>On</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(planets).map(planet => (
            <tr key={planet}>
              <td>{planets[planet]}</td>
              <td>
                <input
                  type="checkbox"
                  checked={settings.objects.planets[planet]}
                  onChange={() => handlePlanetVisibility(planet)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className={s.fictive}>
        <thead className={s.thead}>
          <tr>
            <th></th>
            <th>On</th>
          </tr>
        </thead>
        <tbody>
          {['lilith', 'northnode', 'southnode'].map(point => (
            <tr key={point}>
              <td>{point}</td>
              <td>
                <input
                  type="checkbox"
                  checked={settings.objects.celestialPoints?.[point]}
                  onChange={() => handlePointVisibility(point)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className={s.other}>
        <thead className={s.thead}>
          <tr>
            <th>Fixed stars</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Chart</td>
            <td>
              <input
                type="checkbox"
                checked={
                  settings.objects.celestialPoints?.fixedStars?.chart
                }
                onChange={() => handleStarsVisibility('chart')}
              />
            </td>
          </tr>
          <tr>
            <td>Table</td>
            <td>
              <input
                type="checkbox"
                checked={
                  settings.objects.celestialPoints?.fixedStars?.table
                }
                onChange={() => handleStarsVisibility('table')}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <table className={s.elements}>
        <thead className={s.thead}>
          <tr>
            <th>Elements</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Show</td>
            <td>
              <input
                type="checkbox"
                checked={settings.interface?.elements}
                onChange={handleElementsVisibility}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <table className={s.thirty}>
        <thead className={s.thead}>
          <tr>
            <th>Other</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Show 30°</td>
            <td>
              <input
                type="checkbox"
                checked={settings.interface?.thirty}
                onChange={handleThirtyVisibility}
              />
            </td>
          </tr>

          <tr>
            <td>Aspect angles</td>
            <td>
              <input
                type="checkbox"
                checked={settings.interface?.aspectAngles}
                onChange={handleAspectAnglesVisibility}
              />
            </td>
          </tr>

          <tr>
            <td>Planet angles</td>
            <td>
              <input
                type="checkbox"
                checked={settings.interface?.planetAngles}
                onChange={handlePlanetAnglesVisibility}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <table className={s.lots}>
        <thead className={s.thead}>
          <tr>
            <th>
              Lots (<DayOrNight />)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Fortune (⊗)</td>
            <td>
              <input
                type="checkbox"
                checked={settings.objects?.lots?.fortune}
                onChange={handleFortuneLotVisibility}
              />
            </td>
          </tr>

          <tr>
            <td>Spirit (PS)</td>
            <td>
              <input
                type="checkbox"
                checked={settings.objects?.lots?.spirit}
                onChange={handleSpiritLotVisibility}
              />
            </td>
          </tr>
        </tbody>
      </table>

      {false && (
        <div className={s.theme}>
          <h3 className={s.thead}>Theme</h3>

          <div className={s.switch}>
            Light{' '}
            <input
              type="range"
              id="cowbell"
              name="cowbell"
              min="0"
              max="1"
              step="1"
            />{' '}
            Dark
          </div>
        </div>
      )}

      <div className={s.orb}>
        <h3 className={s.thead}>Orb for all planets</h3>

        <div className={s.aspectLine}>
          <input
            type="range"
            id="aspectLine"
            name="aspectLine"
            min="1"
            max="10"
            value={settings.interface.aspectOrb ?? 4}
            onChange={setOrb}
          />
          {settings.interface.aspectOrb}°
        </div>
      </div>

      <div className={s.houseSelector}>
        <select
          value={settings?.interface?.houseSystem ?? 'Placidus'}
          onChange={handleHouseSystemSelect}
        >
          <option value="placidus">Placidus</option>
          <option value="koch">Koch</option>
          <option value="campanus">Campanus</option>
          <option value="whole-sign">Whole-sign</option>
          <option value="equal-house">Equal-house</option>
          <option value="regiomontanus">Regiomontanus</option>
          <option value="topocentric">Topocentric</option>
        </select>

        <select
          value={settings?.interface?.startFrom ?? 'Aries'}
          onChange={handleCircleStartSelect}
        >
          <option value="Aries">0: Aries</option>
          <option value="Asc">0: Asc</option>
        </select>
      </div>
    </div>
  )
}

export default PlanetCheckboxTable

function DayOrNight() {
  const {
    horoscope: {_ascendant, CelestialBodies}
  } = useContext(CelestialContext)

  const dayBirth =
    _ascendant.ChartPosition.Ecliptic.DecimalDegrees -
    CelestialBodies.sun.ChartPosition.Ecliptic.DecimalDegrees

  return (
    <span className={s.daynight}>
      {dayBirth < 180 ? 'DAY BIRTH' : 'NIGHT BIRTH'}
    </span>
  )
}
