import { createContext } from 'react'
import type { ProfileInfo } from '../../utils/profile/profileService'

interface ProfileSearchState {
    profiles: ProfileInfo[]
    loading: boolean
    error: string | null
}

export interface ProfileSearchContextType extends ProfileSearchState {
    searchProfiles: (walletAddress: string) => Promise<void>
    clearProfiles: () => void
}

export const ProfileSearchContext = createContext<ProfileSearchContextType | undefined>(undefined)