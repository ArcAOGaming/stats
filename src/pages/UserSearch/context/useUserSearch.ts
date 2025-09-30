import { useProfileSearch } from './profile/useProfileSearch'
import { useDelegationSearch } from './delegation/useDelegationSearch'

// Combined hook for accessing both contexts
export function useUserSearch() {
    const profileSearch = useProfileSearch()
    const delegationSearch = useDelegationSearch()

    const searchAll = async (walletAddress: string) => {
        await Promise.all([
            profileSearch.searchProfiles(walletAddress),
            delegationSearch.searchDelegations(walletAddress)
        ])
    }

    const clearAll = () => {
        profileSearch.clearProfiles()
        delegationSearch.clearDelegations()
    }

    const isLoading = profileSearch.loading || delegationSearch.loading
    const hasError = profileSearch.error || delegationSearch.error
    const errors = [profileSearch.error, delegationSearch.error].filter(Boolean) as string[]

    return {
        // Individual contexts
        profile: profileSearch,
        delegation: delegationSearch,

        // Combined operations
        searchAll,
        clearAll,

        // Combined state
        isLoading,
        hasError,
        errors
    }
}