// @vitest-environment jsdom

import {render, cleanup} from '@testing-library/react'
import {afterEach, describe, expect, test} from 'vitest'
import Aspects from '../../../../src/interface/Zodiac/Aspects/index'
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
          interface: {aspectOrb: 4, aspectAngles: false},
          chartType: 'transit'
        }
      } as any}
    >
      <CelestialContext.Provider value={celestial as any}>
        <Aspects zero={0} x0={150} y0={150} />
      </CelestialContext.Provider>
    </SettingContext.Provider>
  )

afterEach(cleanup)

describe('Zodiac Aspects', () => {
  test('falls back to the natal visibility when transit is unset', () => {
    const {container} = renderAspects({
      planets: {Sun: true, Moon: true, Mars: true, Jupiter: true}
    })
    // natal Sun transit aspect with Mars at 90°
    expect(container.querySelectorAll('line[data-d="90"]')).toHaveLength(1)
  })

  test('hides transit aspects to a transit hidden planet', () => {
    const {container} = renderAspects({
      planets: {Sun: true, Moon: true, Mars: true, Jupiter: true},
      transitPlanets: {Sun: true, Moon: true, Mars: false, Jupiter: true}
    })
    expect(container.querySelectorAll('line[data-d="90"]')).toHaveLength(0)
    expect(container.querySelectorAll('line')).toHaveLength(0)
  })
})
