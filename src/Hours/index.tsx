import React from 'react'
import {getSunrise, getSunset} from 'sunrise-sunset-js'
import {
  Body,
  Ecliptic,
  GeoVector,
  SearchMoonQuarter,
  NextMoonQuarter,
  SearchRiseSet,
  Observer
} from 'astronomy-engine'

import s from './index.module.css'

// https://en.wikipedia.org/wiki/Planetary_hours
import haldeanTable from '../assets/circle.json'
import planets from '../assets/planets.json'
import houses from '../assets/houses.json'

// https://en.wikipedia.org/wiki/Astrological_sign#Dignity_and_detriment,_exaltation_and_fall
import dignity from '../assets/dignity.json'
import detriment from '../assets/detriment.json'
import fall from '../assets/fall.json'
import exaltation from '../assets/exaltation.json'

const locale = 'ru-RU'

type Day = keyof typeof haldeanTable
type Planet = keyof typeof planets

type Props = {lat: number; lng: number; calendarDay: Date; today: Date}

export default function HourTable(props: Props) {
  const {lat, lng, calendarDay, today} = props

  const tomorrow = new Date(+today + 86400000)

  const weekday: Day = Object.keys(haldeanTable)[today.getDay()] as Day

  const sunrise = getSunrise(lat, lng, today)
  const sunset = getSunset(lat, lng, today)
  const nextSunrise = getSunrise(lat, lng, tomorrow)

  const t0 = sunrise.getTime()
  const t1 = sunset.getTime()
  const t2 = nextSunrise.getTime()

  const dayHourL = (t1 - t0) / 12
  const nightHourL = (t2 - t1) / 12

  const now = new Date().getTime()

  const dailyN = ~~((12 * (now - t0)) / (t1 - t0))
  const nightlyN = ~~((12 * (now - t1)) / (t2 - t1) + 12)
  const N = now < t1 ? dailyN : nightlyN

  const hourTableData = haldeanTable[weekday].map((planet, i) => ({
    current: i == N,
    n: i + 1,
    planet: planet as Planet,
    start: i < 12 ? t0 + i * dayHourL : t1 + (i - 12) * nightHourL,
    end: i < 12 ? t0 + (i + 1) * dayHourL : t1 + (i - 11) * nightHourL,
    moonday: moonday(
      i < 12 ? t0 + i * dayHourL : t1 + (i - 12) * nightHourL,
      lat,
      lng
    )
  }))

  return (
    <div className={s.wrap}>
      {hourTableData.map((d: HourProps) => (
        <Hour key={d.n} {...d} calendarDay={calendarDay} />
      ))}
    </div>
  )
}

type HourProps = {
  current: boolean
  n: number
  planet: Planet
  start: number
  end: number
  moonday: number
}

function Hour(d: HourProps & {calendarDay: Date}) {
  const H = house(d.planet, d.calendarDay)
  const sunHouse = house('Sun', d.calendarDay)

  return (
    <div key={d.n} className={s.hour} data-current={d.current}>
      <div>{d.n}</div>
      <time>{new Date(d.start).toLocaleTimeString(locale)}</time>
      <time>{new Date(d.end).toLocaleTimeString(locale)}</time>
      <div
        className={s.sign}
        data-planet={d.planet}
        data-divine={dignity[sunHouse - 1] == d.planet}
      >
        {planets[d.planet]}
        {d.planet == 'Moon' && (
          <sup data-day={d.moonday} className={s.moonday}>
            {d.moonday}
          </sup>
        )}
      </div>
      <div
        className={s.house}
        data-house={H}
        data-at-home={dignity[H - 1] == d.planet}
        data-decline={detriment[H - 1] == d.planet}
        data-exaltation={exaltation[H - 1] == d.planet}
        data-fall={fall[H - 1] == d.planet}
      >
        {houses[H - 1]}
      </div>
    </div>
  )
}

function house(body: keyof typeof Body, date: Date) {
  const x = GeoVector(Body[body], date, false)
  const pos = Ecliptic(x)
  const house = ~~(pos.elon / 30) + 1
  return house
}

// https://en.wikipedia.org/wiki/Lunar_month
// We follow european tradition
// First day starts at the new moon moment
// Next days start at the moonrise for exact location
function moonday(timestamp: number, lat: number, lng: number) {
  // 29.5 is average so fn can lie a bit
  // abut the exact beginning of the first day
  const t0 = new Date(timestamp - 29.5 * 24 * 60 * 60 * 1000)

  // Search for prev lunar month day
  // Loop is a recommedded way of using its interface
  // https://github.com/cosinekitty/astronomy/tree/master/source/js#SearchMoonQuarter
  let q = SearchMoonQuarter(t0)
  while (q.quarter != 0) {
    q = NextMoonQuarter(q)
  }

  // 0 is meters above the sea
  // Ideally that should be provided by user
  // or kept for certain locations
  // For now fn can lie a bit for places high above the sea
  const o = new Observer(lat, lng, 0)

  // Build the table of all lunar days per month
  const daystarts = [q.time.date]
  let t = q.time.date
  for (let i = 0; i < 30; i++) {
    const n = t.getTime()
    const t2 = new Date(n + 60 * 1000)
    const moonrise = SearchRiseSet(Body.Moon, o, +1, t2, 30)
    t = moonrise.date
    daystarts.push(t)
  }

  // We could use timestamps directly but extra
  // transform is quite useful for debug purposes
  const tss = daystarts.map(x => x.getTime())

  return tss.findIndex(x => x > timestamp) || 1
}
