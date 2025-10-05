import { useState, useCallback, ReactNode, useEffect, useRef } from 'react'
import { RANDAOStatsService, type TimePeriod, type TimeBasedRandomnessData } from '../randaoStatsService'
import { RandAOStatsContext, type RandAOStatsContextType } from './createRandAOStatsContext'
import { Subscription } from 'rxjs'

interface RandAOStatsState {
    totalRandomnessCreated: bigint | null
    timeBasedData: TimeBasedRandomnessData[]
    selectedTimePeriod: TimePeriod
    loading: boolean
    error: string | null
    observableCompleted: boolean
}

export function RandAOStatsProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<RandAOStatsState>({
        totalRandomnessCreated: null,
        timeBasedData: [],
        selectedTimePeriod: 'daily',
        loading: false,
        error: null,
        observableCompleted: false
    })

    const timeDataSubscriptionRef = useRef<Subscription | null>(null)
    const initializedRef = useRef(false)

    const fetchTotalRandomness = useCallback(async () => {
        if (state.totalRandomnessCreated !== null) {
            console.log('RandAOStatsContext: Total randomness already fetched, skipping')
            return
        }

        console.log('RandAOStatsContext: Starting to fetch total randomness')
        setState(prev => ({ ...prev, loading: true, error: null }))

        try {
            const total = await RANDAOStatsService.getTotalRandomnessCreated()
            console.log('RandAOStatsContext: Successfully fetched total randomness:', total)
            setState(prev => ({ ...prev, totalRandomnessCreated: total, loading: false }))
        } catch (error) {
            console.error('RandAOStatsContext: Error fetching total randomness:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch total randomness'
            setState(prev => ({
                ...prev,
                error: errorMessage,
                loading: false
            }))
        }
    }, [state.totalRandomnessCreated])

    const fetchTimeBasedData = useCallback(async (period: TimePeriod) => {
        console.log(`RandAOStatsContext: Starting to fetch time-based data for period: ${period}`)

        // Clean up existing subscription
        if (timeDataSubscriptionRef.current) {
            console.log('RandAOStatsContext: Cleaning up existing subscription')
            timeDataSubscriptionRef.current.unsubscribe()
            timeDataSubscriptionRef.current = null
        }

        setState(prev => ({
            ...prev,
            loading: true,
            error: null,
            selectedTimePeriod: period,
            observableCompleted: false, // Reset completion state
            timeBasedData: [] // Clear previous data to prevent confusion
        }))

        try {
            console.log('RandAOStatsContext: Creating stream subscription')
            // Use the stream approach since data comes back accumulated
            const subscription = RANDAOStatsService.getRandomnessOverTimeStream(period).subscribe({
                next: (data) => {
                    console.log('RandAOStatsContext: Received stream data:', data)
                    console.log('RandAOStatsContext: Data length:', data.length)
                    console.log('RandAOStatsContext: First few entries:', data.slice(0, 3))

                    setState(prev => ({
                        ...prev,
                        timeBasedData: data,
                        loading: false // Data is coming in, not loading anymore
                    }))
                },
                error: (error) => {
                    console.error('RandAOStatsContext: Stream error:', error)
                    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch time-based data'
                    setState(prev => ({
                        ...prev,
                        error: errorMessage,
                        loading: false,
                        observableCompleted: true // Error means we're done trying
                    }))
                },
                complete: () => {
                    console.log('RandAOStatsContext: Stream completed')
                    setState(prev => ({
                        ...prev,
                        observableCompleted: true,
                        loading: false
                    }))
                }
            })

            console.log('RandAOStatsContext: Subscription created successfully')
            timeDataSubscriptionRef.current = subscription
        } catch (error) {
            console.error('RandAOStatsContext: Error creating stream:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch time-based data'
            setState(prev => ({
                ...prev,
                error: errorMessage,
                loading: false,
                observableCompleted: true
            }))
        }
    }, [])

    const setTimePeriod = useCallback((period: TimePeriod) => {
        console.log(`RandAOStatsContext: Setting time period to: ${period}, current: ${state.selectedTimePeriod}`)
        if (period === state.selectedTimePeriod) {
            console.log('RandAOStatsContext: Same period selected, skipping fetch')
            return
        }
        fetchTimeBasedData(period)
    }, [state.selectedTimePeriod, fetchTimeBasedData])

    const clearData = useCallback(() => {
        console.log('RandAOStatsContext: Clearing all data')
        // Clean up subscription
        if (timeDataSubscriptionRef.current) {
            timeDataSubscriptionRef.current.unsubscribe()
            timeDataSubscriptionRef.current = null
        }

        setState({
            totalRandomnessCreated: null,
            timeBasedData: [],
            selectedTimePeriod: 'daily',
            loading: false,
            error: null,
            observableCompleted: false
        })
    }, [])

    // Initialize data only once on mount
    useEffect(() => {
        if (!initializedRef.current) {
            console.log('RandAOStatsContext: Initializing context data')
            initializedRef.current = true
            fetchTotalRandomness()

            // Use a small delay to ensure service is fully ready
            setTimeout(() => {
                fetchTimeBasedData('daily')
            }, 100)
        }
    }, [fetchTotalRandomness, fetchTimeBasedData])

    // Clean up subscription on unmount
    useEffect(() => {
        return () => {
            console.log('RandAOStatsContext: Component unmounting, cleaning up subscription')
            if (timeDataSubscriptionRef.current) {
                timeDataSubscriptionRef.current.unsubscribe()
            }
        }
    }, [])

    // Debug logging for state changes
    useEffect(() => {
        console.log('RandAOStatsContext: State updated:', {
            totalRandomnessCreated: state.totalRandomnessCreated,
            timeBasedDataLength: state.timeBasedData.length,
            selectedTimePeriod: state.selectedTimePeriod,
            loading: state.loading,
            error: state.error,
            observableCompleted: state.observableCompleted
        })
    }, [state])

    const value: RandAOStatsContextType = {
        ...state,
        fetchTotalRandomness,
        fetchTimeBasedData,
        setTimePeriod,
        clearData
    }

    return (
        <RandAOStatsContext.Provider value={value}>
            {children}
        </RandAOStatsContext.Provider>
    )
}