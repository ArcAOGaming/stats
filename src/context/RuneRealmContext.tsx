import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { Subscription } from 'rxjs'
import { PurchaseOption } from 'ao-js-sdk'
import {
    RuneRealmService,
    RuneRealmDataPoint,
    AggregatedRuneRealmData,
    RuneRealmStats,
    transformCreditToDataPoint,
    aggregateDataByTime,
    calculateRuneRealmStats
} from '../pages/RuneRealm/runeRealmService'

interface RuneRealmContextType {
    dataPointsByOption: Map<PurchaseOption, RuneRealmDataPoint[]>
    aggregatedDataByOption: Map<PurchaseOption, AggregatedRuneRealmData[]>
    statsByOption: Map<PurchaseOption, RuneRealmStats>
    loading: boolean
    error: string | null
    isConnected: boolean
    retryConnection: () => void
}

const RuneRealmContext = createContext<RuneRealmContextType | undefined>(undefined)

export function useRuneRealmContext(): RuneRealmContextType {
    const context = useContext(RuneRealmContext)
    if (!context) {
        throw new Error('useRuneRealmContext must be used within a RuneRealmProvider')
    }
    return context
}

interface RuneRealmProviderProps {
    children: React.ReactNode
}

export function RuneRealmProvider({ children }: RuneRealmProviderProps) {
    const [dataPointsByOption, setDataPointsByOption] = useState<Map<PurchaseOption, RuneRealmDataPoint[]>>(new Map())
    const [aggregatedDataByOption, setAggregatedDataByOption] = useState<Map<PurchaseOption, AggregatedRuneRealmData[]>>(new Map())
    const [statsByOption, setStatsByOption] = useState<Map<PurchaseOption, RuneRealmStats>>(new Map())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const subscriptionsRef = useRef<Map<PurchaseOption, Subscription>>(new Map())

    const startStreams = () => {
        try {
            setLoading(true)
            setError(null)

            // Clear existing subscriptions
            subscriptionsRef.current.forEach(sub => sub.unsubscribe())
            subscriptionsRef.current.clear()

            const service = RuneRealmService.getInstance()

            // Use single call to get all purchase data streams at once
            const subscription = service.getAllPurchaseDataStreams().subscribe({
                next: (allData) => {
                    const newDataPointsByOption = new Map<PurchaseOption, RuneRealmDataPoint[]>()

                    // Process all purchase options data
                    allData.forEach(({ option, credits }) => {
                        const dataPoints = credits.map(credit => transformCreditToDataPoint(credit, option))
                        newDataPointsByOption.set(option, dataPoints)
                    })

                    setDataPointsByOption(newDataPointsByOption)
                    setIsConnected(true)
                    setLoading(false)
                },
                error: (err) => {
                    console.error('RuneRealm stream error:', err)
                    setError('Failed to connect to RuneRealm data streams')
                    setIsConnected(false)
                    setLoading(false)
                },
                complete: () => {
                    console.log('RuneRealm streams completed')
                    setIsConnected(false)
                }
            })

            subscriptionsRef.current.set(PurchaseOption.AO, subscription) // Use AO as a key for the single subscription
        } catch (err) {
            console.error('Failed to start RuneRealm streams:', err)
            setError('Failed to initialize RuneRealm data streams')
            setLoading(false)
        }
    }

    // Update aggregated data and stats when dataPoints change
    useEffect(() => {
        const newAggregatedData = new Map<PurchaseOption, AggregatedRuneRealmData[]>()
        const newStats = new Map<PurchaseOption, RuneRealmStats>()

        dataPointsByOption.forEach((dataPoints, option) => {
            if (dataPoints.length > 0) {
                const aggregated = aggregateDataByTime(dataPoints, 3600000) // 1 hour intervals
                const stats = calculateRuneRealmStats(dataPoints)

                newAggregatedData.set(option, aggregated)
                newStats.set(option, stats)
            }
        })

        setAggregatedDataByOption(newAggregatedData)
        setStatsByOption(newStats)
    }, [dataPointsByOption])

    useEffect(() => {
        startStreams()

        // Cleanup subscriptions on unmount
        return () => {
            subscriptionsRef.current.forEach(sub => sub.unsubscribe())
            subscriptionsRef.current.clear()
        }
    }, [])

    const retryConnection = () => {
        setDataPointsByOption(new Map())
        setAggregatedDataByOption(new Map())
        setStatsByOption(new Map())
        setError(null)
        setLoading(true)
        startStreams()
    }

    const contextValue: RuneRealmContextType = {
        dataPointsByOption,
        aggregatedDataByOption,
        statsByOption,
        loading,
        error,
        isConnected,
        retryConnection
    }

    return (
        <RuneRealmContext.Provider value={contextValue}>
            {children}
        </RuneRealmContext.Provider>
    )
}
