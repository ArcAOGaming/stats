import { useContext } from 'react'
import { DelegationSearchContext } from './createDelegationSearchContext'

export function useDelegationSearch() {
    const context = useContext(DelegationSearchContext)
    if (context === undefined) {
        throw new Error('useDelegationSearch must be used within a DelegationSearchProvider')
    }
    return context
}