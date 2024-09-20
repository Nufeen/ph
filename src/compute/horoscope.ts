import {Origin, Horoscope} from 'circular-natal-horoscope-js/dist/index.js'

export default function getHoroscope(
  calendarDay: Date,
  latitude: number,
  longitude: number,
  houseSystem
) {
  const year = calendarDay.getFullYear()
  const month = calendarDay.getMonth()
  const date = calendarDay.getDate()
  const hour = calendarDay.getHours()
  const minute = calendarDay.getMinutes()

  const origin = new Origin({
    year,
    month, // 0 = January, 11 = December!
    date,
    hour,
    minute,
    latitude,
    longitude
  })

  const horoscope = new Horoscope({
    origin: origin,
    houseSystem: houseSystem ?? 'placidus',
    zodiac: 'tropical',
    aspectPoints: ['bodies', 'points', 'angles'],
    aspectWithPoints: ['bodies', 'points', 'angles'],
    aspectTypes: ['major', 'minor'],
    customOrbs: {},
    language: 'en'
  })

  return horoscope
}
