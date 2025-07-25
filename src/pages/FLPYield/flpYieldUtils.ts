/* eslint-disable @typescript-eslint/no-unused-vars */
import { PROCESS_IDS } from 'ao-js-sdk'
import type { FLPYieldHistoryEntry } from 'ao-js-sdk/dist/src/services/autonomous-finance/pi-data-service/abstract/responses'
import _ from 'lodash'

export interface YieldData {
  timestamp: number
  amount: number
  processId: string
  name: string
}

// Get the FLP mapping directly from the SDK
const FAIR_LAUNCH_PROCESSES = PROCESS_IDS.AUTONOMOUS_FINANCE.FAIR_LAUNCH_PROCESSES

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
