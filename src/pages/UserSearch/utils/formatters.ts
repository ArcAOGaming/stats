/**
 * Formats a wallet address for display by showing first 6 and last 4 characters
 * @param address The full wallet address
 * @returns Formatted address string
 */
export function formatAddress(address: string): string {
    if (!address || address.length < 10) {
        return address
    }

    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Validates if a string looks like a valid wallet address
 * @param address The address to validate
 * @returns True if the address appears valid
 */
export function isValidWalletAddress(address: string): boolean {
    // Basic validation - could be improved based on actual wallet address format
    return address.length >= 40 && /^[a-zA-Z0-9_-]+$/.test(address)
}