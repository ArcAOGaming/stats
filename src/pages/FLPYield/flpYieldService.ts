import { PiDataService } from 'ao-js-sdk/dist/src/services/autonomous-finance/pi-data-service/PiDataService'
import type { FLPYieldHistoryEntry } from 'ao-js-sdk/dist/src/services/autonomous-finance/pi-data-service/abstract/responses'
import {  lastValueFrom } from 'rxjs'

/**
 * Fetches the latest FLP yield history data
 * @returns Promise that resolves with the latest FLP yield history entries
 */
export async function fetchFLPYieldHistory(): Promise<FLPYieldHistoryEntry[]> {
  const service = PiDataService.autoConfiguration()
  return await lastValueFrom(service.getFLPYieldHistory())
}
