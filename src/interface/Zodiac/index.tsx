/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */

import {useContext} from 'react'

import {SettingContext} from '../../SettingContext.js'

import Stars from './Stars'

import s from './index.module.css'

import {Body, Ecliptic, GeoVector} from 'astronomy-engine'

import planets from '../../assets/planets.json'
import houses from '../../assets/houses.json'

import {Origin, Horoscope} from 'circular-natal-horoscope-js/dist/index.js'
import {CelestialContext} from '../../CelestialContext.js'

import TransitPlanets from './TransitPlanets/index.js'

import Planets from './Planets/index.js'

import TransitAspects from './TransitAspects/index.js'

const {sin, cos, abs} = Math

const l = [...Array(12).keys()]

type P = keyof typeof planets

type Props = {
  calendarDay: Date
  lat: number
  lng: number
}

export default function Zodiac(props: Props) {
  const {calendarDay, lat, lng} = props

  const {settings} = useContext(SettingContext)

  const x0 = 150
  const y0 = 155

  const r = 130

  const zero = -90

  return (
    <div className={s.wrapper}>
      <svg width="300" height="300" viewBox="0 0 300 300" className={s.figure}>
        <circle cx={x0} cy={y0} r={r} />

        {l.map(i => (
          <line
            key={i}
            x1={x0}
            y1={y0}
            x2={x0 + r * sin((i * 30 * 3.14 + zero) / 180)}
            y2={y0 + r * cos((i * 30 * 3.14 + zero) / 180)}
            stroke="currentColor"
          />
        ))}

        <circle cx={x0} cy={y0} r="100" />
        <circle cx={x0} cy={y0} r="70" />
        <circle cx={x0} cy={y0} r="144" />

        {l.map(i => (
          <text
            className={s.house}
            key={i}
            fill="currentColor"
            x={x0 - 5 + (r - 15) * sin(((i * 30 + zero + 15) * 3.14) / 180)}
            y={y0 + 3 + (r - 15) * cos(((i * 30 + zero + 15) * 3.14) / 180)}
          >
            {houses[i]}
          </text>
        ))}

        {settings.objects?.houses?.visibility?.natal && (
          <Houses {...{zero, x0, y0}} chartType="natal" />
        )}

        {settings.objects?.houses?.visibility?.transit && (
          <Houses {...{zero, x0, y0}} chartType="transit" />
        )}

        <Planets {...{calendarDay, zero, x0, y0}} />
        <Fictive {...{calendarDay, zero, x0, y0, lat, lng}} />

        {settings.chartType == 'natal' && (
          <Aspects {...{calendarDay, zero, x0, y0}} />
        )}

        {settings.chartType == 'transit' && (
          <TransitAspects {...{calendarDay, zero, x0, y0}} />
        )}

        {settings.chartType == 'transit' && (
          <TransitPlanets {...{zero, x0, y0}} />
        )}
        {settings.objects.celestialPoints?.fixedStars?.chart && (
          <Stars {...{calendarDay, zero, x0, y0}} />
        )}
      </svg>
    </div>
  )
}

