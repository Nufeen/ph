import {useContext, useEffect, useState} from 'react'
import {SettingContext} from '../../SettingContext.js'

import defaultSettings from '../../defaultSettings.json'

import s from './index.module.css'

const LS = window.localStorage

const ColorSelectors = () => {
  const {settings, setSettings} = useContext(SettingContext)

  const [colors, setColors] = useState({})

  useEffect(() => {
    const defaultColors = Object.fromEntries(
      Object.keys(settings.colors || defaultSettings.colors).map(
        name => [
          name,
          getComputedStyle(
            document.documentElement
          ).getPropertyValue(`--${name}`)
        ]
      )
    )
    setColors(defaultColors)
  }, [])

  const handleColorChange = (e: {
    target: {name: any; value: any}
  }) => {
    const {name, value} = e.target

    const s = {
      ...settings,
      colors: {
        ...(settings.colors || defaultSettings.colors),
        [name]: value
      }
    }

    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))

    document.documentElement.style.setProperty(`--${name}`, value)
  }

  function handleReset() {
    const s = {...settings, colors: defaultSettings.colors}
    setSettings(s)
    LS.setItem('settings', JSON.stringify(s))

    for (const [name, value] of Object.entries(
      defaultSettings.colors
    )) {
      document.documentElement.style.setProperty(`--${name}`, value)
    }
  }

  return (
    <div className={s.wrapper}>
      {Object.entries(settings.colors || defaultSettings.colors).map(
        ([name, value]) => (
          <div key={name}>
            <label htmlFor={name}>{name}</label>
            <input
              type="color"
              id={name}
              name={name}
              value={value || colors[name] || ''}
              onChange={handleColorChange}
            />
          </div>
        )
      )}

      <button onClick={handleReset}>reset</button>
    </div>
  )
}

export default ColorSelectors
