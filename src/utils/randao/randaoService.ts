import { RNGDataService } from 'ao-js-sdk'
import { CreditNotice } from 'ao-js-sdk/src/services/credit-notices/abstract/types'
import { Observable } from 'rxjs'

/**
 * Service for fetching RANDAO RNG faucet sales data
 */
export class RANDAOService {
    private static rngDataService = RNGDataService.autoConfiguration()

    /**
     * Get real-time stream of RNG faucet sales data
     * @returns Observable stream of credit notices
     */
    public static getRNGFaucetSalesStream(): Observable<CreditNotice> {
        return this.rngDataService.getRNGFaucetSales()
    }
}
