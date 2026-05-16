import {createContext} from 'react'

interface Settings {
  objects: any
  interface: any
  colors: any
  zodiacType: string
  chartType: string
}

export interface SettingContextType {
  settings: Settings
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
}

export const SettingContext =
  createContext<SettingContextType | null>(null)

export const SettingDispatchContext = createContext(null)
