import {createContext} from 'react'

export const SettingContext = createContext<{settings:any; setSettings:React.Dispatch<React.SetStateAction<any>>} | null>(null)
export const SettingDispatchContext = createContext(null)
