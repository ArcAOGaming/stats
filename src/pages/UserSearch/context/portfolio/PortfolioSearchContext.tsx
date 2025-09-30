import { useState, useCallback, ReactNode, useEffect } from 'react'
import { PortfolioService, ArweaveDataService, ICurrencyAmount } from 'ao-js-sdk'
import { PortfolioSearchContext, type PortfolioSearchContextType, type PortfolioData } from './createPortfolioSearchContext'

export function PortfolioSearchProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<PortfolioData>({
        usdWorth: '0',
        aoWorth: '0',
        arweaveBalance: 0,
        lastUpdated: new Date(),
        loading: false,
        error: null
    })

    const [currentWallet, setCurrentWallet] = useState<string | null>(null)
    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

    const calculatePortfolio = useCallback(async (walletAddress: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }))
        setCurrentWallet(walletAddress)

        try {
            // Initialize services
            const portfolioService = await PortfolioService.autoConfiguration()
            const arweaveDataService = ArweaveDataService.autoConfiguration()

            // Get Arweave balance
            const arweaveBalance = await arweaveDataService.getWalletBalance(walletAddress)

            // Get portfolio
            const portfolio$ = portfolioService.getPortfolio$(walletAddress)

            // Calculate worth
            const usdWorth$ = portfolioService.calculatePortfolioWorthUSD$(portfolio$)
            const aoWorth$ = portfolioService.calculatePortfolioWorthAO$(portfolio$)

            // Subscribe to observables
            let usdWorth = '0'
            let aoWorth = '0'

            usdWorth$.subscribe({
                next: (amount: ICurrencyAmount) => {
                    try {
                        const amountValue = amount.amount()
                        usdWorth = (Number(amountValue) / 1000000).toString()
                    } catch {
                        usdWorth = '0'
                    }

                    setState({
                        usdWorth,
                        aoWorth,
                        arweaveBalance,
                        lastUpdated: new Date(),
                        loading: false,
                        error: null
                    })
                },
                error: (error) => {
                    console.error('USD calculation error:', error)
                    setState(prev => ({
                        ...prev,
                        loading: false,
                        error: 'Failed to calculate USD worth'
                    }))
                }
            })

            aoWorth$.subscribe({
                next: (amount: ICurrencyAmount) => {
                    try {
                        const amountValue = amount.amount()
                        aoWorth = (Number(amountValue) / 1000000).toString()
                    } catch {
                        aoWorth = '0'
                    }

                    setState({
                        usdWorth,
                        aoWorth,
                        arweaveBalance,
                        lastUpdated: new Date(),
                        loading: false,
                        error: null
                    })
                },
                error: (error) => {
                    console.error('AO calculation error:', error)
                    setState(prev => ({
                        ...prev,
                        loading: false,
                        error: 'Failed to calculate AO worth'
                    }))
                }
            })

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to calculate portfolio'
            setState(prev => ({ ...prev, error: errorMessage, loading: false }))
        }
    }, [])

    const refreshPortfolio = useCallback(async () => {
        if (currentWallet) {
            await calculatePortfolio(currentWallet)
        }
    }, [currentWallet, calculatePortfolio])

    const clearPortfolio = useCallback(() => {
        setState({
            usdWorth: '0',
            aoWorth: '0',
            arweaveBalance: 0,
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