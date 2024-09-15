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