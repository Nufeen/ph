// @vitest-environment jsdom

import {render, screen, fireEvent, cleanup} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, test} from 'vitest'
import {useState} from 'react'
import {CelestialContext} from '../../../src/CelestialContext'
import {SettingContext} from '../../../src/SettingContext'

/**
 * jsdom localStorage is shadowed by the Node built-in in this
 * environment, so a memory stub is installed before the Settings
 * module (which captures window.localStorage at import time).
 */
const store = new Map<string, string>()

const memoryStorage = {
  getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
  setItem: (key: string, value: string) => {
    store.set(key, String(value))
  },
  removeItem: (key: string) => {
    store.delete(key)
  },
  clear: () => store.clear(),
  key: (index: number) => Array.from(store.keys())[index] ?? null,
  get length() {
    return store.size
  }
}

Object.defineProperty(window, 'localStorage', {
  value: memoryStorage,
  configurable: true
})

const {default: Settings} = await import('../../../src/interface/Settings')

const celestialMock = {
  horoscope: {
    _ascendant: {
      ChartPosition: {Ecliptic: {DecimalDegrees: 100}}
    },
    CelestialBodies: {
      sun: {ChartPosition: {Ecliptic: {DecimalDegrees: 10}}}
    }
  }
}

const baseSettings = {
  objects: {planets: {}, celestialPoints: {}, lots: {}},
  interface: {
    planets: 'modern',
    elements: true,
    thirty: true,
    aspectOrb: 4,
    aspectAngles: true,
    planetAngles: true,
    houseSystem: 'placidus',
    startFrom: 'Aries',
    settings: 'sky'
  },
  colors: {},
  zodiacType: 'Tropical',
  chartType: 'natal'
}

const Harness = ({initial}: {initial: typeof baseSettings}) => {
  const [settings, setSettings] = useState(initial)
  return (
    <SettingContext.Provider value={{settings, setSettings}}>
      <CelestialContext.Provider value={celestialMock as any}>
        <Settings />
      </CelestialContext.Provider>
    </SettingContext.Provider>
  )
}

const renderSettings = (chartType = 'natal') =>
  render(<Harness initial={{...baseSettings, chartType}} />)

beforeEach(() => {
  store.clear()
})

afterEach(cleanup)

describe('Settings panel', () => {
  describe('non-graphic chart types', () => {
    test('shows orb, lots, elements, fixed stars, other and house system blocks', () => {
      renderSettings('natal')
      expect(screen.getByText('Orb for all planets')).toBeTruthy()
      expect(screen.getByText(/Lots/)).toBeTruthy()
      expect(screen.getByText('Elements')).toBeTruthy()
      expect(screen.getByText('Fixed stars')).toBeTruthy()
      expect(screen.getByText('Other')).toBeTruthy()
      expect(screen.getByText('Show 30°')).toBeTruthy()
      expect(screen.getByText('Placidus')).toBeTruthy()
      expect(screen.getByText('0: Asc')).toBeTruthy()
    })

    test('does not show the graphic chart type selector', () => {
      renderSettings('natal')
      expect(screen.queryByText('Graphic chart')).toBeNull()
      expect(screen.queryByText('Progressed')).toBeNull()
    })
  })

  describe('graphic chart type', () => {
    test('hides orb, lots, elements, fixed stars, other and house system blocks', () => {
      renderSettings('graphic')
      expect(screen.queryByText('Orb for all planets')).toBeNull()
      expect(screen.queryByText(/Lots/)).toBeNull()
      expect(screen.queryByText('Elements')).toBeNull()
      expect(screen.queryByText('Fixed stars')).toBeNull()
      expect(screen.queryByText('Other')).toBeNull()
      expect(screen.queryByText('Show 30°')).toBeNull()
      expect(screen.queryByText('Placidus')).toBeNull()
      expect(screen.queryByText('0: Asc')).toBeNull()
    })

    test('shows a graphic type selector with transit and progressed options', () => {
      renderSettings('graphic')
      expect(screen.getByText('Graphic chart')).toBeTruthy()
      expect(screen.getByText('Transit')).toBeTruthy()
      expect(screen.getByText('Progressed')).toBeTruthy()
    })

    test('defaults to transit when graphicType is not set', () => {
      const settings = {...baseSettings, chartType: 'graphic'}
      delete (settings as any).graphicType
      render(<Harness initial={settings} />)
      expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe(
        'transit'
      )
    })

    test('switching to progressed updates the selector and persists it', () => {
      renderSettings('graphic')
      fireEvent.change(screen.getByRole('combobox'), {
        target: {value: 'progressed'}
      })
      expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe(
        'progressed'
      )

      const stored = JSON.parse(store.get('settings') as string)
      expect(stored.graphicType).toBe('progressed')
    })
  })
})
