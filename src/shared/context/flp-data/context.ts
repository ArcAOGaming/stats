import { createContext } from 'react'
import { FLPDataContextType } from './types'

export const FLPDataContext = createContext<FLPDataContextType | undefined>(undefined)