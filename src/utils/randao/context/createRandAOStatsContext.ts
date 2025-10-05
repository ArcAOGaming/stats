import { createContext } from 'react'
import type { TimePeriod, TimeBasedRandomnessData } from '../randaoStatsService'

interface RandAOStatsState {
    totalRandomnessCreated: bigint | null
    timeBasedData: TimeBasedRandomnessData[]
    selectedTimePeriod: TimePeriod
    loading: boolean
    error: string | null
    observableCompleted: boolean // Track if Observable has completed
}

export interface RandAOStatsContextType extends RandAOStatsState {
    fetchTotalRandomness: () => Promise<void>
    fetchTimeBasedData: (period: TimePeriod) => Promise<void>
    setTimePeriod: (period: TimePeriod) => void
    clearData: () => void
}

export const RandAOStatsContext = createContext<RandAOStatsContextType | undefined>(undefined)