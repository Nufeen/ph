import {useContext} from 'react'

import {SettingContext} from '../../../SettingContext.js'

import {Body, Ecliptic, GeoVector} from 'astronomy-engine'

import planets from '../../../assets/planets.json'

const {sin, cos, abs} = Math

type P = keyof typeof planets

export default function Aspects({calendarDay, zero, x0, y0}) {
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
                strokeWidth={abs(n) > 1 ? '1' : '.3'}
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
