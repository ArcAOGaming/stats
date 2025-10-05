import { useContext } from 'react'
import { RandAOStatsContext } from './createRandAOStatsContext'

export function useRandAOStats() {
    const context = useContext(RandAOStatsContext)
    if (context === undefined) {
        throw new Error('useRandAOStats must be used within a RandAOStatsProvider')
    }
    return context
}