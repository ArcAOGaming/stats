import { ReactNode } from 'react'
import { ProfileSearchProvider } from './profile/ProfileSearchContext'
import { DelegationSearchProvider } from './delegation/DelegationSearchContext'

// Re-export only the providers
export { ProfileSearchProvider, DelegationSearchProvider }

// Combined provider that aggregates all search contexts
export function UserSearchProvider({ children }: { children: ReactNode }) {
    return (
        <ProfileSearchProvider>
            <DelegationSearchProvider>
                {children}
            </DelegationSearchProvider>
        </ProfileSearchProvider>
    )
}