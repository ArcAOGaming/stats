import { useState, useCallback, ReactNode } from 'react'
import { searchProfilesByWallet, type ProfileInfo } from '../../utils/profile/profileService'
import { ProfileSearchContext, type ProfileSearchContextType } from './createProfileSearchContext'

interface ProfileSearchState {
    profiles: ProfileInfo[]
    loading: boolean
    error: string | null
}

export function ProfileSearchProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ProfileSearchState>({
        profiles: [],
        loading: false,
        error: null
    })

    const searchProfiles = useCallback(async (walletAddress: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }))

        try {
            const profiles = await searchProfilesByWallet(walletAddress)
            console.log('Fetched profiles:', profiles)
            setState(prev => ({ ...prev, profiles, loading: false }))
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profiles'
            setState(prev => ({ ...prev, error: errorMessage, loading: false, profiles: [] }))
        }
    }, [])

    const clearProfiles = useCallback(() => {
        setState({
            profiles: [],
            loading: false,
            error: null
        })
    }, [])

    const value: ProfileSearchContextType = {
        ...state,
        searchProfiles,
        clearProfiles
    }

    return (
        <ProfileSearchContext.Provider value={value}>
            {children}
        </ProfileSearchContext.Provider>
    )
}