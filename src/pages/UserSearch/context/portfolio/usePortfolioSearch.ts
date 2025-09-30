import { useContext } from 'react'
import { PortfolioSearchContext } from './createPortfolioSearchContext'

export function usePortfolioSearch() {
    const context = useContext(PortfolioSearchContext)
    if (context === undefined) {
        throw new Error('usePortfolioSearch must be used within a PortfolioSearchProvider')
    }
    return context
}