import { Observable, map, catchError, of } from 'rxjs'
import { EternalPassPurchaseDataService, PurchaseOption } from 'ao-js-sdk'
import { ICredit } from 'ao-js-sdk'

export interface RuneRealmDataPoint {
    id: string
    timestamp: number
    quantity: number
    purchaseOption: PurchaseOption
    accountCredited: string
    accountDebited: string
    fromProcess: string
}

export interface AggregatedRuneRealmData {
    timestamp: number
    quantity: number
    cumulativeQuantity: number
    count: number
    purchaseOption: PurchaseOption
}

export interface RuneRealmStats {
    totalQuantity: number
    totalTransactions: number
    averageQuantity: number
    minQuantity: number
    maxQuantity: number
    latestQuantity: number
    latestTimestamp: number | null
    uniqueClients: number
    mrr: number
    arr: number
}

export class RuneRealmService {
    private static instance: RuneRealmService
    private eternalPassService: typeof EternalPassPurchaseDataService

    private constructor() {
        this.eternalPassService = EternalPassPurchaseDataService
    }

    public static getInstance(): RuneRealmService {
        if (!RuneRealmService.instance) {
            RuneRealmService.instance = new RuneRealmService()
        }
        return RuneRealmService.instance
    }

    /**
     * Gets purchase data stream for a specific purchase option
     */
    public getPurchaseDataStream(purchaseOption: PurchaseOption): Observable<ICredit[]> {
        try {
            const service = this.eternalPassService.autoConfiguration()
            return service.getPurchaseDataFromProcess$(purchaseOption).pipe(
                catchError(error => {
                    console.error(`Error fetching purchase data for ${PurchaseOption[purchaseOption]}:`, error)
                    return of([])
                })
            )
        } catch (error) {
            console.error(`Failed to initialize service for ${PurchaseOption[purchaseOption]}:`, error)
            return of([])
        }
    }

    /**
     * Gets purchase data for all purchase options
     */
    public getAllPurchaseDataStreams(): Observable<{ option: PurchaseOption; credits: ICredit[] }[]> {
        const options = Object.values(PurchaseOption).filter(v => typeof v === 'number') as PurchaseOption[]

        const streams = options.map(option =>
            this.getPurchaseDataStream(option).pipe(
                map(credits => ({ option, credits }))
            )
        )

        // Combine all streams
        return new Observable(subscriber => {
            const results: { option: PurchaseOption; credits: ICredit[] }[] = []
            let completed = 0

            streams.forEach((stream, index) => {
                stream.subscribe({
                    next: (data) => {
                        results[index] = data
                        if (results.filter(r => r !== undefined).length === streams.length) {
                            subscriber.next(results)
                        }
                    },
                    error: (error) => {
                        console.error(`Stream error for option ${index}:`, error)
                        results[index] = { option: options[index], credits: [] }
                        completed++
                        if (completed === streams.length) {
                            subscriber.next(results)
                        }
                    },
                    complete: () => {
                        completed++
                        if (completed === streams.length) {
                            subscriber.complete()
                        }
                    }
                })
            })
        })
    }
}

/**
 * Transform credit to data point
 */
export function transformCreditToDataPoint(credit: ICredit, purchaseOption: PurchaseOption): RuneRealmDataPoint {
    const tokenBalance = credit.getTokenBalance()
    const currencyAmount = tokenBalance.getCurrencyAmount()

    return {
        id: credit.getId(),
        timestamp: credit.getTransactionDate().getTime(),
        quantity: currencyAmount.toNumber(),
        purchaseOption,
        accountCredited: credit.getAccountCredited(),
        accountDebited: credit.getAccountDebited(),
        fromProcess: credit.getFromProcess()
    }
}

/**
 * Aggregate data by time intervals
 */
