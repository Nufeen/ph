import {createContext} from 'react'

export type GraphicChartType = 'transit' | 'progressed'

export type GraphicYearsSpan = 1 | 10 | 30 | 100

export type GraphicModulo = 360 | 90 | 30

interface Settings {
  objects: any
  interface: any
  colors: any
  zodiacType: string
  chartType: string
  graphicType?: GraphicChartType
  graphicYears?: GraphicYearsSpan
  graphicStartYear?: number
  graphicModulo?: GraphicModulo
}

export interface SettingContextType {
  settings: Settings
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
}

export const SettingContext =
  createContext<SettingContextType | null>(null)

export const SettingDispatchContext = createContext(null)
