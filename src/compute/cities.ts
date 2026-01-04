import {getCitiesByCountryCode} from 'country-city-location'

import ru from '../assets/ru.json'

import us from '../assets/us.json'

export default function deriveCitiesFrom(country) {
  let cities = (country && getCitiesByCountryCode(country)) ?? []

  let uniqueNames = new Set()

  if (country == 'RU') {
    cities = cities.reduce((acc, item) => {
      if (!uniqueNames.has(item.name) && ru.includes(item.name)) {
        uniqueNames.add(item.name)
        acc.push(item)
      }
      return acc
    }, [])
  } else if (country !== 'US') {
    cities = cities.reduce((acc, item) => {
      if (!uniqueNames.has(item.name)) {
        uniqueNames.add(item.name)
        acc.push(item)
      }
      return acc
    }, [])
  } else {
    cities = cities.reduce((acc, item) => {
      if (!uniqueNames.has(item.name) && us.includes(item.name)) {
        uniqueNames.add(item.name)
        acc.push(item)
      }
      return acc
    }, [])
  }

  return cities.sort((a, b) => {
    const aIsBig = biggest.includes(a.name)
    const bIsBig = biggest.includes(b.name)

    if (aIsBig && !bIsBig) return -1 // a comes first
    if (!aIsBig && bIsBig) return 1 // b comes first
    return a.name.localeCompare(b.name)
  })
}

const biggest = [
  'Moscow',
  'St. Petersburg',
  'New York',
  'Washington',
  'London',
  'Kiev',
  'Minsk',
  'Berlin',
  'Paris'
]
