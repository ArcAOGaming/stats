import { Distribution } from 'ao-js-sdk'

export interface FLPDataContextType {
    numDelegators: number | null
    mostRecentDistributions: Distribution[]
    loading: boolean
    error: string | null
    retryFetch: () => void
}

export interface FLPDataProviderProps {
    children: React.ReactNode
    processId?: string
}