export function aggregateDataByTime(
    dataPoints: RuneRealmDataPoint[],
    intervalMs: number = 3600000 // 1 hour default
): AggregatedRuneRealmData[] {
    if (dataPoints.length === 0) return []

    // Sort by timestamp
    const sortedPoints = [...dataPoints].sort((a, b) => a.timestamp - b.timestamp)

    // Group by time intervals and purchase option
    const groups = new Map<string, RuneRealmDataPoint[]>()

    for (const point of sortedPoints) {
        const intervalStart = Math.floor(point.timestamp / intervalMs) * intervalMs
        const key = `${intervalStart}-${point.purchaseOption}`

        if (!groups.has(key)) {
            groups.set(key, [])
        }
        groups.get(key)!.push(point)
    }

    // Convert to aggregated data
    const aggregated: AggregatedRuneRealmData[] = []
    const cumulativeByOption = new Map<PurchaseOption, number>()

    // Sort groups by timestamp
    const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
        const timestampA = parseInt(a[0].split('-')[0])
        const timestampB = parseInt(b[0].split('-')[0])
        return timestampA - timestampB
    })

    for (const [key, points] of sortedGroups) {
        const [timestampStr, optionStr] = key.split('-')
        const timestamp = parseInt(timestampStr)
        const purchaseOption = parseInt(optionStr) as PurchaseOption

        const quantity = points.reduce((sum, p) => sum + p.quantity, 0)
        const currentCumulative = cumulativeByOption.get(purchaseOption) || 0
        const newCumulative = currentCumulative + quantity
        cumulativeByOption.set(purchaseOption, newCumulative)

        aggregated.push({
            timestamp,
            quantity,
            cumulativeQuantity: newCumulative,
            count: points.length,
            purchaseOption
        })
    }

    return aggregated
}

/**
 * Calculate statistics for RuneRealm data
 */
export function calculateRuneRealmStats(dataPoints: RuneRealmDataPoint[]): RuneRealmStats {
    if (dataPoints.length === 0) {
        return {
            totalQuantity: 0,
            totalTransactions: 0,
            averageQuantity: 0,
            minQuantity: 0,
            maxQuantity: 0,
            latestQuantity: 0,
            latestTimestamp: null,
            uniqueClients: 0,
            mrr: 0,
            arr: 0
        }
    }

    const quantities = dataPoints.map(p => p.quantity)
    const totalQuantity = quantities.reduce((sum, q) => sum + q, 0)
    const totalTransactions = dataPoints.length
    const averageQuantity = totalQuantity / totalTransactions
    const minQuantity = Math.min(...quantities)
    const maxQuantity = Math.max(...quantities)

    // Sort by timestamp to get latest
    const sortedByTime = [...dataPoints].sort((a, b) => b.timestamp - a.timestamp)
    const latestQuantity = sortedByTime[0]?.quantity || 0
    const latestTimestamp = sortedByTime[0]?.timestamp || null

    // Calculate unique clients
    const uniqueClients = new Set(dataPoints.map(p => p.accountDebited)).size

    // Calculate MRR and ARR (simplified calculation)
    const now = Date.now()
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000)
    const recentTransactions = dataPoints.filter(p => p.timestamp >= oneMonthAgo)
    const monthlyRevenue = recentTransactions.reduce((sum, p) => sum + p.quantity, 0)
    const mrr = monthlyRevenue
    const arr = mrr * 12

    return {
        totalQuantity,
        totalTransactions,
        averageQuantity,
        minQuantity,
        maxQuantity,
        latestQuantity,
        latestTimestamp,
        uniqueClients,
        mrr,
        arr
    }
}

/**
 * Format quantity for display
 */
export function formatQuantity(quantity: number): string {
    if (quantity >= 1000000) {
        return `${(quantity / 1000000).toFixed(2)}M`
    } else if (quantity >= 1000) {
        return `${(quantity / 1000).toFixed(2)}K`
    }
    return quantity.toFixed(2)
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString()
}

/**
 * Get purchase option display name
 */
export function getPurchaseOptionDisplayName(option: PurchaseOption): string {
    return PurchaseOption[option]
}
