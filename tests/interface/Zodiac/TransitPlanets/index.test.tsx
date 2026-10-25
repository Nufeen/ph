// @vitest-environment jsdom

import {render, screen, cleanup} from '@testing-library/react'
import {afterEach, describe, expect, test} from 'vitest'
import TransitPlanets from '../../../../src/interface/Zodiac/TransitPlanets/index'
import {CelestialContext} from '../../../../src/CelestialContext'
import {SettingContext} from '../../../../src/SettingContext'

const celestial = {
  progressedHoroscope: {},
  transitHoroscope: {
    CelestialBodies: {
      all: [
        {
          label: 'Sun',
          ChartPosition: {Ecliptic: {DecimalDegrees: 10, ArcDegreesFormatted30: '10°'}}
        },
        {
          label: 'Moon',
          ChartPosition: {Ecliptic: {DecimalDegrees: 100, ArcDegreesFormatted30: '100°'}}
        }
      ]
    }
  }
}

const renderTransitPlanets = (objects: any) =>
  render(
    <SettingContext.Provider
      value={{
        settings: {objects, interface: {}, chartType: 'transit'}
      } as any}
    >
      <CelestialContext.Provider value={celestial as any}>
        <TransitPlanets zero={0} x0={150} y0={150} />
      </CelestialContext.Provider>
    </SettingContext.Provider>
  )

afterEach(cleanup)

describe('TransitPlanets', () => {
  test('uses the transit visibility when set', () => {
    const {container} = renderTransitPlanets({
      planets: {Sun: true, Moon: true},
      transitPlanets: {Sun: true, Moon: false}
    })
    // two circles per rendered planet
    expect(container.querySelectorAll('circle')).toHaveLength(2)
    expect(screen.getByText(/☉/)).toBeTruthy()
    expect(screen.queryByText(/☽/)).toBeNull()
  })

  test('falls back to the natal visibility when transit is unset', () => {
    const {container} = renderTransitPlanets({
      planets: {Sun: true, Moon: true}
    })
    expect(container.querySelectorAll('circle')).toHaveLength(4)
    expect(screen.getByText(/☉/)).toBeTruthy()
    expect(screen.getByText(/☽/)).toBeTruthy()
  })
})
