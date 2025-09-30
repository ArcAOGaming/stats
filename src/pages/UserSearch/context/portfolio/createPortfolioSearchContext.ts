import { createContext } from 'react'

export interface PortfolioValueState {
    value: string | number
    loading: boolean
    error: string | null
    lastUpdated: Date | null
}

export interface PortfolioData {
    usdWorth: PortfolioValueState
    aoWorth: PortfolioValueState
    arweaveBalance: PortfolioValueState
    lastUpdated: Date
    // Keep overall loading/error for backward compatibility and overall state
    loading: boolean
    error: string | null
}

export interface PortfolioSearchContextType extends PortfolioData {
    calculatePortfolio: (walletAddress: string) => Promise<void>
    clearPortfolio: () => void
    refreshPortfolio: () => Promise<void>
}

export const PortfolioSearchContext = createContext<PortfolioSearchContextType | undefined>(undefined)