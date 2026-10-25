// @vitest-environment jsdom

import {render, screen, fireEvent, cleanup, within} from '@testing-library/react'
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
  },
  natalData: {date: new Date(1999, 5, 15)},
  transitData: {date: new Date(2024, 6, 1, 12)}
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

const Harness = ({initial}: {initial: any}) => {
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

const graphicSelects = () =>
  Array.from(
    screen
      .getByText('Graphic chart')
      .closest('div')!.querySelectorAll('select')
  ) as HTMLSelectElement[]

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
      const options = Array.from(graphicSelects()[0].options).map(
        o => o.textContent
      )
      expect(options).toEqual(['Transit', 'Progressed'])
    })

    test('defaults to transit when graphicType is not set', () => {
      const settings = {...baseSettings, chartType: 'graphic'}
      delete (settings as any).graphicType
      render(<Harness initial={settings} />)
      expect(graphicSelects()[0].value).toBe('transit')
    })

    test('switching to progressed updates the selector and persists it', () => {
      renderSettings('graphic')
      fireEvent.change(graphicSelects()[0], {
        target: {value: 'progressed'}
      })
      expect(graphicSelects()[0].value).toBe('progressed')

      const stored = JSON.parse(store.get('settings') as string)
      expect(stored.graphicType).toBe('progressed')
    })
  })

  describe('graphic years span', () => {
    test('shows a years selector defaulting to 1 year', () => {
      renderSettings('graphic')
      const years = graphicSelects()[1]
      expect(years.value).toBe('1')
      const options = Array.from(years.options).map(o => o.textContent)
      expect(options).toEqual(['1 year', '10 years', '30 years', '100 years'])
    })

    test('defaults to 1 year when graphicYears is not set', () => {
      const settings = {...baseSettings, chartType: 'graphic'}
      delete (settings as any).graphicYears
      render(<Harness initial={settings} />)
      expect(graphicSelects()[1].value).toBe('1')
    })

    test('switching the span updates the selector and persists it', () => {
      renderSettings('graphic')
      fireEvent.change(graphicSelects()[1], {
        target: {value: '30'}
      })
      expect(graphicSelects()[1].value).toBe('30')

      const stored = JSON.parse(store.get('settings') as string)
      expect(stored.graphicYears).toBe(30)
    })

    test('does not show the years selector outside graphic mode', () => {
      renderSettings('natal')
      expect(screen.queryByText('100 years')).toBeNull()
    })
  })

  describe('graphic modulo', () => {
    test('shows a modulo selector defaulting to 360°', () => {
      renderSettings('graphic')
      expect(screen.getByText('Modulo')).toBeTruthy()
      const modulo = graphicSelects()[2]
      expect(modulo.value).toBe('360')
      const options = Array.from(modulo.options).map(o => o.textContent)
      expect(options).toEqual(['360°', '90°', '30°'])
    })

    test('defaults to 360 when graphicModulo is not set', () => {
      const settings = {...baseSettings, chartType: 'graphic'}
      delete (settings as any).graphicModulo
      render(<Harness initial={settings} />)
      expect(graphicSelects()[2].value).toBe('360')
    })

    test('switching the modulo updates the selector and persists it', () => {
      renderSettings('graphic')
      fireEvent.change(graphicSelects()[2], {
        target: {value: '90'}
      })
      expect(graphicSelects()[2].value).toBe('90')

      const stored = JSON.parse(store.get('settings') as string)
      expect(stored.graphicModulo).toBe(90)
    })

    test('does not show the modulo selector outside graphic mode', () => {
      renderSettings('natal')
      expect(screen.queryByText('Modulo')).toBeNull()
    })
  })

  describe('graphic start year', () => {
    const startYear = () => screen.getByRole('spinbutton') as HTMLInputElement

    const renderGraphic = (overrides = {}) =>
      render(
        <Harness
          initial={{...baseSettings, chartType: 'graphic', ...overrides}}
        />
      )

    test('defaults to the current year for 1 year span', () => {
      renderGraphic()
      expect(startYear().value).toBe('2024')
    })

    test('defaults to the decade for 10 years span', () => {
      renderGraphic({graphicYears: 10})
      expect(startYear().value).toBe('2020')
    })

    test('defaults to the birth year for 30 years span', () => {
      renderGraphic({graphicYears: 30})
      expect(startYear().value).toBe('1999')
    })

    test('defaults to the century for 100 years span', () => {
      renderGraphic({graphicYears: 100})
      expect(startYear().value).toBe('2000')
    })

    test('changing the start year persists it', () => {
      renderGraphic()
      fireEvent.change(startYear(), {target: {value: '2015'}})
      expect(startYear().value).toBe('2015')

      const stored = JSON.parse(store.get('settings') as string)
      expect(stored.graphicStartYear).toBe(2015)
    })

    test('clamps an out of range start year on blur', () => {
      renderGraphic({graphicStartYear: 20201})
      fireEvent.blur(startYear())
      expect(startYear().value).toBe('2999')

      const stored = JSON.parse(store.get('settings') as string)
      expect(stored.graphicStartYear).toBe(2999)
    })

    test('clearing the input falls back to the span default', () => {
      renderGraphic({graphicStartYear: 2015})
      fireEvent.change(startYear(), {target: {value: ''}})

      expect(startYear().value).toBe('2024')
      expect(JSON.parse(store.get('settings') as string).graphicStartYear).toBeUndefined()
    })

    test('does not show the start year outside graphic mode', () => {
      renderSettings('natal')
      expect(screen.queryByRole('spinbutton')).toBeNull()
    })
  })

  describe('planet visibility', () => {
    const sunRow = () => screen.getByText('☉').closest('tr')!

    test('renders natal and transit checkboxes for every planet', () => {
      renderSettings('natal')
      const moonRow = screen.getByText(/☽/).closest('tr')!
      expect(within(moonRow).getAllByRole('checkbox')).toHaveLength(2)
      expect(screen.getByText('Natal')).toBeTruthy()
      expect(screen.getByText('Transit')).toBeTruthy()
    })

    test('transit checkbox defaults to the natal visibility', () => {
      render(
        <Harness
          initial={{
            ...baseSettings,
            objects: {...baseSettings.objects, planets: {Sun: true}}
          }}
        />
      )
      const [natal, transit] = within(sunRow()).getAllByRole(
        'checkbox'
      ) as HTMLInputElement[]
      expect(natal.checked).toBe(true)
      expect(transit.checked).toBe(true)
    })

    test('toggling the transit checkbox persists it without touching natal', () => {
      renderSettings('graphic')
      fireEvent.click(within(sunRow()).getAllByRole('checkbox')[1])

      const stored = JSON.parse(store.get('settings') as string)
      expect(stored.objects.transitPlanets.Sun).toBe(true)
      expect(stored.objects.planets.Sun).toBeUndefined()
    })

    test('toggling the natal checkbox persists it without touching transit', () => {
      render(
        <Harness
          initial={{
            ...baseSettings,
            objects: {
              ...baseSettings.objects,
              planets: {Sun: true},
              transitPlanets: {Sun: true}
            }
          }}
        />
      )
      fireEvent.click(within(sunRow()).getAllByRole('checkbox')[0])

      const stored = JSON.parse(store.get('settings') as string)
      expect(stored.objects.planets.Sun).toBe(false)
      expect(stored.objects.transitPlanets.Sun).toBe(true)
    })
  })
})
