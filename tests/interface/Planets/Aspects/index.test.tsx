// @vitest-environment jsdom

import {render, screen, cleanup, within} from '@testing-library/react'
import {afterEach, describe, expect, test} from 'vitest'
import Aspects from '../../../../src/interface/Planets/Aspects/index'
import {CelestialContext} from '../../../../src/CelestialContext'
import {SettingContext} from '../../../../src/SettingContext'

const makeBodies = (positions: Record<string, number>) =>
  Object.entries(positions).map(([label, d]) => ({
    label,
    ChartPosition: {Ecliptic: {DecimalDegrees: d}}
  }))

const celestial = {
  horoscope: {CelestialBodies: {all: makeBodies({Sun: 0, Moon: 100})}},
  transitHoroscope: {
    CelestialBodies: {all: makeBodies({Mars: 90, Jupiter: 0.5})}
  },
  progressedHoroscope: {CelestialBodies: {all: []}}
}

const renderAspects = (objects: any) =>
  render(
    <SettingContext.Provider
      value={{
        settings: {
          objects,
          interface: {},
          chartType: 'transit'
        }
      } as any}
    >
      <CelestialContext.Provider value={celestial as any}>
        <Aspects />
      </CelestialContext.Provider>
    </SettingContext.Provider>
  )

afterEach(cleanup)

describe('Planets Aspects', () => {
  test('falls back to the natal visibility when transit is unset', () => {
    renderAspects({
      planets: {Sun: true, Moon: true, Mars: true, Jupiter: true}
    })
    // Sun transit conjunct natal Sun (Jupiter 0.5° from Sun 0°)
    const conjRow = screen.getByText('☌').closest('li')!
    expect(within(conjRow).getByText(/☉/)).toBeTruthy()
    expect(within(conjRow).getByText(/♃/)).toBeTruthy()
    // Sun transit aspect with Mars (90°)
    const negRow = screen.getByText('90').closest('li')!
    expect(within(negRow).getByText(/☉/)).toBeTruthy()
    expect(within(negRow).getByText(/♂/)).toBeTruthy()
  })

  test('hides transit aspects to a transit hidden planet', () => {
    renderAspects({
      planets: {Sun: true, Moon: true, Mars: true, Jupiter: true},
      transitPlanets: {Sun: true, Moon: true, Mars: false, Jupiter: true}
    })
    expect(screen.getByText('☌')).toBeTruthy()
    expect(screen.queryByText('90')).toBeNull()
    expect(screen.queryByText(/♂/)).toBeNull()
  })
})
