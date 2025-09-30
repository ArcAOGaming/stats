import { createContext } from 'react'

export interface PortfolioData {
    usdWorth: string
    aoWorth: string
    arweaveBalance: number
    lastUpdated: Date
    loading: boolean
    error: string | null
}

export interface PortfolioSearchContextType extends PortfolioData {
    calculatePortfolio: (walletAddress: string) => Promise<void>
    clearPortfolio: () => void
    refreshPortfolio: () => Promise<void>
}

export const PortfolioSearchContext = createContext<PortfolioSearchContextType | undefined>(undefined)