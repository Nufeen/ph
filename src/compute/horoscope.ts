import {
  Origin,
  Horoscope
} from 'circular-natal-horoscope-js/dist/index.js'

export default function getHoroscope(
  calendarDay: Date,
  latitude: number,
  longitude: number,
  houseSystem = 'placidus'
) {
  const origin = new Origin({
    year: calendarDay.getFullYear(),
    month: calendarDay.getMonth(),
    date: calendarDay.getDate(),
    hour: calendarDay.getHours(),
    minute: calendarDay.getMinutes(),
    latitude,
    longitude
  })

  return new Horoscope({
    origin,
    houseSystem:
      houseSystem == null || houseSystem === 'moonchart'
        ? 'placidus'
        : houseSystem,
    zodiac: 'tropical',
    aspectPoints: ['bodies', 'points', 'angles'],
    aspectWithPoints: ['bodies', 'points', 'angles'],
    aspectTypes: ['major', 'minor'],
    customOrbs: {},
    language: 'en'
  })
}
