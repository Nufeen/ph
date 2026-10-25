// @vitest-environment jsdom

import {render, screen, cleanup} from '@testing-library/react'
import {afterEach, describe, expect, test} from 'vitest'
import ThirtyDegrees from '../../../../src/interface/Planets/ThirtyDegrees/index'
import {CelestialContext} from '../../../../src/CelestialContext'
import {SettingContext} from '../../../../src/SettingContext'

const makeBodies = (positions: Record<string, number>) =>
  Object.fromEntries(
    Object.entries(positions).map(([label, d]) => [
      label,
      {label, ChartPosition: {Ecliptic: {DecimalDegrees: d}}}
    ])
  )

const celestial = {
  horoscope: {
    CelestialBodies: makeBodies({Sun: 0, Moon: 100})
  },
  transitHoroscope: {
    CelestialBodies: makeBodies({Mars: 90, Jupiter: 0.5})
  },
  progressedHoroscope: {CelestialBodies: {}}
}

const renderThirtyDegrees = (objects: any) =>
  render(
    <SettingContext.Provider
      value={{
        settings: {objects, interface: {}, chartType: 'transit'}
      } as any}
    >
      <CelestialContext.Provider value={celestial as any}>
        <ThirtyDegrees />
      </CelestialContext.Provider>
    </SettingContext.Provider>
  )

afterEach(cleanup)

describe('ThirtyDegrees', () => {
  test('falls back to the natal visibility when transit is unset', () => {
    renderThirtyDegrees({
      planets: {Sun: true, Moon: true, Mars: true, Jupiter: true}
    })
    // natal rows: Sun and Moon; transit rows: Mars and Jupiter
    expect(screen.getAllByText(/☉/)).toHaveLength(1)
    expect(screen.getAllByText(/☽/)).toHaveLength(1)
    expect(screen.getAllByText(/♂/)).toHaveLength(1)
    expect(screen.getAllByText(/♃/)).toHaveLength(1)
  })

  test('hides a transit hidden planet but keeps natal rows', () => {
    renderThirtyDegrees({
      planets: {Sun: true, Moon: true, Mars: true, Jupiter: true},
      transitPlanets: {Sun: true, Moon: true, Mars: false, Jupiter: true}
    })
    expect(screen.queryByText(/♂/)).toBeNull()
    expect(screen.getAllByText(/♃/)).toHaveLength(1)
    // natal rows are unaffected
    expect(screen.getAllByText(/☉/)).toHaveLength(1)
    expect(screen.getAllByText(/☽/)).toHaveLength(1)
  })
})
