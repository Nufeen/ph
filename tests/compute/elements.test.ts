import {test, expect} from 'vitest'
import reduceToElements from '../../src/compute/elements'

test('should return an object with the correct element counts', () => {
  const horoscope = {
    CelestialBodies: [
      {Sign: {key: 'aries'}},
      {Sign: {key: 'taurus'}},
      {Sign: {key: 'gemini'}},
      {Sign: {key: 'cancer'}},
      {Sign: {key: 'leo'}},
      {Sign: {key: 'virgo'}},
      {Sign: {key: 'libra'}},
      {Sign: {key: 'scorpio'}},
      {Sign: {key: 'sagittarius'}},
      {Sign: {key: 'capricorn'}},
      {Sign: {key: 'aquarius'}},
      {Sign: {key: 'pisces'}}
    ]
  }

  const result = reduceToElements(horoscope)

  expect(result).toEqual({
    fire: 3,
    earth: 3,
    air: 3,
    water: 3
  })
})

test('should return an empty object if the horoscope is empty', () => {
  const horoscope = {
    CelestialBodies: []
  }

  const result = reduceToElements(horoscope)

  expect(result).toEqual({})
})

test('should return an empty object if the CelestialBodies array is undefined', () => {
  const horoscope = {}

  const result = reduceToElements(horoscope)

  expect(result).toEqual({})
})
