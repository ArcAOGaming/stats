import { RandAOStatsService } from 'ao-js-sdk'
import { RandomStatsTimeEntry, IRandAOStatsService } from 'ao-js-sdk/src/services/randao/randao-stats-service/abstract'
import { Observable, firstValueFrom } from 'rxjs'

// Export TimePeriod type for use in other files
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface TimeBasedRandomnessData {
    timestamp: number
    randomnessCreated: number // Using number for chart compatibility
    period: string
}

/**
 * Service wrapper for fetching RANDAO statistics data with singleton pattern
 */
export class RANDAOStatsService {
    private static instance: IRandAOStatsService | null = null
    private static instancePromise: Promise<IRandAOStatsService> | null = null

    /**
     * Get singleton instance of the RandAOStatsService
     */
    private static async getInstance(): Promise<IRandAOStatsService> {
        if (this.instance) {
            console.log('RANDAOStatsService: Using existing instance')
            return this.instance
        }

        if (this.instancePromise) {
            console.log('RANDAOStatsService: Waiting for existing instance promise')
            return this.instancePromise
        }

        console.log('RANDAOStatsService: Creating new instance')
        this.instancePromise = RandAOStatsService.autoConfiguration()
        this.instance = await this.instancePromise
        console.log('RANDAOStatsService: Instance created successfully')
        return this.instance
    }

    /**
     * Get total randomness created
     * @returns Promise<bigint> total randomness created
     */
    public static async getTotalRandomnessCreated(): Promise<bigint> {
        try {
            console.log('RANDAOStatsService: Fetching total randomness created')
            const service = await this.getInstance()
            const result = await service.getTotalRandomnessCreated()
            console.log('RANDAOStatsService: Total randomness created result:', result)
            return result
        } catch (error) {
            console.error('RANDAOStatsService: Error fetching total randomness:', error)
            throw error
        }
    }

    /**
     * Get randomness created for a specific time period using actual RandAOStatsService methods
     * @param period - time period (daily, weekly, monthly, yearly)
     * @returns Promise with time-based randomness data
     */
    public static async getRandomnessOverTime(
        period: TimePeriod
    ): Promise<TimeBasedRandomnessData[]> {
        try {
            console.log(`RANDAOStatsService: Fetching randomness over time for period: ${period}`)
            const service = await this.getInstance()
            let observable: Observable<RandomStatsTimeEntry[]>

            // Use the appropriate method based on period
            switch (period) {
                case 'daily':
                    console.log('RANDAOStatsService: Using getRandomCreatedOverTimeDaily$()')
                    observable = service.getRandomCreatedOverTimeDaily$()
                    break
                case 'weekly':
                    console.log('RANDAOStatsService: Using getRandomCreatedOverTimeWeekly$()')
                    observable = service.getRandomCreatedOverTimeWeekly$()
                    break
                case 'monthly':
                    console.log('RANDAOStatsService: Using getRandomCreatedOverTimeMonthly$()')
                    observable = service.getRandomCreatedOverTimeMonthly$()
                    break
                case 'yearly':
                    console.log('RANDAOStatsService: Using getRandomCreatedOverTimeYearly$()')
                    observable = service.getRandomCreatedOverTimeYearly$()
                    break
                default:
                    console.log('RANDAOStatsService: Using default getRandomCreatedOverTimeDaily$()')
                    observable = service.getRandomCreatedOverTimeDaily$()
            }

            console.log('RANDAOStatsService: Observable created, waiting for first value...')
            // Convert Observable to Promise and get the final accumulated array
            const entries = await firstValueFrom(observable)
            console.log('RANDAOStatsService: Received entries:', entries)
            console.log('RANDAOStatsService: Number of entries:', entries.length)

            // Transform to our interface format
            const transformedData = entries.map(entry => ({
                timestamp: entry.date.getTime(),
                randomnessCreated: entry.count,
                period: period
            }))

            console.log('RANDAOStatsService: Transformed data:', transformedData)
            return transformedData
        } catch (error) {
            console.error(`RANDAOStatsService: Error fetching randomness over time for ${period}:`, error)
            throw error
        }
    }

    /**
     * Get randomness data stream for a specific time period
     * @param period - time period (daily, weekly, monthly, yearly)
     * @returns Observable stream of accumulated time-based data
     */
    public static getRandomnessOverTimeStream(
        period: TimePeriod
    ): Observable<TimeBasedRandomnessData[]> {
        console.log(`RANDAOStatsService: Creating stream for period: ${period}`)

        return new Observable(subscriber => {
            this.getInstance().then(service => {
                console.log('RANDAOStatsService: Service instance obtained for stream')
                let observable: Observable<RandomStatsTimeEntry[]>

                switch (period) {
                    case 'daily':
                        console.log('RANDAOStatsService: Stream using getRandomCreatedOverTimeDaily$()')
                        observable = service.getRandomCreatedOverTimeDaily$()
                        break
                    case 'weekly':
                        console.log('RANDAOStatsService: Stream using getRandomCreatedOverTimeWeekly$()')
                        observable = service.getRandomCreatedOverTimeWeekly$()
                        break
                    case 'monthly':
                        console.log('RANDAOStatsService: Stream using getRandomCreatedOverTimeMonthly$()')
                        observable = service.getRandomCreatedOverTimeMonthly$()
                        break
                    case 'yearly':
                        console.log('RANDAOStatsService: Stream using getRandomCreatedOverTimeYearly$()')
                        observable = service.getRandomCreatedOverTimeYearly$()
                        break
                    default:
                        console.log('RANDAOStatsService: Stream using default getRandomCreatedOverTimeDaily$()')
                        observable = service.getRandomCreatedOverTimeDaily$()
                }

                console.log('RANDAOStatsService: Subscribing to observable stream')
                observable.subscribe({
                    next: (entries) => {
                        console.log('RANDAOStatsService: Stream received entries:', entries)
                        console.log('RANDAOStatsService: Stream entries count:', entries.length)

                        const transformedData = entries.map(entry => ({
                            timestamp: entry.date.getTime(),
                            randomnessCreated: entry.count,
                            period: period
                        }))

                        console.log('RANDAOStatsService: Stream transformed data:', transformedData)
                        subscriber.next(transformedData)
                    },
                    error: (err) => {
                        console.error('RANDAOStatsService: Stream error:', err)
                        subscriber.error(err)
                    },
                    complete: () => {
                        console.log('RANDAOStatsService: Stream completed')
                        subscriber.complete()
                    }
                })
            }).catch(err => {
                console.error('RANDAOStatsService: Error getting instance for stream:', err)
                subscriber.error(err)
            })
        })
    }
}