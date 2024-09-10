import React, {useContext} from 'react'
import {SettingContext} from '../SettingContext.js'
import s from './index.module.css'

import planets from '../assets/planets.json'

const LS = window.localStorage

const PlanetCheckboxTable = () => {
  const {settings, setSettings} = useContext(SettingContext)

  function handleVisibility(planet) {
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
          {Object.keys(planets).map((planet, index) => (
            <tr key={index}>
              <td>{planet}</td>
              <td>
                <input
                  type="checkbox"
                  checked={settings.objects.planets[planet]}
                  onChange={() => handleVisibility(planet)}
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
