import { useContext } from 'react'
import { ProfileSearchContext } from './createProfileSearchContext'

export function useProfileSearch() {
    const context = useContext(ProfileSearchContext)
    if (context === undefined) {
        throw new Error('useProfileSearch must be used within a ProfileSearchProvider')
    }
    return context
}