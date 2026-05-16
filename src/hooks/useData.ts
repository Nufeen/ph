import cityTimezones from 'city-timezones'
import {useState} from 'react'

const LS = window.localStorage

interface NatalData {
  city: string
  tz: string
  country: string
  date: Date
}

interface TransitData {
  city: string
  tz: string
  country: string
  date: Date
}

interface UseDataReturn {
  natalData: NatalData
  setNatalData: React.Dispatch<React.SetStateAction<NatalData>>
  transitData: TransitData
  setTransitData: React.Dispatch<React.SetStateAction<TransitData>>
}

/**
 * Time and location management
 * Read from URL in case of new location
 * If not, read latest from LS then provide state store
 */
const useData = (): UseDataReturn => {
  const urlParams = new URLSearchParams(window.location.search)

  const LSNatalData =
    LS && typeof LS.getItem === 'function'
      ? JSON.parse(LS.getItem('natalData') as string)
      : null

  const LSTransitData =
    LS && typeof LS.getItem === 'function'
      ? JSON.parse(LS.getItem('transitData') as string)
      : null

  const natalCity =
    urlParams.get('city') ?? LSNatalData?.city ?? null

  const natalTZ =
    cityTimezones.lookupViaCity(natalCity || '')?.[0]?.timezone ?? ''

  const d = Number(urlParams.get('date'))

  const date =
    (d ? new Date(d) : null) ||
    (LSNatalData?.date && new Date(LSNatalData?.date)) ||
    new Date()

  const transitCity =
    urlParams.get('city2') ?? LSTransitData?.city ?? null

  const transitTZ =
    cityTimezones.lookupViaCity(transitCity || '')?.[0]?.timezone ??
    ''

  const date2Param = urlParams.get('date2')
  const date2 =
    (date2Param
      ? new Date(+date2Param)
      : null) ||
    (LSTransitData?.date && new Date(LSTransitData?.date)) ||
    new Date()

  const [natalData, setNatalData] = useState<NatalData>({
    city: natalCity,
    tz: natalTZ,
    country:
      urlParams.get('country') ?? LSNatalData?.country ?? null,
    date
  })

  const [transitData, setTransitData] = useState<TransitData>({
    city: urlParams.get('city2') ?? LSTransitData?.city ?? null,
    tz: transitTZ,
    country:
      urlParams.get('country2') ?? LSTransitData?.country ?? null,
    date: date2
  })

  return {natalData, setNatalData, transitData, setTransitData}
}

export default useData
