import { ProfileRegistryClient } from 'ao-js-sdk'
import type { ProfileRegistryEntry as SDKProfileEntry } from 'ao-js-sdk/dist/src/clients/bazar/profile-registry/abstract/types'

export interface ProfileRegistryEntry {
    ProfileId?: string
    CallerAddress?: string
    [key: string]: unknown
}

/**
 * Searches for user profiles by wallet address
 * @param walletAddress The wallet address to search for
 * @returns Promise that resolves with profile entries
 */
export async function searchProfilesByWallet(walletAddress: string): Promise<ProfileRegistryEntry[]> {
    try {
        const client = await ProfileRegistryClient.autoConfiguration()

        // Pass the wallet address as a parameter to the method
        console.log('Searching profiles for wallet:', walletAddress)
        const sdkProfiles = await client.getProfileByWalletAddress(walletAddress)

        // Transform SDK types to our internal types
        const profiles: ProfileRegistryEntry[] = (sdkProfiles as SDKProfileEntry[]).map(profile => ({
            ProfileId: profile.ProfileId,
            CallerAddress: profile.CallerAddress,
            ...profile
        }))

        return profiles
    } catch (error) {
        console.error('Profile search error:', error)
        // For now, return empty array instead of throwing to prevent blocking the UI
        console.warn(`Profile search failed for wallet ${walletAddress}, returning empty results`)
        return []
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