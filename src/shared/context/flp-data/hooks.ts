import { useContext } from 'react'
import { FLPDataContext } from './context'
import { FLPDataContextType } from './types'

export function useFLPDataContext(): FLPDataContextType {
    const context = useContext(FLPDataContext)
    if (!context) {
        throw new Error('useFLPDataContext must be used within a FLPDataProvider')
    }
    return context
}