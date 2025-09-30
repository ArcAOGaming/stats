import { PortfolioService, ArweaveDataService, ICurrencyAmount } from 'ao-js-sdk'
import { Observable, BehaviorSubject, combineLatest, interval } from 'rxjs'
import { switchMap, startWith, catchError } from 'rxjs/operators'

export interface PortfolioData {
    usdWorth: number
    aoWorth: number
    arweaveBalance: number
    lastUpdated: Date
    loading: boolean
    error: string | null
}

export class WalletPortfolioService {
    private static instance: WalletPortfolioService
    private portfolioService: Awaited<ReturnType<typeof PortfolioService.autoConfiguration>> | null = null
    private arweaveDataService: ReturnType<typeof ArweaveDataService.autoConfiguration> | null = null
    private walletSubject = new BehaviorSubject<string | null>(null)
    private portfolioData = new BehaviorSubject<PortfolioData>({
        usdWorth: 0,
        aoWorth: 0,
        arweaveBalance: 0,
        lastUpdated: new Date(),
        loading: false,
        error: null
    })

    private constructor() {
        this.init()
    }

    static getInstance(): WalletPortfolioService {
        if (!WalletPortfolioService.instance) {
            WalletPortfolioService.instance = new WalletPortfolioService()
        }
        return WalletPortfolioService.instance
    }

    private async init() {
        try {
            this.portfolioService = await PortfolioService.autoConfiguration()
            this.arweaveDataService = ArweaveDataService.autoConfiguration()
            this.setupPortfolioStream()
        } catch (error) {
            console.error('Failed to initialize portfolio service:', error)
        }
    }

    private setupPortfolioStream() {
        // Update every 30 seconds when wallet is set
        const updateInterval$ = interval(30000).pipe(startWith(0))

        combineLatest([this.walletSubject, updateInterval$]).pipe(
            switchMap(([walletAddress]) => {
                if (!walletAddress || !this.portfolioService || !this.arweaveDataService) {
                    return new Observable<PortfolioData>(subscriber => {
                        subscriber.next({
                            usdWorth: 0,
                            aoWorth: 0,
                            arweaveBalance: 0,
                            lastUpdated: new Date(),
                            loading: false,
                            error: null
                        })
                    })
                }

                return this.calculatePortfolioWorth(walletAddress)
            }),
            catchError(error => {
                console.error('Portfolio calculation error:', error)
                return new Observable<PortfolioData>(subscriber => {
                    subscriber.next({
                        ...this.portfolioData.value,
                        loading: false,
                        error: error.message || 'Failed to calculate portfolio worth'
                    })
                })
            })
        ).subscribe(data => {
            this.portfolioData.next(data)
        })
    }

    private calculatePortfolioWorth(walletAddress: string): Observable<PortfolioData> {
        return new Observable<PortfolioData>(subscriber => {
            const calculateAsync = async () => {
                try {
                    this.portfolioData.next({
                        ...this.portfolioData.value,
                        loading: true,
                        error: null
                    })

                    // Get portfolio
                    const portfolio$ = this.portfolioService!.getPortfolio$(walletAddress)

                    // Calculate USD worth
                    const usdWorth$ = this.portfolioService!.calculatePortfolioWorthUSD$(portfolio$)

                    // Calculate AO worth
                    const aoWorth$ = this.portfolioService!.calculatePortfolioWorthAO$(portfolio$)

                    // Get Arweave balance
                    const arweaveBalance = await this.arweaveDataService!.getWalletBalance(walletAddress)

                    // Subscribe to the observables and get current values
                    let usdWorth = 0
                    let aoWorth = 0

                    usdWorth$.subscribe(amount => {
                        try {
                            usdWorth = Number((amount as ICurrencyAmount).amount()) / 1000000 // Convert from micro units
                        } catch {
                            usdWorth = 0
                        }
                        subscriber.next({
                            usdWorth,
                            aoWorth,
                            arweaveBalance,
                            lastUpdated: new Date(),
                            loading: false,
                            error: null
                        })
                    })

                    aoWorth$.subscribe(amount => {
                        try {
                            aoWorth = Number((amount as ICurrencyAmount).amount()) / 1000000 // Convert from micro units
                        } catch {
                            aoWorth = 0
                        }
                        subscriber.next({
                            usdWorth,
                            aoWorth,
                            arweaveBalance,
                            lastUpdated: new Date(),
                            loading: false,
                            error: null
                        })
                    })

                } catch (error) {
                    subscriber.next({
                        usdWorth: 0,
                        aoWorth: 0,
                        arweaveBalance: 0,
                        lastUpdated: new Date(),
                        loading: false,
                        error: error instanceof Error ? error.message : 'Failed to calculate portfolio'
                    })
                }
            }

            calculateAsync()
        })
    }

    setWallet(walletAddress: string | null) {
        this.walletSubject.next(walletAddress)
    }

    getPortfolioData$(): Observable<PortfolioData> {
        return this.portfolioData.asObservable()
    }

    getCurrentPortfolioData(): PortfolioData {
        return this.portfolioData.value
    }
}

export const portfolioService = WalletPortfolioService.getInstance()