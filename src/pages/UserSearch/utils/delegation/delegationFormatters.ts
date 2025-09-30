import { PROCESS_IDS } from 'ao-js-sdk'
import type { DelegationInfo } from './delegationService'

// Get the FLP mapping directly from the SDK
const FAIR_LAUNCH_PROCESSES = PROCESS_IDS.AUTONOMOUS_FINANCE.FAIR_LAUNCH_PROCESSES

export interface DelegationPreference {
    walletTo: string
    projectName: string
    factor: number
    percentage: number
    lastUpdate: Date
}

export interface FormattedDelegationData {
    preferences: DelegationPreference[]
    totalFactors: number
    lastUpdate: Date | null
    hasValidData: boolean
    rawData?: unknown // For debugging
}

/**
 * Formats a timestamp (in milliseconds) to a readable date string
 * @param timestamp The timestamp to format (can be number or string)
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number | string): string {
    try {
        const date = new Date(Number(timestamp))

        // Check if it's a valid date
        if (isNaN(date.getTime())) {
            return 'Invalid Date'
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch {
        return 'Invalid Date'
    }
}

/**
 * Gets the project name for a given process ID from FAIR_LAUNCH_PROCESSES
 * @param processId The process ID to look up
 * @returns The project name or formatted process ID if not found
 */
export function getProjectNameFromProcessId(processId: string): string {
    const entry = Object.entries(FAIR_LAUNCH_PROCESSES).find(([, id]) => id === processId)
    return entry ? entry[0] : `Unknown (${processId.slice(0, 8)}...)`
}

/**
 * Formats delegation information into a user-friendly structure
 * @param delegations The raw delegation object from the SDK
 * @returns Formatted delegation data with percentages and project names
 */
export function formatDelegationPreferences(delegations: DelegationInfo): FormattedDelegationData {
    try {
        // Debug: Log the raw delegation data to understand its structure
        console.log('Raw delegation data:', delegations)

        // Check if we have valid delegation data structure
        if (!delegations || typeof delegations !== 'object') {
            return {
                preferences: [],
                totalFactors: 0,
                lastUpdate: null,
                hasValidData: false,
                rawData: delegations
            }
        }

        // Extract data from the actual structure
        const delegationPrefs = delegations.delegationPrefs as Array<{ walletTo: string, factor: number }> | undefined
        const totalFactor = delegations.totalFactor // Note: singular, not plural
        const lastUpdateRaw = delegations.lastUpdate

        // Handle the delegation preferences array
        if (Array.isArray(delegationPrefs) && delegationPrefs.length > 0 && totalFactor) {
            const totalFactors = Number(totalFactor)

            const preferences: DelegationPreference[] = delegationPrefs.map(pref => {
                const factorNum = Number(pref.factor)
                const percentage = totalFactors > 0 ? (factorNum / totalFactors) * 100 : 0

                return {
                    walletTo: String(pref.walletTo),
                    projectName: getProjectNameFromProcessId(String(pref.walletTo)),
                    factor: factorNum,
                    percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
                    lastUpdate: lastUpdateRaw ? new Date(Number(lastUpdateRaw)) : new Date()
                }
            })

            return {
                preferences,
                totalFactors,
                lastUpdate: lastUpdateRaw ? new Date(Number(lastUpdateRaw)) : null,
                hasValidData: true,
                rawData: delegations
            }
        }

        // Fallback: Check for old format (direct walletTo/factor)
        const walletTo = delegations.walletTo
        const factor = delegations.factor

        if (walletTo && factor !== undefined) {
            const totalFactorsRaw = delegations.totalFactors || delegations.totalFactor || 1
            const totalFactors = Number(totalFactorsRaw)
            const factorNum = Number(factor)
            const percentage = totalFactors > 0 ? (factorNum / totalFactors) * 100 : 0

            return {
                preferences: [{
                    walletTo: String(walletTo),
                    projectName: getProjectNameFromProcessId(String(walletTo)),
                    factor: factorNum,
                    percentage: Math.round(percentage * 100) / 100,
                    lastUpdate: lastUpdateRaw ? new Date(Number(lastUpdateRaw)) : new Date()
                }],
                totalFactors,
                lastUpdate: lastUpdateRaw ? new Date(Number(lastUpdateRaw)) : null,
                hasValidData: true,
                rawData: delegations
            }
        }

        // If no parseable data found
        return {
            preferences: [],
            totalFactors: 0,
            lastUpdate: lastUpdateRaw ? new Date(Number(lastUpdateRaw)) : null,
            hasValidData: false,
            rawData: delegations
        }
    } catch (error) {
        console.error('Error formatting delegation preferences:', error)
        return {
            preferences: [],
            totalFactors: 0,
            lastUpdate: null,
            hasValidData: false,
            rawData: delegations
        }
    }
}

/**
 * Creates a debug view of the raw delegation data for development
 * @param delegations The raw delegation data
 * @returns Array of key-value pairs for display
 */
export function createDebugView(delegations: DelegationInfo): Array<{ key: string; value: string }> {
    return Object.entries(delegations).map(([key, value]) => ({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    }))
}