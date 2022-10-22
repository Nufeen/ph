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

type Planet = keyof typeof planets

type Props = {lat: number; lng: number; calendarDay: Date; today: Date}

const faces = [
  ['Mars', 'Sun', 'Venus'],
  ['Venus', 'Moon', 'Saturn'],
  ['Jupiter', 'Mars', 'Sun'],
  ['Venus', 'Mercury', 'Moon'],
  ['Saturn', 'Jupiter', 'Mars'],
  ['Sun', 'Venus', 'Mercury'],
  ['Moon', 'Saturn', 'Jupiter'],
  ['Mars', 'Sun', 'Venus'],
  ['Mercury', 'Moon', 'Saturn'],
  ['Jupiter', 'Mars', 'Sun'],
  ['Venus', 'Mercury', 'Moon'],
  ['Saturn', 'Jupiter', 'Mars']
]

const termes = {
  angles: [
    [6, 14, 21, 26, 30],
    [8, 15, 22, 20, 30],
    [7, 14, 21, 25, 30],
    [6, 13, 20, 27, 30],
    [6, 13, 19, 25, 30],
    [7, 13, 18, 24, 30],
    [6, 11, 19, 24, 30],
    [6, 14, 21, 27, 30],
    [8, 14, 19, 25, 30],
    [6, 12, 19, 25, 30],
    [6, 12, 20, 25, 30],
    [8, 14, 20, 26, 30]
  ],
  planets: [
    ['Jupiter', 'Venus', 'Mercury', 'Mars', 'Saturn'],
    ['Venus', 'Mercury', 'Jupiter', 'Saturn', 'Mars'],
    ['Mercury', 'Jupiter', 'Venus', 'Saturn', 'Mars'],
    ['Mars', 'Jupiter', 'Mercury', 'Venus', 'Saturn'],
    ['Saturn', 'Mercury', 'Venus', 'Jupiter', 'Mars'],
    ['Mercury', 'Venus', 'Jupiter', 'Saturn', 'Mars'],
    ['Saturn', 'Venus', 'Jupiter', 'Mercury', 'Mars'],
    ['Mars', 'Jupiter', 'Venus', 'Mercury', 'Saturn'],
    ['Jupiter', 'Venus', 'Mercury', 'Saturn', 'Mars'],
    ['Venus', 'Mercury', 'Jupiter', 'Mars', 'Saturn'],
    ['Saturn', 'Mercury', 'Venus', 'Jupiter', 'Mars'],
    ['Venus', 'Jupiter', 'Mercury', 'Mars', 'Saturn']
  ]
}

const triplicity = {
  day: [
    'Sun',
    'Venus',
    'Saturn',
    'Mars',
    'Sun',
    'Venus',
    'Saturn',
    'Mars',
    'Sun',
    'Venus',
    'Saturn',
    'Mars'
  ],
  night: [
    'Jupiter',
    'Moon',
    'Mercury',
    'Mars',
    'Jupiter',
    'Moon',
    'Mercury',
    'Mars',
    'Jupiter',
    'Moon',
    'Mercury',
    'Mars'
  ]
}

export default function PlanetsTable(props: Props) {
  const {lat, lng, calendarDay, today} = props

  const P = Object.keys(planets) as Planet[]
  return (
    <div className={s.wrap}>
      <div className={s.planet}>
        <div></div>
        {false && <div>house</div>}

        <div>own </div>
        <div>exalt.</div>
        <div>tripl.</div>
        <div>term</div>
        <div>face</div>

        <div>detr.</div>
        <div>fall</div>
        <div>peregr.</div>
        <div>Σ</div>
      </div>

      {P.map((planet: Planet) => (
        <Line key={planet} planet={planet} {...props} />
      ))}
    </div>
  )
}

function Line(props: Props & {planet: Planet}) {
  const {planet} = props
  const now = new Date()

  const H = house(planet, now)

  /**
   * effential dignities
   */
  const in_own_house = dignity[H - 1] == planet && 5
  const in_exaltation = exaltation[H - 1] == planet && 4

  // mutual exaltation
  const h_is_ex_of = exaltation[H - 1] as Planet
  const house_of_mut = h_is_ex_of && house(h_is_ex_of, now)
  const in_mutual_ex =
    house_of_mut && exaltation[house_of_mut - 1] == planet && 4

  // triplicity
  const sunrise = getSunrise(props.lat, props.lng, now)
  const sunset = getSunset(props.lat, props.lng, now)
  const t = now.getTime()
  const its_night_now = sunrise.getTime() > t || t > sunset.getTime()

  const in_triplicity =
    triplicity[its_night_now ? 'night' : 'day'][H - 1] == planet && 3

  // faces and termes count
  const pos_inside_house = elon(planet, now) - (H - 1) * 30

  const tnn = termes.angles[H - 1].findIndex(x => pos_inside_house < x)
  const in_terme = termes.planets[H - 1][tnn] == planet && 2

  const fnn = [10, 20, 60].findIndex(x => pos_inside_house < x)
  const face = faces[H - 1][fnn] == planet && 1

  /**
   * debilities
   */
  const in_detriment = detriment[H - 1] == planet && -5
  const in_fall = fall[H - 1] == planet && -4
  const peregrine =
    !in_own_house &&
    !in_exaltation &&
    !in_mutual_ex &&
    !in_triplicity &&
    !in_terme &&
    !face &&
    -5

  const sum =
    +in_own_house +
    +in_exaltation +
    +in_mutual_ex +
    +in_triplicity +
    +in_terme +
    +face +
    +in_detriment +
    +in_fall +
    +peregrine

  return (
    <div
      key={planet}
      className={s.planet}
      data-strong={sum >= 5}
      data-weak={sum <= -5}
    >
      <div>{planets[planet]}</div>
      {false && (
        <div
          data-dignity={dignity[H - 1] == planet}
          data-decline={detriment[H - 1] == planet}
          data-exaltation={exaltation[H - 1] == planet}
          data-fall={fall[H - 1] == planet}
        >
          {H}
        </div>
      )}

      <div>{in_own_house}</div>
      <div>
        {in_exaltation || in_mutual_ex}
        {in_mutual_ex && planets[h_is_ex_of]}
      </div>
      <div>{in_triplicity}</div>
      <div>{in_terme}</div>
      <div>{face}</div>

      <div>{in_detriment}</div>
      <div>{in_fall}</div>
      <div>{peregrine}</div>
      <div>{sum}</div>
    </div>
  )
}

function house(body: keyof typeof Body, date: Date) {
  const x = GeoVector(Body[body], date, false)
  const pos = Ecliptic(x)
  const house = ~~(pos.elon / 30) + 1
  return house
}

function elon(body: keyof typeof Body, date: Date) {
  const x = GeoVector(Body[body], date, false)
  const pos = Ecliptic(x)
  return pos.elon
}