function Houses({zero, x0, y0, chartType}) {
  const {
    horoscope,
    transitHoroscope,
    chart: latlng
  } = useContext(CelestialContext)

  const {lat, lng} = latlng[chartType]

  if (!lat && !lng) return null

  const H = {
    natal: horoscope,
    transit: transitHoroscope
  }

  function deg(i) {
    const x =
      H[chartType].Houses[i].ChartPosition.StartPosition.Ecliptic.DecimalDegrees
    return ((x + zero) * 3.14) / 180
  }

  const l = 155
  const A = ['ASC', 2, 3, 'IC', 5, 6, 'DSC', 8, 9, 'MC', 11, 12]

  return (
    <>
      {H[chartType].Houses.map((_, i) => (
        <line
          key={i}
          stroke={chartType == 'natal' ? 'violet' : 'gray'}
          strokeOpacity={i % 3 == 0 ? 0.6 : 0.3}
          x1={x0 + (l - 56) * sin(deg(i))}
          y1={y0 + (l - 56) * cos(deg(i))}
          x2={x0 + l * sin(deg(i))}
          y2={y0 + l * cos(deg(i))}
        />
      ))}

      {H[chartType].Houses.map((_, i) => (
        <text
          fill={chartType == 'natal' ? 'violet' : 'gray'}
          fontSize={5}
          opacity={0.6}
          fontWeight={'bold'}
          key={i}
          x={x0 + (l + 1) * sin(deg(i)) - 7}
          y={y0 + (l + 5) * cos(deg(i))}
        >
          {i % 3
            ? ''
            : `${A[i]} ${~~(H[chartType].Houses[i].ChartPosition.StartPosition.Ecliptic.DecimalDegrees % 30)}°`}
        </text>
      ))}
    </>
  )
}
function Fictive({calendarDay, zero, x0, y0, lat, lng}) {
  const {settings} = useContext(SettingContext)

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
    latitude: lat,
    longitude: lng
  })

  const horoscope = new Horoscope({
    origin: origin,
    houseSystem: 'placidus',
    zodiac: 'tropical',
    aspectPoints: ['bodies', 'points', 'angles'],
    aspectWithPoints: ['bodies', 'points', 'angles'],
    aspectTypes: ['major', 'minor'],
    customOrbs: {},
    language: 'en'
  })

  const ldd =
    horoscope.CelestialPoints.lilith.ChartPosition.Ecliptic.DecimalDegrees

  const lilithDeg = ((ldd + zero) * 3.14) / 180

  const nndd =
    horoscope.CelestialPoints.northnode.ChartPosition.Ecliptic.DecimalDegrees

  const northnodeDeg = ((nndd + zero) * 3.14) / 180

  return (
    <>
      {settings.objects.celestialPoints.lilith && (
        <>
          <text
            fill="violet"
            fontSize={8}
            x={x0 + 93 * sin(lilithDeg)}
            y={y0 + 95 * cos(lilithDeg)}
          >
            ⚸
          </text>

          <circle
            className={s.fictive}
            stroke="violet"
            strokeWidth="3"
            cx={x0 + 70 * sin(lilithDeg)}
            cy={y0 + 70 * cos(lilithDeg)}
            r="1"
          />
        </>
      )}
      {settings.objects.celestialPoints.northnode && (
        <>
          <text
            fill="violet"
            fontSize={8}
            x={x0 + 90 * sin(northnodeDeg) - 7}
            y={y0 + 90 * cos(northnodeDeg)}
          >
            ☊
          </text>

          <circle
            className={s.fictive}
            stroke="violet"
            strokeWidth="3"
            cx={x0 + 70 * sin(northnodeDeg)}
            cy={y0 + 70 * cos(northnodeDeg)}
            r="1"
          />
        </>
      )}
      {settings.objects.celestialPoints.southnode && (
        <>
          <text
            fill="violet"
            fontSize={8}
            x={x0 - 90 * sin(northnodeDeg) - 7}
            y={y0 - 90 * cos(northnodeDeg)}
          >
            ☋
          </text>
          <circle
            className={s.fictive}
            fill="violet"
            stroke="violet"
            strokeWidth="3"
            cx={x0 - 70 * sin(northnodeDeg)}
            cy={y0 - 70 * cos(northnodeDeg)}
            r="1"
          />
        </>
      )}
    </>
  )
}

function Aspects({calendarDay, zero, x0, y0}) {
  const {settings} = useContext(SettingContext)

  const M = settings.interface.aspectOrb

  const l = (Object.keys(planets) as P[]).filter(
    key => settings.objects.planets[key]
  )

  const aspectTable = l.reduce((a, planet1, i) => {
    a[i] = a[i] || []

    l.forEach((planet2, j) => {
      if (i <= j) a[i][j] = checkAspect(planet1, planet2, calendarDay, M)
    })

    return a
  }, [])

  return (
    <>
      {aspectTable.map((al, i) =>
        al.map(
          (n: number, j: number) =>
            n != 0 && (
              <line
                key={JSON.stringify([i, j])}
                x1={
                  x0 + 70 * sin(((pos(l[i], calendarDay) + zero) * 3.14) / 180)
                }
                y1={
                  y0 + 70 * cos(((pos(l[i], calendarDay) + zero) * 3.14) / 180)
                }
                x2={
                  x0 + 70 * sin(((pos(l[j], calendarDay) + zero) * 3.14) / 180)
                }
                y2={
                  y0 + 70 * cos(((pos(l[j], calendarDay) + zero) * 3.14) / 180)
                }
                stroke={n < 0 ? 'red' : 'deepskyblue'}
                strokeWidth={Math.abs(n) > 1 ? '1' : '.3'}
              />
            )
        )
      )}
      {Object.entries(planets).map(([key]: any) => (
        <circle
          data-planet={key}
          key={key}
          fill="currentColor"
          strokeWidth="3"
          cx={x0 + 70 * sin(((pos(key, calendarDay) + zero) * 3.14) / 180)}
          cy={y0 + 70 * cos(((pos(key, calendarDay) + zero) * 3.14) / 180)}
          r="1"
        />
      ))}
    </>
  )
}

function pos(body: keyof typeof Body, date: Date) {
  const x = GeoVector(Body[body], date, false)
  const pos = Ecliptic(x)
  return pos.elon
}

function checkAspect(planet1, planet2, calendarDay, M) {
  if (planet1 == planet2) {
    return 0
  }

  let [a, b] = [pos(planet1, calendarDay), pos(planet2, calendarDay)]

  if (a > 180) a = a - 360
  if (b > 180) b = b - 360

  let orb = 3

  if (
    [planet1, planet2].includes('Jupiter') ||
    [planet1, planet2].includes('Moon')
  ) {
    orb = 4
  }

  if ([planet1, planet2].includes('Saturn')) {
    orb = 5
  }

  if ([planet1, planet2].includes('Sun')) {
    orb = 7
  }

  const d = abs(a - b)

  const aspects = [abs(d - 120), abs(d - 60), abs(d - 180), abs(d - 90), d]

  const exact = aspects.findIndex(x => x < 1) + 1

  if (exact) {
    return exact > 2 ? -2 : 2
  }

  const inorb = aspects.findIndex(x => x < (orb * M) / 4) + 1

  if (inorb) {
    return inorb > 2 ? -1 : 1
  }

  return 0
}
