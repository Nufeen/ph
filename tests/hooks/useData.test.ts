// @vitest-environment jsdom

import {renderHook, act} from '@testing-library/react'
import {test, expect} from 'vitest'
import useData from '../../src/hooks/useData'

test('should return the correct initial state', () => {
  const {result} = renderHook(() => useData())

  expect(result.current.natalData.city).toBe(null)
  expect(result.current.natalData.tz).toBe('')
  expect(result.current.natalData.country).toBe(null)
  expect(result.current.natalData.date).toBeInstanceOf(Date)

  expect(result.current.transitData.city).toBe(null)
  expect(result.current.transitData.tz).toBe('')
  expect(result.current.transitData.country).toBe(null)
  expect(result.current.transitData.date).toBeInstanceOf(Date)
})

test('should update the state when the setNatalData function is called', () => {
  const {result} = renderHook(() => useData())

  act(() => {
    result.current.setNatalData({
      city: 'New York',
      tz: 'America/New_York',
      country: 'USA',
      date: new Date()
    })
  })

  expect(result.current.natalData.city).toBe('New York')
  expect(result.current.natalData.tz).toBe('America/New_York')
  expect(result.current.natalData.country).toBe('USA')
  expect(result.current.natalData.date).toBeInstanceOf(Date)
})

test('should update the state when the setTransitData function is called', () => {
  const {result} = renderHook(() => useData())

  act(() => {
    result.current.setTransitData({
      city: 'London',
      tz: 'Europe/London',
      country: 'UK',
      date: new Date()
    })
  })

  expect(result.current.transitData.city).toBe('London')
  expect(result.current.transitData.tz).toBe('Europe/London')
  expect(result.current.transitData.country).toBe('UK')
  expect(result.current.transitData.date).toBeInstanceOf(Date)
})
