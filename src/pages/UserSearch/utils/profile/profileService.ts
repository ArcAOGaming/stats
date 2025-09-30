import { ProfilesService } from 'ao-js-sdk'

// Export the ProfileInfo type from ao-js-sdk for use in other components
export type { ProfileInfo } from 'ao-js-sdk'

export interface ProfileRegistryEntry {
    ProfileId?: string
    CallerAddress?: string
    [key: string]: unknown
}

/**
 * Searches for user profiles by wallet address using ProfilesService
 * @param walletAddress The wallet address to search for
 * @returns Promise that resolves with detailed profile information
 */
export async function searchProfilesByWallet(walletAddress: string): Promise<import('ao-js-sdk').ProfileInfo[]> {
    try {
        console.log('Initializing ProfilesService for wallet:', walletAddress)

        // Use getInstance method which was the original approach
        const profilesService = ProfilesService.getInstance()

        // Pass the wallet address as a parameter to the method
        console.log('Searching detailed profiles for wallet:', walletAddress)
        const profiles = await profilesService.getProfileInfosByWalletAddress([walletAddress])

        console.log('Successfully fetched profiles:', profiles)
        return profiles
    } catch (error) {
        console.error('Profile search error details:', error)

        // Improved error handling - throw specific errors instead of hiding them
        if (error instanceof Error) {
            throw new Error(`Failed to fetch profiles for ${walletAddress}: ${error.message}`)
        } else {
            throw new Error(`Failed to fetch profiles for ${walletAddress}: Unknown error occurred`)
        }
    }
}

/**
 * Validates if a wallet address format is acceptable for profile search
 * @param walletAddress The wallet address to validate
 * @returns True if the address appears valid for search
 */
export function isValidProfileSearchAddress(walletAddress: string): boolean {
    return walletAddress.length >= 40 && /^[a-zA-Z0-9_-]+$/.test(walletAddress)
}