import type { FLPYieldHistoryEntry } from 'ao-js-sdk/dist/src/services/autonomous-finance/pi-data-service/abstract/responses'
import type { FairLaunchInfo } from 'ao-js-sdk/dist/src/clients/pi/fair-launch-process/types'
import type { GameTokenInfo } from './gameService'
import { 
  YieldData as GameYieldData, 
  formatAO, 
  transformGameYieldData, 
  calculateGameStats 
} from '../../../src/utils/data/flpData'
import BigNumber from 'bignumber.js'
import { TokenInfo } from 'ao-js-sdk'

// No constants needed as we're fetching real data now

/**
 * Format number as millions or billions with 2 decimal places
 * @param value The number to format
 * @returns Formatted string
 */
export function formatLargeNumber(value: number): string {
  const absValue = Math.abs(value);
  
  if (absValue >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (absValue >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  } else {
    return value.toLocaleString();
  }
}

/**
 * Format token amount using the correct denomination and decimals
 * @param amount The token amount in raw units
 * @param tokenInfo The token information
 * @returns Formatted string with token symbol
 */
export function formatTokenAmount(amount: BigNumber | number, tokenInfo: TokenInfo | null): string {
  if (!tokenInfo) {
    return 'Loading...';
  }
  
  // Convert to BigNumber if it's not already
  const amountBN = amount instanceof BigNumber ? amount : new BigNumber(amount);
  
  // Check if amount is valid
  if (amountBN.isNaN()) {
    return 'N/A';
  }
  
  try {
    // Calculate the divisor based on the token's decimals
    const divisor = new BigNumber(10).pow(tokenInfo.denomination);
    
    // Convert the raw amount to the token's decimal representation
    const convertedAmount = amountBN.dividedBy(divisor).toNumber();
    
    // Format the number based on its size
    const formattedAmount = formatLargeNumber(convertedAmount);
    
    // Return the formatted amount with the token symbol
    return `${formattedAmount}`;
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return 'Error';
  }
}

// Re-export the types and functions
export type { GameYieldData }
export { formatAO, transformGameYieldData, calculateGameStats }
