import React, {useContext} from 'react'
import {SettingContext} from '../SettingContext.js'
import s from './index.module.css'

import planets from '../assets/planets.json'

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

  return (
    <div className={s.wrapper}>
      <table>
        <thead>
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

          <hr />

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
    </div>
  )
}

export default PlanetCheckboxTable
