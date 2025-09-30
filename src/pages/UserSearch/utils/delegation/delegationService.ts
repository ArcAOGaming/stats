import { PIService } from 'ao-js-sdk'

export interface DelegationInfo {
    [key: string]: string | number | boolean | object
}

/**
 * Searches for user delegations by wallet address
 * @param walletAddress The wallet address to search for
 * @returns Promise that resolves with delegation information
 */
export async function searchDelegationsByWallet(walletAddress: string): Promise<DelegationInfo> {
    try {
        const service = await PIService.autoConfiguration()

        // Log the wallet address for debugging
        console.log('Searching delegations for wallet:', walletAddress)

        // Pass the wallet address as a parameter to getUserDelegations
        const sdkDelegations = await service.getUserDelegations(walletAddress)

        // Transform SDK types to our internal types
        const delegations: DelegationInfo = {
            walletAddress,
            ...(sdkDelegations as unknown as Record<string, unknown>)
        }

        return delegations
    } catch (error) {
        console.error('Delegation search error:', error)
        // For now, return basic info instead of throwing to prevent blocking the UI
        console.warn(`Delegation search failed for wallet ${walletAddress}, returning basic info`)
        return {
            walletAddress,
            error: 'Failed to fetch delegation data',
            message: 'This feature may require wallet connection or the wallet may not have delegation data'
        }
    }
}

/**
 * Validates if a wallet address format is acceptable for delegation search
 * @param walletAddress The wallet address to validate
 * @returns True if the address appears valid for search
 */
export function isValidDelegationSearchAddress(walletAddress: string): boolean {
    return walletAddress.length >= 40 && /^[a-zA-Z0-9_-]+$/.test(walletAddress)
}

/**
 * Formats delegation data for display
 * @param delegations The delegation object
 * @returns Formatted delegation entries
 */
export function formatDelegationEntries(delegations: DelegationInfo): Array<{ key: string; value: string }> {
    if (!delegations || typeof delegations !== 'object') {
        return []
    }

    return Object.entries(delegations)
        .filter(([key]) => key !== 'walletAddress') // Exclude our added field
        .map(([key, value]) => ({
            key: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            value: typeof value === 'string' ? value : JSON.stringify(value, null, 2)
        }))
}