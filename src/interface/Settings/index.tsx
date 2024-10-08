import React, {useContext} from 'react'
import {SettingContext} from '../../SettingContext.js'
import s from './index.module.css'

import planets from '../../assets/planets.json'

const LS = window.localStorage

const PlanetCheckboxTable = () => {
  const {settings, setSettings} = useContext(SettingContext)

  function handlePlanetVisibility(planet) {
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

  function handlePointVisibility(point) {
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

  function handleStarsVisibility(loc) {
    const s = {
      ...settings,
      objects: {
        ...settings.objects,
        celestialPoints: {
          ...(settings.objects?.celestialPoints || {}),
          fixedStars: {
            ...(settings.objects?.celestialPoints?.fixedStars || {}),
            ...settings.objects.celestialPoints?.fixedStars,
            [loc]: !settings.objects.celestialPoints?.fixedStars?.[loc]
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

  function handleHouseSystemSelect(e) {
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
              <td>{planet}</td>
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
                checked={settings.objects.celestialPoints?.fixedStars?.chart}
                onChange={() => handleStarsVisibility('chart')}
              />
            </td>
          </tr>
          <tr>
            <td>Table</td>
            <td>
              <input
                type="checkbox"
                checked={settings.objects.celestialPoints?.fixedStars?.table}
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

      <table className={s.orb}>
        <thead className={s.thead}>
          <tr>
            <th>Orb multiplier</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={s.aspectLine}>
              <input
                type="range"
                id="aspectLine"
                name="aspectLine"
                min="1"
                max="8"
                value={settings.interface.aspectOrb ?? 4}
                onChange={e => {
                  const s = {
                    ...settings,
                    interface: {
                      ...settings.interface,
                      aspectOrb: +e.target.value
                    }
                  }
                  setSettings(s)

                  LS.setItem('settings', JSON.stringify(s))
                }}
              />
              {(100 * (settings.interface.aspectOrb ?? 4)) / 4}%
            </td>
          </tr>
        </tbody>
      </table>

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
      </div>
    </div>
  )
}

export default PlanetCheckboxTable
