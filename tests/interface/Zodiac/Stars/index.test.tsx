// @vitest-environment jsdom

import {render} from '@testing-library/react'
import {test, expect, describe} from 'vitest'
import Stars from '../../../../src/interface/Zodiac/Stars/index.tsx'
import {CelestialContext} from '../../../../src/CelestialContext.tsx'
import {SettingContext} from '../../../../src/SettingContext.tsx'

const createStar = (name: string, elon: number) => ({
  name,
  elon,
  size: '\u03b1'
})

const defaultProps = {
  calendarDay: new Date('2024-01-01'),
  zero: 0,
  x0: 150,
  y0: 155
}

const defaultCelestial = {
  stars: {
    Sun: [createStar('Regulus', 152.3)],
    Moon: [createStar('Spica', 201.2)]
  },
  transitStars: {},
  progressedStars: {},
  fictivePointsStars: {}
}

const defaultSettings = {
  chartType: 'natal',
  interface: {},
  objects: {},
  colors: {},
  zodiacType: 'Tropical'
}

const renderStars = (
  celestial = defaultCelestial,
  settings = defaultSettings
) =>
  render(
    <SettingContext.Provider value={{settings} as any}>
      <CelestialContext.Provider value={celestial as any}>
        <Stars {...defaultProps} />
      </CelestialContext.Provider>
    </SettingContext.Provider>
  )

const getStarNames = (container: Element) =>
  Array.from(container.querySelectorAll('[data-star]')).map(
    el => el.getAttribute('data-star')
  )

const getStarLabels = (container: Element) =>
  Array.from(container.querySelectorAll('text')).map(
    t => t.textContent
  )

const getPosition = (container: Element, name: string) => {
  const el = container.querySelector(`[data-star="${name}"]`)
  if (!el) return null
  return {
    cx: parseFloat(el.getAttribute('cx') || '0'),
    cy: parseFloat(el.getAttribute('cy') || '0')
  }
}

describe('Stars', () => {
  describe('rendering', () => {
    test('renders circles for each star', () => {
      const {container} = renderStars()
      expect(container.querySelectorAll('circle')).toHaveLength(2)
    })

    test('renders text labels for each star', () => {
      const {container} = renderStars()
      expect(container.querySelectorAll('text')).toHaveLength(2)
      expect(getStarLabels(container)).toEqual([
        'Regulus',
        'Spica'
      ])
    })

    test('each circle has data-star attribute', () => {
      const {container} = renderStars()
      expect(getStarNames(container)).toEqual([
        'Regulus',
        'Spica'
      ])
    })
  })

  describe('uniqueness', () => {
    test('deduplicates stars with same name from different sources', () => {
      const celestial = {
        ...defaultCelestial,
        fictivePointsStars: {
          lilith: [createStar('Regulus', 152.3)]
        }
      }
      const {container} = renderStars(celestial)
      expect(container.querySelectorAll('circle')).toHaveLength(2)
      expect(getStarLabels(container)).toEqual([
        'Regulus',
        'Spica'
      ])
    })

    test('keeps first occurrence when same star appears from multiple planets', () => {
      const star = createStar('Algol', 45.6)
      const celestial = {
        stars: {Sun: [star]},
        transitStars: {},
        progressedStars: {},
        fictivePointsStars: {lilith: [createStar('Algol', 99.9)]}
      }
      const {container} = renderStars(celestial)
      const labels = getStarLabels(container)
      expect(labels.filter(l => l === 'Algol')).toHaveLength(1)
    })

    test('handles many duplicate stars across all source types', () => {
      const star = createStar('Sirius', 100.5)
      const celestial = {
        stars: {Sun: [star]},
        transitStars: {Mercury: [star]},
        progressedStars: {Mars: [star]},
        fictivePointsStars: {lilith: [star]}
      }
      const {container} = renderStars(celestial, {
        ...defaultSettings,
        chartType: 'transit'
      })
      expect(container.querySelectorAll('circle')).toHaveLength(1)
    })
  })

  describe('precession adjustment', () => {
    test('applies precession correction based on year', () => {
      const {container} = renderStars()
      const pos = getPosition(container, 'Regulus')
      expect(pos).not.toBeNull()
      const year = defaultProps.calendarDay.getFullYear()
      const delta = 2000 - year
      const adjustedElon = 152.3 - (1 / 72) * delta
      const {sin, cos} = Math
      const \u03c0 = Math.PI
      const expectedCx =
        150 + 144 * sin(((adjustedElon + 0) * \u03c0) / 180)
      const expectedCy =
        155 + 144 * cos(((adjustedElon + 0) * \u03c0) / 180)
      expect(pos!.cx).toBeCloseTo(expectedCx, 5)
      expect(pos!.cy).toBeCloseTo(expectedCy, 5)
    })
  })

  describe('conditional star sources', () => {
    test('includes transitStars when chartType is transit', () => {
      const celestial = {
        ...defaultCelestial,
        transitStars: {
          Mercury: [createStar('Aldebaran', 67.8)]
        }
      }
      const {container} = renderStars(celestial, {
        ...defaultSettings,
        chartType: 'transit'
      })
      expect(getStarLabels(container)).toContain('Aldebaran')
    })

    test('excludes transitStars when chartType is natal', () => {
      const celestial = {
        ...defaultCelestial,
        transitStars: {
          Mercury: [createStar('Aldebaran', 67.8)]
        }
      }
      const {container} = renderStars(celestial)
      expect(getStarLabels(container)).not.toContain('Aldebaran')
    })

    test('includes progressedStars when chartType is progressed', () => {
      const celestial = {
        ...defaultCelestial,
        progressedStars: {
          Venus: [createStar('Capella', 79.5)]
        }
      }
      const {container} = renderStars(celestial, {
        ...defaultSettings,
        chartType: 'progressed'
      })
      expect(getStarLabels(container)).toContain('Capella')
    })

    test('excludes progressedStars when chartType is natal', () => {
      const celestial = {
        ...defaultCelestial,
        progressedStars: {
          Venus: [createStar('Capella', 79.5)]
        }
      }
      const {container} = renderStars(celestial)
      expect(getStarLabels(container)).not.toContain('Capella')
    })
  })

  describe('fictive points stars', () => {
    test('includes fictivePointsStars alongside regular stars', () => {
      const celestial = {
        ...defaultCelestial,
        fictivePointsStars: {
          lilith: [createStar('Procyon', 114.3)],
          northnode: [createStar('Pollux', 113.2)]
        }
      }
      const {container} = renderStars(celestial)
      expect(getStarLabels(container)).toContain('Procyon')
      expect(getStarLabels(container)).toContain('Pollux')
    })
  })

  describe('edge cases', () => {
    test('renders nothing when all star data is empty', () => {
      const celestial = {
        stars: {},
        transitStars: {},
        progressedStars: {},
        fictivePointsStars: {}
      }
      const {container} = renderStars(celestial)
      expect(container.querySelectorAll('circle')).toHaveLength(0)
      expect(container.querySelectorAll('text')).toHaveLength(0)
    })

    test('handles empty arrays from findStar gracefully', () => {
      const celestial = {
        ...defaultCelestial,
        stars: {Sun: [], Moon: []}
      }
      const {container} = renderStars(celestial)
      expect(container.querySelectorAll('circle')).toHaveLength(0)
    })
  })
})
