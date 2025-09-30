import { useState, useCallback, ReactNode } from 'react'
import { searchDelegationsByWallet, type DelegationInfo } from '../../utils/delegation/delegationService'
import { DelegationSearchContext, type DelegationSearchContextType } from './createDelegationSearchContext'

interface DelegationSearchState {
    delegations: DelegationInfo
    loading: boolean
    error: string | null
}

export function DelegationSearchProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<DelegationSearchState>({
        delegations: {},
        loading: false,
        error: null
    })

    const searchDelegations = useCallback(async (walletAddress: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }))

        try {
            const delegations = await searchDelegationsByWallet(walletAddress)
            setState(prev => ({ ...prev, delegations, loading: false }))
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch delegations'
            setState(prev => ({ ...prev, error: errorMessage, loading: false, delegations: {} }))
        }
    }, [])

    const clearDelegations = useCallback(() => {
        setState({
            delegations: {},
            loading: false,
            error: null
        })
    }, [])

    const value: DelegationSearchContextType = {
        ...state,
        searchDelegations,
        clearDelegations
    }

    return (
        <DelegationSearchContext.Provider value={value}>
            {children}
        </DelegationSearchContext.Provider>
    )
}