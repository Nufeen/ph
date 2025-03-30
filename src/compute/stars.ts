// https://www.astro.com/astrowiki/en/Fixed_star_list
// 2000 position
import stardata from '../assets/stars.json'
import planets from '../assets/planets.json'

import {Body, Ecliptic, GeoVector} from 'astronomy-engine'

const z = [
  'Ari',
  'Tau',
  'Gem',
  'Can',
  'Leo',
  'Vir',
  'Lib',
  'Sco',
  'Sag',
  'Cap',
  'Aqu',
  'Pis'
] as const

export const stars = stardata
  .map(parse)
  .filter(x => (['α', 'β', 'γ'] as const).includes(x.size))

function pos(body: keyof typeof Body, date: Date) {
  const x = GeoVector(Body[body], date, false)
  const pos = Ecliptic(x)
  return pos.elon
}

function parse(d) {
  return {
    name: d[0],
    elon: elon(d[2], d[3]),
    size: d[1][0]
  }
}

function elon(s, sign) {
  const [deg, min] = s.split('°')
  const n = z.findIndex(x => x == sign)
  return n >= 0 ? n * 30 + +deg + +min / 60 : null
}

export function connectedStars(calendarDay) {
  const out = Object.keys(planets).reduce((a, x: any, i) => {
    return {...a, [x]: findStar(pos(x, calendarDay))}
  }, {})

  return out
}

function findStar(elon) {
  return stars.filter(x => Math.abs(x.elon - elon) < 1)
}

export function starsOnFictivePoints(calendarDay, horoscope) {
  const out = ['lilith', 'northnode', 'southnode'].reduce(
    (a, x: any, i) => {
      return {
        ...a,
        [x]: findStar(
          horoscope.CelestialPoints[x].ChartPosition.Ecliptic
            .DecimalDegrees
        )
      }
    },
    {}
  )

  return out
}
