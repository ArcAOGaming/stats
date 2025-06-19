import type { FLPYieldHistoryEntry } from 'ao-js-sdk/dist/src/services/autonomous-finance/pi-data-service/abstract/responses'
import { fetchFLPYieldHistory } from '../../../src/utils/data/flpData'

/**
 * Fetches the latest FLP yield history data for GAME
 * @returns Promise that resolves with the latest FLP yield history entries
 */
export async function fetchGameYieldHistory(): Promise<FLPYieldHistoryEntry[]> {
  return await fetchFLPYieldHistory()
}
