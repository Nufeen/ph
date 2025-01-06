import s from './index.module.css'

import {Body, Ecliptic, GeoVector} from 'astronomy-engine'
import {SettingContext} from '../../SettingContext'
import {useContext} from 'react'

import planets from '../../assets/planets.json'

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

// TODO get rid if not needed for 10 years or more
function getMonthStartDates(year) {
  const dates = []
  for (let month = 0; month < 12; month++) {
    dates.push(new Date(year, month, 1))
  }
  return dates
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

function splitArray(arr) {
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

// TODO take from assets
const zodiacSigns = [
  '♈︎︎',
  '♉︎︎',
  '♊︎︎',
  '♋︎︎',
  '♌︎︎',
  '♍︎︎',
  '♎︎︎',
  '♏︎︎',
  '♐︎︎',
  '♑︎︎',
  '♒︎︎',
  '♓︎︎'
]

let months = [
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

export default function GraphicChart() {
  const {settings} = useContext(SettingContext)

  const dates = getStartDatesOfEveryDayPerYear(2025)

  return (
    <div className={s.wrap}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {zodiacSigns.map((sign, index) => (
          <>
            <line
              key={sign}
              x1={index * 100}
              y1="0"
              x2={index * 100}
              y2={H}
              stroke="white"
              strokeWidth=".2"
            />
            <text x={index * 100 + 45} y="20" opacity=".5">
              {sign}
            </text>
          </>
        ))}

        {months.map((mo, index) => (
          <>
            <line
              key={mo}
              x1={0}
              y1={index * (H / 12)}
              x2={W}
              y2={index * (H / 12)}
              stroke="white"
              strokeWidth=".2"
              opacity={0.2}
            />
            <text
              className={s.month}
              x={10}
              y={index * (H / 12) + H / 24 + 5}
              opacity=".2"
            >
              {mo}
            </text>
          </>
        ))}

        {Object.keys(settings.objects.planets)
          .filter(x => settings.objects.planets[x])
          .map(body => (
            <Lines body={body} dates={dates} />
          ))}
      </svg>
    </div>
  )
}

function Lines({body, dates}) {
  const pzz = dates.map(dt => pos(body, dt))
  const pairs = pzz.map((p, i) => [p, (i * H) / dates.length])
  const lines = splitArray(pairs)

  return (
    <>
      {lines.map(line => (
        <Path A={line} color={color[body]} />
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
    `M ${head[0]} ${head[1]} ` + tail.map(x => `L ${x[0]}, ${x[1]}`).join(' ')

  return <path d={d} stroke={props.color} fill="transparent" />
}
