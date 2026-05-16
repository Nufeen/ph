import {createContext} from 'react'

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

interface Chart {
  natal: {lat: number; lng: number}
  transit: {lat: number; lng: number}
}

export interface CelestialContextType {
  horoscope: any
  transitHoroscope: any
  progressedHoroscope: any
  stars: any
  transitStars: any
  progressedStars: any
  fictivePointsStars: any
  natalData: NatalData
  transitData: TransitData
  chart: Chart
}

export const CelestialContext =
  createContext<CelestialContextType | null>(null)
