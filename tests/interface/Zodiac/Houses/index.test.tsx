// @vitest-environment jsdom

import {render} from '@testing-library/react'
import {test, expect, describe} from 'vitest'
import Houses from '../../../../src/interface/Zodiac/Houses/index.tsx'
import {CelestialContext} from '../../../../src/CelestialContext.tsx'
import {SettingContext} from '../../../../src/SettingContext.tsx'

const createMockHouse = (degree = 0) => ({
  ChartPosition: {
    StartPosition: {Ecliptic: {DecimalDegrees: degree}}
  }
})

const createMockHouses = (degrees: number[] = []) =>
  Array.from({length: 12}, (_, i) =>
    createMockHouse(degrees[i] ?? i * 30)
  )

const createMockHoroscope = (houses = createMockHouses()) => ({
  Houses: houses,
  CelestialBodies: {
    moon: {ChartPosition: {Ecliptic: {DecimalDegrees: 45}}}
  }
})

const defaultSettings = {interface: {houseSystem: 'placidus'}}

const getDegrees = (container: Element) =>
  Array.from(container.querySelectorAll('text')).map(
    t =>
      // @ts-ignore
      +t.querySelector('tspan')?.textContent?.replace('°', '')
  )

const defaultLatlng = {
  natal: {lat: 40.7128, lng: -74.006},
  transit: {lat: 51.5074, lng: -0.1278}
}

const renderHouses = (
  chartType: string,
  options: Record<string, any> = {}
) => {
  const {
    celestial = {
      horoscope: createMockHoroscope(),
      transitHoroscope: createMockHoroscope(),
      chart: defaultLatlng
    },
    settings = defaultSettings
  } = options
  return render(
    <SettingContext.Provider value={{settings} as any}>
      <CelestialContext.Provider value={celestial as any}>
        <Houses zero={0} x0={0} y0={0} chartType={chartType} />
      </CelestialContext.Provider>
    </SettingContext.Provider>
  )
}

describe('Houses', () => {
  test('returns null when lat/lng are falsy', () => {
    // Arrange
    const celestial = {
      horoscope: createMockHoroscope(),
      transitHoroscope: createMockHoroscope(),
      chart: {natal: {lat: 0, lng: 0}, transit: {lat: 0, lng: 0}}
    }

    // Act
    const {container} = renderHouses('natal', {celestial})

    // Assert
    expect(container.firstChild).toBeNull()
  })

  test('uses natal horoscope for natal chartType', () => {
    // Arrange
    const natalDegrees = [
      10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120
    ]
    const natalHouses = createMockHouses(natalDegrees)
    const celestial = {
      horoscope: createMockHoroscope(natalHouses),
      transitHoroscope: createMockHoroscope(),
      chart: defaultLatlng
    }

    // Act
    const {container} = renderHouses('natal', {celestial})
    const lines = container.querySelectorAll('line')
    const texts = container.querySelectorAll('text')

    // Assert
    expect(lines).toHaveLength(12)
    expect(texts).toHaveLength(12)
    expect(getDegrees(container)).toEqual(
      natalDegrees.map(d => d % 30)
    )
  })

  test('uses transit horoscope for transit chartType', () => {
    // Arrange
    const transitDegrees = [
      15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125
    ]
    const transitHouses = createMockHouses(transitDegrees)
    const celestial = {
      horoscope: createMockHoroscope(),
      transitHoroscope: createMockHoroscope(transitHouses),
      chart: defaultLatlng
    }
    // Act
    const {container} = renderHouses('transit', {celestial})
    const lines = container.querySelectorAll('line')
    const texts = container.querySelectorAll('text')
    // Assert
    expect(lines).toHaveLength(12)
    expect(texts).toHaveLength(12)
    expect(getDegrees(container)).toEqual(
      transitDegrees.map(d => d % 30)
    )
  })

  test('uses moon degrees when houseSystem is moonchart', () => {
    // Arrange
    const celestial = {
      horoscope: createMockHoroscope(),
      transitHoroscope: createMockHoroscope(),
      chart: defaultLatlng
    }
    const settings = {interface: {houseSystem: 'moonchart'}}

    // Act
    const {container} = renderHouses('natal', {celestial, settings})
    const lines = container.querySelectorAll('line')
    const texts = container.querySelectorAll('text')

    // Assert
    expect(lines).toHaveLength(12)
    expect(texts).toHaveLength(12)
    // They SHOULD be the same in moonchart, thats right
    expect(getDegrees(container)).toEqual(Array(12).fill(45 % 30))
  })
})
