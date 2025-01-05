const elementMap = {
  aries: 'fire',
  taurus: 'earth',
  gemini: 'air',
  cancer: 'water',
  leo: 'fire',
  virgo: 'earth',
  libra: 'air',
  scorpio: 'water',
  sagittarius: 'fire',
  capricorn: 'earth',
  aquarius: 'air',
  pisces: 'water'
}

export default function reduceToElements(horoscope) {
  return Object.values(horoscope.CelestialBodies).reduce((acc, body: any) => {
    const sign = body?.Sign?.key
    if (!sign) return acc
    if (!acc[elementMap[sign]]) {
      acc[elementMap[sign]] = 0
    }
    acc[elementMap[sign]] += 1
    return acc
  }, {})
}
