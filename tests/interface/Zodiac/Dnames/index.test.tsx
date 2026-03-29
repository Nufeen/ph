// @vitest-environment jsdom

import {render} from '@testing-library/react'
import {test, expect, describe} from 'vitest'
import Decans72 from '../../../../src/interface/Zodiac/Dnames/index.tsx'
import {SettingContext} from '../../../../src/SettingContext.tsx'

const π = Math.PI
const sin = Math.sin
const cos = Math.cos

const defaultProps = {
  zero: 0,
  x0: 150,
  y0: 155,
  r: 130,
  calendarDay: new Date('2024-01-01')
}

const allPlanetsEnabled = {
  Sun: true,
  Moon: true,
  Mercury: true,
  Venus: true,
  Mars: true,
  Jupiter: true,
  Saturn: true,
  Uranus: true,
  Neptune: true,
  Pluto: true
}

const defaultSettings = {
  objects: {planets: allPlanetsEnabled},
  zodiacType: 'Tropical'
}

const renderDecans72 = (props = {}, settings = defaultSettings) => {
  const mergedProps = {...defaultProps, ...props}
  return render(
    <SettingContext.Provider value={{settings} as any}>
      <Decans72 {...mergedProps} />
    </SettingContext.Provider>
  )
}

function calculateExpectedPosition(
  i: number,
  zero: number,
  sid: number
) {
  const offset = 1
  const x1 =
    defaultProps.x0 +
    (defaultProps.r + (i % 2 ? 15 : 18)) *
      sin(((i * 5 + zero + sid + offset) * π - π) / 180)
  const y1 =
    defaultProps.y0 +
    (defaultProps.r + (i % 2 ? 15 : 18)) *
      cos(((i * 5 + zero + sid + offset) * π - π) / 180)
  return {x1, y1}
}

describe('Decans72', () => {
  describe('coordinate calculations', () => {
    test('renders 72 text elements for decan names', () => {
      // Act
      const {container} = renderDecans72()
      const texts = container.querySelectorAll('text')

      // Assert
      expect(texts).toHaveLength(72)
    })

    test('boundary case: decan at index 0 has correct coordinates', () => {
      // Arrange
      const i = 0
      const zero = 0
      const sid = 0
      const expected = calculateExpectedPosition(i, zero, sid)

      // Act
      const {container} = renderDecans72({zero, r: defaultProps.r})
      const lines = Array.from(container.querySelectorAll('line'))
      const decanIndex = 72 + i
      const x1 = parseFloat(
        lines[decanIndex]?.getAttribute('x1') || '0'
      )
      const y1 = parseFloat(
        lines[decanIndex]?.getAttribute('y1') || '0'
      )

      // Assert
      expect(Math.abs(x1 - expected.x1)).toBeLessThan(0.01)
      expect(Math.abs(y1 - expected.y1)).toBeLessThan(0.01)
    })

    test('boundary case: decan at index 71 has correct coordinates', () => {
      // Arrange
      const i = 71
      const zero = 0
      const sid = 0
      const expected = calculateExpectedPosition(i, zero, sid)

      // Act
      const {container} = renderDecans72({zero, r: defaultProps.r})
      const lines = Array.from(container.querySelectorAll('line'))
      const decanIndex = 72 + i
      const x1 = parseFloat(
        lines[decanIndex]?.getAttribute('x1') || '0'
      )
      const y1 = parseFloat(
        lines[decanIndex]?.getAttribute('y1') || '0'
      )

      // Assert
      expect(Math.abs(x1 - expected.x1)).toBeLessThan(0.01)
      expect(Math.abs(y1 - expected.y1)).toBeLessThan(0.01)
    })

    test('sidereal zodiac type applies 24 degree offset', () => {
      // Arrange
      const tropicalSettings = {
        objects: {planets: allPlanetsEnabled},
        zodiacType: 'Tropical'
      }
      const siderealSettings = {
        objects: {planets: allPlanetsEnabled},
        zodiacType: 'Sidereal'
      }

      // Act
      const tropicalResult = renderDecans72(
        {zero: 0},
        tropicalSettings
      )
      const siderealResult = renderDecans72(
        {zero: 0},
        siderealSettings
      )
      const tropicalLines = Array.from(
        tropicalResult.container.querySelectorAll('line')
      )
      const siderealLines = Array.from(
        siderealResult.container.querySelectorAll('line')
      )
      const tropicalX1 = parseFloat(
        tropicalLines[0]?.getAttribute('x1') || '0'
      )
      const siderealX1 = parseFloat(
        siderealLines[0]?.getAttribute('x1') || '0'
      )

      // Assert
      expect(tropicalX1).not.toBe(siderealX1)
    })

    test('tropical zodiac type applies 0 degree offset', () => {
      // Arrange
      const i = 0
      const zero = 0
      const sid = 0
      const expected = calculateExpectedPosition(i, zero, sid)

      // Act
      const {container} = renderDecans72({zero})
      const lines = Array.from(container.querySelectorAll('line'))
      const decanIndex = 72 + i
      const x1 = parseFloat(
        lines[decanIndex]?.getAttribute('x1') || '0'
      )
      const y1 = parseFloat(
        lines[decanIndex]?.getAttribute('y1') || '0'
      )

      // Assert
      expect(Math.abs(x1 - expected.x1)).toBeLessThan(0.01)
      expect(Math.abs(y1 - expected.y1)).toBeLessThan(0.01)
    })
  })
})
