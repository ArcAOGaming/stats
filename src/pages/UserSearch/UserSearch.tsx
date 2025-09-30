import { useState } from 'react'
import './UserSearch.css'
import { UserSearchProvider } from './context/UserSearchContext'
import { useProfileSearch } from './context/profile/useProfileSearch'
import { useDelegationSearch } from './context/delegation/useDelegationSearch'
import { SearchForm, ProfileCard, DelegationCard } from './components'

function UserSearchContent() {
    const [searchedWallet, setSearchedWallet] = useState<string | null>(null)
    const profileSearch = useProfileSearch()
    const delegationSearch = useDelegationSearch()

    const handleSearch = async (walletAddress: string) => {
        setSearchedWallet(walletAddress)

        // Search both profile and delegation data
        await Promise.all([
            profileSearch.searchProfiles(walletAddress),
            delegationSearch.searchDelegations(walletAddress)
        ])
    }

    const isLoading = profileSearch.loading || delegationSearch.loading
    const hasError = profileSearch.error || delegationSearch.error

    return (
        <div className="user-search">
            <div className="user-search-container">
                <SearchForm onSearch={handleSearch} loading={isLoading} />

                {hasError && (
                    <div className="error-section">
                        {profileSearch.error && (
                            <div className="error-message">
                                Profile Error: {profileSearch.error}
                            </div>
                        )}
                        {delegationSearch.error && (
                            <div className="error-message">
                                Delegation Error: {delegationSearch.error}
                            </div>
                        )}
                    </div>
                )}

                {isLoading && (
                    <div className="loading-section">
                        <div className="loading-spinner" />
                        <div>Loading user data...</div>
                    </div>
                )}

                {searchedWallet && !isLoading && (
                    <div className="results-section">
                        <div className="results-grid">
                            <ProfileCard walletAddress={searchedWallet} />
                            <DelegationCard walletAddress={searchedWallet} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function UserSearch() {
    return (
        <UserSearchProvider>
            <UserSearchContent />
        </UserSearchProvider>
    )
}

export default UserSearch