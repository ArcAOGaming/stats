/* eslint-disable @typescript-eslint/no-unused-vars */
import { PiDataService } from 'ao-js-sdk/dist/src/services/autonomous-finance/pi-data-service/PiDataService'
import type { FLPYieldHistoryEntry } from 'ao-js-sdk/dist/src/services/autonomous-finance/pi-data-service/abstract/responses'
import { firstValueFrom, lastValueFrom, scan, takeLast } from 'rxjs'
import { MIN_VALID_TIMESTAMP } from '../../constants'
import _ from 'lodash'
import { PROCESS_IDS } from 'ao-js-sdk'

// Export the FLP mapping directly from the SDK
export const FAIR_LAUNCH_PROCESSES = PROCESS_IDS.AUTONOMOUS_FINANCE.FAIR_LAUNCH_PROCESSES

// Find the GAME process ID
export const GAME_PROCESS_ID = Object.entries(FAIR_LAUNCH_PROCESSES)
  .find(([name]) => name === 'GAME')?.[1] || ''

/**
 * Fetches the latest FLP yield history data
 * @returns Promise that resolves with all aggregated FLP yield history entries
 */
export async function fetchFLPYieldHistory(): Promise<FLPYieldHistoryEntry[]> {
  const service = PiDataService.autoConfiguration()
  const observableHistory = service.getFLPYieldHistory()

  // Aggregate all emitted values into a single array
  const aggregatedHistory = observableHistory.pipe(
    scan((accumulator: FLPYieldHistoryEntry[], currentHistory: FLPYieldHistoryEntry[]) => {
      return [...accumulator, ...currentHistory]
    }, []),
    takeLast(1) // Take the final aggregated result
  )

  const history = await firstValueFrom(aggregatedHistory)
  return history
}


/**
 * Format AO value with 2 decimal places and preserve whole numbers
 * @param value The number to format
 * @returns Formatted string with 2 decimal places
 */
export function formatAO(value: number): string {
  // Convert to decimal (divide by 1e12)
  const decimal = value / 1e12

  // Format with 2 decimal places
  return `${decimal.toFixed(2)} AO`
}

export interface YieldData {
  timestamp: number
  amount: number
  processId: string
  name: string
}

/**
 * Transforms FLP yield history entries into a format suitable for plotting
 * @param entries The raw FLP yield history entries
 * @returns Array of transformed yield data points
 */
export function transformYieldData(entries: FLPYieldHistoryEntry[]): YieldData[] {
  return _(entries)
    .flatMap(entry => {
      return _(entry.projectYields || {})
        .entries()
        .filter(([processId, yield_]) => {
          // Check if this process ID exists in any FLP entry
          const isValidYield = yield_ && !isNaN(parseFloat(yield_))
          return isValidYield
        })
        .map(([processId, yield_]) => ({
          timestamp: entry.timestamp * 1000,
          amount: parseFloat(yield_),
          processId,
          name: Object.entries(FAIR_LAUNCH_PROCESSES)
            .find(([name, id]) => id === processId)?.[0] || 'Unknown'
        }))
        .value()
    })
    .orderBy(['timestamp'], ['desc'])
    .value()
}

/**
 * Transforms FLP yield history entries into a format suitable for plotting
 * Filters to only include GAME data
 * @param entries The raw FLP yield history entries
 * @returns Array of transformed yield data points
 */
export function transformGameYieldData(entries: FLPYieldHistoryEntry[]): YieldData[] {
  return _(entries)
    .flatMap(entry => {
      if (!entry.timestamp || entry.timestamp < MIN_VALID_TIMESTAMP) return []
      return _(entry.projectYields || {})
        .entries()
        .filter(([processId, yield_]) => {
          // Check if this is the GAME process ID and has a valid yield
          const isGameProcess = processId === GAME_PROCESS_ID
          const isValidYield = yield_ && !isNaN(parseFloat(yield_))
          return isGameProcess && isValidYield
        })
        .map(([processId, yield_]) => ({
          timestamp: entry.timestamp * 1000,
          amount: parseFloat(yield_),
          processId,
          name: 'GAME'
        }))
        .value()
    })
    .orderBy(['timestamp'], ['desc'])
    .value()
}

/**
 * Groups yield data by process ID
 * @param data Array of yield data points
 * @returns Record mapping process IDs to their yield data arrays
 */
export function groupDataByProcess(data: YieldData[]): Record<string, YieldData[]> {
  return _(data)
    .groupBy('processId')
    .mapValues(group =>
      _(group)
        .orderBy(['timestamp'], ['asc'])
        .filter(d => d.amount > 0)
        .value()
    )
    .value()
}

/**
 * Calculate statistics for each FLP
 */
export function calculateStats(data: YieldData[]) {
  return _(data)
    .groupBy('processId')
    .mapValues(group => ({
      min: _.minBy(group, 'amount')?.amount || 0,
      max: _.maxBy(group, 'amount')?.amount || 0,
      avg: _.meanBy(group, 'amount') || 0,
      total: _.sumBy(group, 'amount') || 0,
      count: group.length,
      latest: _.maxBy(group, 'timestamp')?.amount || 0
    }))
    .value()
}

/**
 * Calculate statistics for GAME yield data
 */
export function calculateGameStats(data: YieldData[]) {
  if (data.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      total: 0,
      count: 0,
      latest: 0
    }
  }

  return {
    min: _.minBy(data, 'amount')?.amount || 0,
    max: _.maxBy(data, 'amount')?.amount || 0,
    avg: _.meanBy(data, 'amount') || 0,
    total: _.sumBy(data, 'amount') || 0,
    count: data.length,
    latest: _.maxBy(data, 'timestamp')?.amount || 0
  }
}
