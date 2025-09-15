import React, { useEffect, useState } from 'react'
import { FLPDataService, Distribution } from 'ao-js-sdk'
import { PROCESS_IDS } from '../../../constants'
import { FLPDataContextType, FLPDataProviderProps } from './types'
import { FLPDataContext } from './context'

export function FLPDataProvider({ children, processId }: FLPDataProviderProps) {
    const [numDelegators, setNumDelegators] = useState<number | null>(null)
    const [mostRecentDistributions, setMostRecentDistributions] = useState<Distribution[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Use a default process ID if none provided (using APUS as default)
    const defaultProcessId = processId || PROCESS_IDS.AUTONOMOUS_FINANCE.FAIR_LAUNCH_PROCESSES.APUS

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            const service = FLPDataService.autoConfiguration(defaultProcessId)

            // Fetch all data concurrently
            const [delegatorsCount, distributions] = await Promise.all([
                service.getNumDelegators(),
                service.getMostRecentDistributions()
            ])

            setNumDelegators(delegatorsCount)
            setMostRecentDistributions(distributions)
        } catch (err) {
            console.error('Failed to fetch FLP data:', err)
            setError('Failed to fetch FLP data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [defaultProcessId])

    const retryFetch = () => {
        setNumDelegators(null)
        setMostRecentDistributions([])
        setError(null)
        setLoading(true)
        fetchData()
    }

    const contextValue: FLPDataContextType = {
        numDelegators,
        mostRecentDistributions,
        loading,
        error,
        retryFetch
    }

    return (
        <FLPDataContext.Provider value={contextValue}>
            {children}
        </FLPDataContext.Provider>
    )
}