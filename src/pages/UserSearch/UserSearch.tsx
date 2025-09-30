import { useState } from 'react'
import './UserSearch.css'
import { UserSearchProvider } from './context/UserSearchContext'
import { useProfileSearch } from './context/profile/useProfileSearch'
import { useDelegationSearch } from './context/delegation/useDelegationSearch'
import { usePortfolioSearch } from './context/portfolio/usePortfolioSearch'
import { SearchForm, ProfileCard, DelegationCard, PortfolioCard } from './components'

function UserSearchContent() {
    const [searchedWallet, setSearchedWallet] = useState<string | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const profileSearch = useProfileSearch()
    const delegationSearch = useDelegationSearch()
    const portfolioSearch = usePortfolioSearch()

    const handleSearch = async (walletAddress: string) => {
        setSearchedWallet(walletAddress)
        setIsSearching(true)

        // Start all searches simultaneously but don't wait for them to complete
        profileSearch.searchProfiles(walletAddress)
        delegationSearch.searchDelegations(walletAddress)
        portfolioSearch.calculatePortfolio(walletAddress)

        // Only disable search form briefly to prevent rapid re-searches
        setTimeout(() => {
            setIsSearching(false)
        }, 1000)
    }

    const hasError = profileSearch.error || delegationSearch.error || portfolioSearch.error

    return (
        <div className="user-search">
            <div className="user-search-container">
                <SearchForm onSearch={handleSearch} loading={isSearching} />

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
                        {portfolioSearch.error && (
                            <div className="error-message">
                                Portfolio Error: {portfolioSearch.error}
                            </div>
                        )}
                    </div>
                )}

                {searchedWallet && (
                    <div className="results-section">
                        <div className="portfolio-section">
                            <PortfolioCard />
                        </div>
                        <div className="cards-grid">
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