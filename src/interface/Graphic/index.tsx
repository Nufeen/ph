import s from './index.module.css'

import {Body, Ecliptic, GeoVector} from 'astronomy-engine'
import {SettingContext} from '../../SettingContext'
import {CelestialContext} from '../../CelestialContext'

import {useContext} from 'react'

import planets from '../../assets/planets.json'
import zodiacSigns from '../../assets/zodiac.json'

// SVG Canvas Height
const H = 600

// SVG Canvas Width
// 1200 is nice for 12 * i math
const W = 1200

function pos(body: keyof typeof Body, date: Date) {
  const x = GeoVector(Body[body], date, false)
  const pos = Ecliptic(x)
  return ((pos.elon - 0) / 360) * W
}

function getStartDatesOfEveryDayPerYear(year) {
  let dates = []
  let date = new Date(year, 0, 1)
  while (date.getFullYear() === year) {
    dates.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return dates
}

function splitArray(arr: number[]) {
  let result = []
  let temp = []
  for (let i = 0; i < arr.length - 1; i++) {
    temp.push(arr[i])
    if (Math.abs(arr[i][0] - arr[i + 1][0]) > 500) {
      result.push(temp)
      temp = []
    }
  }
  temp.push(arr[arr.length - 1])
  result.push(temp)
  return result
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const color = {
  Sun: '#ff0',
  Moon: '#444',
  Venus: 'green',
  Mars: 'red',
  Mercury: 'orange',
  Jupiter: '#007FFF',
  Saturn: 'grey',
  Uranus: 'crimson',
  Neptune: '#4D4DFF',
  Pluto: 'purple'
}

function dayNum(now: Date) {
  let startOfYear = new Date(now.getFullYear(), 0, 0)
  // @ts-ignore
  let diff = now - startOfYear
  let oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

export default function GraphicChart() {
  const {settings} = useContext(SettingContext)
  const {transitData} = useContext(CelestialContext)

  const year = transitData.date.getFullYear()

  const dates = getStartDatesOfEveryDayPerYear(year)

  return (
    <div className={s.wrap}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lets draw some grid */}
        {zodiacSigns.map((sign, index) => (
          <>
            <line
              className={s.signline}
              key={sign}
              x1={index * 100}
              y1="0"
              x2={index * 100}
              y2={H}
            />
            <text x={index * 100 + 45} y="-10" opacity=".5">
              {sign}
            </text>
          </>
        ))}

        {months.map((mo, index) => (
          <>
            <line
              className={s.monthline}
              key={mo}
              x1={0}
              y1={index * (H / 12)}
              x2={W}
              y2={index * (H / 12)}
            />
            <text
              className={s.month}
              x={10}
              y={index * (H / 12) + H / 24 + 5}
            >
              {mo} {year}
            </text>
          </>
        ))}

        {/* Current date line */}
        <line
          className={s.currentdateline}
          x1={0}
          y1={(dayNum(transitData.date) / 365) * H}
          x2={W}
          y2={(dayNum(transitData.date) / 365) * H}
        />

        {/* Natal planets */}
        {Object.keys(settings.objects.planets)
          .filter(x => settings.objects.planets[x])
          .map((body, i) => (
            <NatalLine body={body} i={i} />
          ))}

        {/* Transit planets */}
        {Object.keys(settings.objects.planets)
          .filter(x => settings.objects.planets[x])
          .map(body => (
            <Lines body={body} dates={dates} />
          ))}
      </svg>
    </div>
  )
}

function NatalLine({body, i}) {
  const {natalData} = useContext(CelestialContext)
  const x = pos(body, natalData.date)
  return (
    <>
      <line className={s.natalline} x1={x} y1={10} x2={x} y2={H} />
      <text className={s.natalText} x={x - 4} y={8}>
        {planets[body]}
      </text>
    </>
  )
}

function Lines({body, dates}) {
  const pzz = dates.map(dt => pos(body, dt))
  const pairs = pzz.map((p, i) => [p, (i * H) / dates.length])
  const lines = splitArray(pairs)

  return (
    <>
      {lines.map(line => (
        <Path A={line} color={color[body]} body={body} />
      ))}

      {lines.map(line => (
        <text
          fontSize={12}
          x={line[line.length - 1][0]}
          y={line[line.length - 1][1] + 10}
          fill={color[body]}
        >
          {planets[body]}
        </text>
      ))}
    </>
  )
}

function Path(props) {
  const [head, ...tail] = props.A

  const d =
    `M ${head[0]} ${head[1]} ` +
    tail.map((x: number[]) => `L ${x[0]}, ${x[1]}`).join(' ')

  return (
    <path
      data-body={props.body}
      d={d}
      stroke={props.color}
      fill="transparent"
    />
  )
}
