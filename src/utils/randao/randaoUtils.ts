import { CreditNotice } from 'ao-js-sdk/src/services/credit-notices/abstract/types'

/**
 * Represents processed RANDAO data point for visualization
 */
export interface RANDAODataPoint {
    timestamp: number
    quantity: number
    blockTimeStamp: number
    id: string
}

/**
 * Aggregated data for time-based visualization
 */
export interface AggregatedRANDAOData {
    timestamp: number
    cumulativeQuantity: number
    count: number
}

/**
 * Statistics for RANDAO data
 */
export interface RANDAOStats {
    totalQuantity: number
    totalTransactions: number
    averageQuantity: number
    minQuantity: number
    maxQuantity: number
    latestQuantity: number
    firstTimestamp: number | null
    latestTimestamp: number | null
    mrr: number // Monthly Recurring Revenue in AO
    arr: number // Annual Recurring Revenue in AO
}

/**
 * Transform credit notice to RANDAO data point
 */
export function transformCreditNoticeToDataPoint(creditNotice: CreditNotice): RANDAODataPoint | null {
    if (!creditNotice.blockTimeStamp || !creditNotice.quantity) {
        return null
    }

    const quantity = parseFloat(creditNotice.quantity)
    if (isNaN(quantity) || quantity <= 0) {
        return null
    }

    return {
        timestamp: creditNotice.blockTimeStamp * 1000, // Convert to milliseconds
        quantity,
        blockTimeStamp: creditNotice.blockTimeStamp,
        id: creditNotice.id
    }
}

/**
 * Aggregate data points by time intervals for cumulative visualization
 */
export function aggregateDataByTime(dataPoints: RANDAODataPoint[], intervalMs: number = 3600000): AggregatedRANDAOData[] {
    if (dataPoints.length === 0) return []

    // Sort by timestamp
    const sortedData = [...dataPoints].sort((a, b) => a.timestamp - b.timestamp)

    const aggregated: Map<number, { quantity: number; count: number }> = new Map()

    for (const point of sortedData) {
        // Round timestamp to interval
        const intervalTimestamp = Math.floor(point.timestamp / intervalMs) * intervalMs

        if (!aggregated.has(intervalTimestamp)) {
            aggregated.set(intervalTimestamp, { quantity: 0, count: 0 })
        }

        const current = aggregated.get(intervalTimestamp)!
        current.quantity += point.quantity
        current.count += 1
    }

    // Convert to array and add cumulative data
    const result: AggregatedRANDAOData[] = []
    let runningTotal = 0

    for (const [timestamp, data] of Array.from(aggregated.entries()).sort(([a], [b]) => a - b)) {
        runningTotal += data.quantity
        result.push({
            timestamp,
            cumulativeQuantity: runningTotal,
            count: data.count
        })
    }

    return result
}

/**
 * Calculate statistics from RANDAO data points
 */
export function calculateRANDAOStats(dataPoints: RANDAODataPoint[]): RANDAOStats {
    if (dataPoints.length === 0) {
        return {
            totalQuantity: 0,
            totalTransactions: 0,
            averageQuantity: 0,
            minQuantity: 0,
            maxQuantity: 0,
            latestQuantity: 0,
            firstTimestamp: null,
            latestTimestamp: null,
            mrr: 0,
            arr: 0
        }
    }

    const quantities = dataPoints.map(d => d.quantity)
    const timestamps = dataPoints.map(d => d.timestamp)

    const totalQuantity = quantities.reduce((sum, q) => sum + q, 0)
    const sortedByTime = [...dataPoints].sort((a, b) => a.timestamp - b.timestamp)

    // Calculate MRR and ARR based on time period
    const firstTimestamp = Math.min(...timestamps)
    const latestTimestamp = Math.max(...timestamps)
    const timePeriodMs = latestTimestamp - firstTimestamp
    const timePeriodDays = timePeriodMs / (1000 * 60 * 60 * 24)

    // Convert total quantity to AO for revenue calculations
    const totalAO = totalQuantity / 1e12

    // Calculate daily revenue rate and extrapolate
    const dailyRevenue = timePeriodDays > 0 ? totalAO / timePeriodDays : 0
    const mrr = dailyRevenue * 30 // Monthly Recurring Revenue
    const arr = dailyRevenue * 365 // Annual Recurring Revenue

    return {
        totalQuantity,
        totalTransactions: dataPoints.length,
        averageQuantity: totalQuantity / dataPoints.length,
        minQuantity: Math.min(...quantities),
        maxQuantity: Math.max(...quantities),
        latestQuantity: sortedByTime[sortedByTime.length - 1]?.quantity || 0,
        firstTimestamp,
        latestTimestamp,
        mrr,
        arr
    }
}

/**
 * Format quantity for display (assuming AO token with 12 decimals)
 */
export function formatQuantity(quantity: number): string {

    const aoAmount = quantity / 1e12

    if (aoAmount >= 1e6) {
        return `${(aoAmount / 1e6).toFixed(2)}M AO`
    } else if (aoAmount >= 1e3) {
        return `${(aoAmount / 1e3).toFixed(2)}K AO`
    } else if (aoAmount >= 1) {
        return `${aoAmount.toFixed(2)} AO`
    } else {
        return `${(aoAmount).toFixed(2)} AO`
    }
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString()
}
