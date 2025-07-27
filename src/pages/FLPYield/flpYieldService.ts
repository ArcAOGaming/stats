import { PiDataService } from 'ao-js-sdk/dist/src/services/autonomous-finance/pi-data-service/PiDataService'
import type { FLPYieldHistoryEntry } from 'ao-js-sdk/dist/src/services/autonomous-finance/pi-data-service/abstract/responses'
import { firstValueFrom } from 'rxjs'
import { scan, takeLast } from 'rxjs/operators'

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
