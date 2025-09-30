import { useState, useCallback, ReactNode, useEffect } from 'react'
import { PortfolioService, ArweaveDataService, ICurrencyAmount } from 'ao-js-sdk'
import { PortfolioSearchContext, type PortfolioSearchContextType, type PortfolioData, type PortfolioValueState } from './createPortfolioSearchContext'

const createInitialValueState = (initialValue: string | number): PortfolioValueState => ({
    value: initialValue,
    loading: false,
    error: null,
    lastUpdated: null
})

export function PortfolioSearchProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<PortfolioData>({
        usdWorth: createInitialValueState('0'),
        aoWorth: createInitialValueState('0'),
        arweaveBalance: createInitialValueState(0),
        lastUpdated: new Date(),
        loading: false,
        error: null
    })

    const [currentWallet, setCurrentWallet] = useState<string | null>(null)
    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

    const updateValueState = useCallback((
        field: 'usdWorth' | 'aoWorth' | 'arweaveBalance',
        updates: Partial<PortfolioValueState>
    ) => {
        setState(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                ...updates,
                lastUpdated: new Date()
            },
            lastUpdated: new Date()
        }))
    }, [])

    const calculatePortfolio = useCallback(async (walletAddress: string) => {
        // Set overall loading state
        setState(prev => ({ ...prev, loading: true, error: null }))
        setCurrentWallet(walletAddress)

        // Set individual loading states
        updateValueState('usdWorth', { loading: true, error: null })
        updateValueState('aoWorth', { loading: true, error: null })
        updateValueState('arweaveBalance', { loading: true, error: null })

        try {
            // Initialize services
            const portfolioService = await PortfolioService.autoConfiguration()
            const arweaveDataService = ArweaveDataService.autoConfiguration()

            // Handle Arweave balance separately
            try {
                const arweaveBalance = await arweaveDataService.getWalletBalance(walletAddress)
                updateValueState('arweaveBalance', {
                    value: arweaveBalance,
                    loading: false,
                    error: null
                })
            } catch (error) {
                console.error('Arweave balance error:', error)
                updateValueState('arweaveBalance', {
                    loading: false,
                    error: 'Failed to fetch Arweave balance'
                })
            }

            // Get portfolio
            const portfolio$ = portfolioService.getPortfolio$(walletAddress)

            // Calculate USD worth
            try {
                const usdWorth$ = portfolioService.calculatePortfolioWorthUSD$(portfolio$)
                usdWorth$.subscribe({
                    next: (amount: ICurrencyAmount) => {
                        try {
                            const amountValue = amount.amount()
                            const usdValue = (Number(amountValue) / 1000000).toString()
                            updateValueState('usdWorth', {
                                value: usdValue,
                                loading: false,
                                error: null
                            })
                        } catch (parseError) {
                            console.error('USD amount parsing error:', parseError)
                            updateValueState('usdWorth', {
                                value: '0',
                                loading: false,
                                error: null
                            })
                        }
                    },
                    error: (error) => {
                        console.error('USD calculation error:', error)
                        updateValueState('usdWorth', {
                            loading: false,
                            error: 'Failed to calculate USD worth'
                        })
                    }
                })
            } catch (error) {
                console.error('USD worth subscription error:', error)
                updateValueState('usdWorth', {
                    loading: false,
                    error: 'Failed to subscribe to USD worth calculation'
                })
            }

            // Calculate AO worth
            try {
                const aoWorth$ = portfolioService.calculatePortfolioWorthAO$(portfolio$)
                aoWorth$.subscribe({
                    next: (amount: ICurrencyAmount) => {
                        try {
                            const amountValue = amount.amount()
                            const aoValue = (Number(amountValue) / 1000000).toString()
                            updateValueState('aoWorth', {
                                value: aoValue,
                                loading: false,
                                error: null
                            })
                        } catch (parseError) {
                            console.error('AO amount parsing error:', parseError)
                            updateValueState('aoWorth', {
                                value: '0',
                                loading: false,
                                error: null
                            })
                        }
                    },
                    error: (error) => {
                        console.error('AO calculation error:', error)
                        updateValueState('aoWorth', {
                            loading: false,
                            error: 'Failed to calculate AO worth'
                        })
                    }
                })
            } catch (error) {
                console.error('AO worth subscription error:', error)
                updateValueState('aoWorth', {
                    loading: false,
                    error: 'Failed to subscribe to AO worth calculation'
                })
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to initialize portfolio services'
            console.error('Portfolio calculation initialization error:', error)

            // Update all values with error state
            updateValueState('usdWorth', { loading: false, error: errorMessage })
            updateValueState('aoWorth', { loading: false, error: errorMessage })
            updateValueState('arweaveBalance', { loading: false, error: errorMessage })

            setState(prev => ({ ...prev, error: errorMessage, loading: false }))
        }

        // Set overall loading to false after initial setup
        setState(prev => ({ ...prev, loading: false }))
    }, [updateValueState])

    const refreshPortfolio = useCallback(async () => {
        if (currentWallet) {
            await calculatePortfolio(currentWallet)
        }
    }, [currentWallet, calculatePortfolio])

    const clearPortfolio = useCallback(() => {
        setState({
            usdWorth: createInitialValueState('0'),
            aoWorth: createInitialValueState('0'),
            arweaveBalance: createInitialValueState(0),
            lastUpdated: new Date(),
            loading: false,
            error: null
        })
        setCurrentWallet(null)
        if (refreshInterval) {
            clearInterval(refreshInterval)
            setRefreshInterval(null)
        }
    }, [refreshInterval])

    // Auto-refresh every 30 seconds when wallet is set
    useEffect(() => {
        if (currentWallet) {
            const interval = setInterval(() => {
                refreshPortfolio()
            }, 30000)

            setRefreshInterval(interval)

            return () => {
                clearInterval(interval)
            }
        } else {
            if (refreshInterval) {
                clearInterval(refreshInterval)
                setRefreshInterval(null)
            }
        }
    }, [currentWallet, refreshPortfolio])

    const value: PortfolioSearchContextType = {
        ...state,
        calculatePortfolio,
        clearPortfolio,
        refreshPortfolio
    }

    return (
        <PortfolioSearchContext.Provider value={value}>
            {children}
        </PortfolioSearchContext.Provider>
    )
}