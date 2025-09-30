import { createContext } from 'react'
import type { DelegationInfo } from '../../utils/delegation/delegationService'

interface DelegationSearchState {
    delegations: DelegationInfo
    loading: boolean
    error: string | null
}

export interface DelegationSearchContextType extends DelegationSearchState {
    searchDelegations: (walletAddress: string) => Promise<void>
    clearDelegations: () => void
}

export const DelegationSearchContext = createContext<DelegationSearchContextType | undefined>(undefined)