import cityTimezones from 'city-timezones'

import {useState} from 'react'

const LS = window.localStorage

/**
 * Time and location management
 * Read from URL in case of new location
 * If not, read latest from LS then provide state store
 */
const useData = () => {
  const urlParams = new URLSearchParams(window.location.search)

  const LSNatalData = JSON.parse(LS.getItem('natalData'))
  const LSTransitData = JSON.parse(LS.getItem('transitData'))

  const natalCity =
    urlParams.get('city') ?? LSNatalData?.city ?? null

  const natalTZ =
    cityTimezones.lookupViaCity(natalCity || '')?.[0]?.timezone ?? ''

  const date =
    (urlParams.get('date')
      ? new Date(+urlParams.get('date'))
      : null) ??
    (LSNatalData?.date && new Date(LSNatalData?.date)) ??
    new Date()

  const transitCity =
    urlParams.get('city2') ?? LSTransitData?.city ?? null

  const transitTZ =
    cityTimezones.lookupViaCity(transitCity || '')?.[0]?.timezone ??
    ''

  const date2 =
    (urlParams.get('date2')
      ? new Date(+urlParams.get('date2'))
      : null) ??
    (LSTransitData?.date && new Date(LSTransitData?.date)) ??
    new Date()

  const [natalData, setNatalData] = useState({
    city: natalCity,
    tz: natalTZ,
    country:
      urlParams.get('country') ?? LSNatalData?.country ?? null,
    date
  })

  const [transitData, setTransitData] = useState({
    city: urlParams.get('city2') ?? LSTransitData?.city ?? null,
    tz: transitTZ,
    country:
      urlParams.get('country2') ?? LSTransitData?.country ?? null,
    date: date2
  })

  return {natalData, setNatalData, transitData, setTransitData}
}

export default useData
