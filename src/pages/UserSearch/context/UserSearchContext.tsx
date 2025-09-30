import { ReactNode } from 'react'
import { ProfileSearchProvider } from './profile/ProfileSearchContext'
import { DelegationSearchProvider } from './delegation/DelegationSearchContext'
import { PortfolioSearchProvider } from './portfolio/PortfolioSearchContext'

// Re-export only the providers
export { ProfileSearchProvider, DelegationSearchProvider, PortfolioSearchProvider }

// Combined provider that aggregates all search contexts
export function UserSearchProvider({ children }: { children: ReactNode }) {
    return (
        <ProfileSearchProvider>
            <DelegationSearchProvider>
                <PortfolioSearchProvider>
                    {children}
                </PortfolioSearchProvider>
            </DelegationSearchProvider>
        </ProfileSearchProvider>
    )
}