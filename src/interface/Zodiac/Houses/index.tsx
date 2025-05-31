import {useContext} from 'react'
import {CelestialContext} from '../../../CelestialContext.js'

const {sin, cos} = Math

export default function Houses({zero, x0, y0, chartType}) {
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
      H[chartType].Houses[i].ChartPosition.StartPosition.Ecliptic
        .DecimalDegrees
    return ((x + zero) * Math.PI) / 180
  }

  const l = 155
  const A = [
    'ASC',
    'II',
    'III',
    'IC',
    'V',
    'VI',
    'DSC',
    'VIII',
    'IX',
    'MC',
    'XI',
    'XII'
  ]

  return (
    <>
      {H[chartType].Houses.map((_, i) => (
        <line
          key={i}
          stroke={chartType == 'natal' ? 'violet' : 'green'}
          strokeOpacity={chartType == 'natal' ? 1 : 0.2}
          strokeWidth={i % 3 == 0 ? 1 : 0.3}
          x1={x0 + (l - 56) * sin(deg(i))}
          y1={y0 + (l - 56) * cos(deg(i))}
          x2={x0 + l * sin(deg(i))}
          y2={y0 + l * cos(deg(i))}
        />
      ))}

      {H[chartType].Houses.map((_, i) => (
        <text
          fill={chartType == 'natal' ? 'violet' : 'green'}
          fontSize={5}
          opacity={chartType == 'natal' ? 1 : 0.4}
          fontWeight={i % 3 == 0 ? 'bold' : 'normal'}
          key={i}
          x={x0 + (l + 8) * sin(deg(i)) - 7}
          y={y0 + (l + 5) * cos(deg(i))}
        >
          {A[i]}
          <tspan fontSize={4} dy="-4">
            {
              ~~(
                H[chartType].Houses[i].ChartPosition.StartPosition
                  .Ecliptic.DecimalDegrees % 30
              )
            }
            °
          </tspan>
        </text>
      ))}
    </>
  )
}
