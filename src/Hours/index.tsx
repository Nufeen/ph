import React from 'react'
import {getSunrise, getSunset} from 'sunrise-sunset-js'
import {Body, Ecliptic, GeoVector} from 'astronomy-engine'

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
    end: i < 12 ? t0 + (i + 1) * dayHourL : t1 + (i - 11) * nightHourL
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
