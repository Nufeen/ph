import {test, expect} from 'vitest'
import {
  Origin,
  Horoscope
} from 'circular-natal-horoscope-js/dist/index.js'

import getHoroscope from '../../src/compute/horoscope'

test('should return a Horoscope object with the correct properties', () => {
  const calendarDay = new Date('2022-01-01T12:00:00Z')
  const latitude = 40.7128
  const longitude = -74.006
  const houseSystem = 'placidus'

  const horoscope = getHoroscope(
    calendarDay,
    latitude,
    longitude,
    houseSystem
  )

  expect(horoscope).toBeInstanceOf(Horoscope)
  expect(horoscope.origin).toBeInstanceOf(Origin)
  expect(horoscope.origin.year).toBe(2022)
  expect(horoscope.origin.month).toBe(0)
  expect(horoscope.origin.date).toBe(1)

  expect(horoscope.origin.minute).toBe(0)
  expect(horoscope.origin.latitude).toBe(latitude)
  expect(horoscope.origin.longitude).toBe(longitude)
})

test('should use the default houseSystem if none is provided', () => {
  const calendarDay = new Date('2022-01-01T12:00:00Z')
  const latitude = 40.7128
  const longitude = -74.006

  const horoscope = getHoroscope(calendarDay, latitude, longitude)

  expect(horoscope._houseSystem).toBe('placidus')
})
