import type { FLPYieldHistoryEntry } from 'ao-js-sdk/dist/src/services/autonomous-finance/pi-data-service/abstract/responses'
import { fetchFLPYieldHistory } from '../../../src/utils/data/flpData'
import { GameFLP } from 'ao-js-sdk/dist/src/clients/pi/fair-launch-process/flps'
import { GameToken, TokenInfo } from 'ao-js-sdk'
import type { FairLaunchInfo } from 'ao-js-sdk/dist/src/clients/pi/fair-launch-process/types'
import { Logger, LogLevel } from 'ao-js-sdk'
import BigNumber from 'bignumber.js'
export type DryRunResult = {
    Output: any;
    Messages: any[];
    Spawns: any[];
    Error?: any;
};
// Wallet addresses to exclude from circulation calculation
const EXCLUDED_WALLETS = [
  'nYHhoSEtelyL3nQ6_CFoOVnZfnz2VHK-nEez962YMm8',
  'N90q65iT59dCo01-gtZRUlLMX0w6_ylFHv2uHaSUFNk'
];

// Interface for token balance data
export interface TokenBalanceData {
  address: string;
  balance: BigNumber;
}

// Interface for token info
export interface GameTokenInfo {
  totalSupply: string;
  balances?: Record<string, string>;
  name: string;
  symbol: string;
  decimals: number;
}

/**
 * Fetches the latest FLP yield history data for GAME
 * @returns Promise that resolves with the latest FLP yield history entries
 */
export async function fetchGameYieldHistory(): Promise<FLPYieldHistoryEntry[]> {
  const aoYield = await fetchFLPYieldHistory()
  return aoYield 
}

/**
 * Fetches information about the GAME Fair Launch Process
 * @returns Promise that resolves with the FLP info
 */
export async function fetchGameFLPInfo(): Promise<FairLaunchInfo> {
  return await GameFLP.getInfo()
}

/**
 * Fetches information about the GAME token including total supply
 * @returns Promise that resolves with the token info
 */
export async function fetchGameTokenInfo(): Promise<TokenInfo> {
    return await GameToken.getInfo();
}

export async function fetchBalances(): Promise<DryRunResult> {
    return await GameToken.balances();
}

/**
 * Fetches all token holder balances for GAME
 * @returns Promise that resolves with an array of token balances
 */
export async function fetchGameBalances(): Promise<TokenBalanceData[]> {
  try {
    // Get token info which includes balances
    const balances = await fetchBalances()
    
    
  // Parse the JSON string in balances.Messages[0].Data
  const balancesData = JSON.parse(balances.Messages[0].Data);
  console.log(balancesData)
  const tokenbalancesheet: TokenBalanceData[] = Object.entries(balancesData).map(([address, balance]) => ({
    address,
    balance: new BigNumber(balance as string)
  }));
  console.log(tokenbalancesheet)
  // Transform the balances into our TokenBalanceData format
  return tokenbalancesheet
  } catch (error) {
    console.error('Error fetching GAME balances:', error);
    throw error;
  }
}

/**
 * Calculates the circulating supply of GAME tokens
 * Uses the total supply from token info and subtracts amounts in excluded wallets
 * @returns Promise that resolves with the circulating supply
 */
export async function fetchGameCirculatingSupply(): Promise<BigNumber> {
  try {
    // Get token info which includes total supply
    const tokenInfo = await fetchGameTokenInfo();
    const totalSupply = new BigNumber(tokenInfo.totalSupply);

    // Get all balances
    const balances = await fetchGameBalances();
    
    // If no balances were returned, return the total supply
    if (balances.length === 0) {
      console.warn('No balances returned, using total supply as circulating supply');
      return totalSupply;
    }
    
    // Calculate the sum of balances in excluded wallets
    const excludedAmount = balances
      .filter(item => EXCLUDED_WALLETS.includes(item.address))
      .reduce((sum, item) => sum.plus(item.balance), new BigNumber(0));
    
    // Calculate circulating supply
    const circulatingSupply = totalSupply.minus(excludedAmount);
    console.log(circulatingSupply)
    return circulatingSupply;
  } catch (error) {
    console.error('Error calculating GAME circulating supply:', error);
    // Return a default value in case of error
    return new BigNumber(0);
  }
}

/**
 * Gets the total amount of tokens in excluded wallets
 * @returns Promise that resolves with the excluded amount and percentage
 */
export async function fetchExcludedAmount(): Promise<{amount: BigNumber, percentage: number}> {
  try {
    const tokenInfo = await fetchGameTokenInfo();
    const totalSupply = new BigNumber(tokenInfo.totalSupply);
    
    // Get all balances
    const balances = await fetchGameBalances();
    
    // If no balances were returned, return zero for excluded amount
    if (balances.length === 0) {
      console.warn('No balances returned, returning zero for excluded amount');
      return {
        amount: new BigNumber(0),
        percentage: 0
      };
    }
    
    // Calculate the sum of balances in excluded wallets
    const excludedAmount = balances
      .filter(item => EXCLUDED_WALLETS.includes(item.address))
      .reduce((sum, item) => sum.plus(item.balance), new BigNumber(0));
    
    // Calculate percentage
    const percentage = excludedAmount.dividedBy(totalSupply).multipliedBy(100).toNumber();
    
    return {
      amount: excludedAmount,
      percentage
    };
  } catch (error) {
    console.error('Error calculating excluded amount:', error);
    // Return default values in case of error
    return {
      amount: new BigNumber(0),
      percentage: 0
    };
  }
}
