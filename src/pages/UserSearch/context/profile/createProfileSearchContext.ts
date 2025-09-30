import { createContext } from 'react'
import type { ProfileRegistryEntry } from '../../utils/profile/profileService'

interface ProfileSearchState {
    profiles: ProfileRegistryEntry[]
    loading: boolean
    error: string | null
}

export interface ProfileSearchContextType extends ProfileSearchState {
    searchProfiles: (walletAddress: string) => Promise<void>
    clearProfiles: () => void
}

export const ProfileSearchContext = createContext<ProfileSearchContextType | undefined>(undefined)