import { useEffect, useState } from 'react'
import './Game.css'
import { 
  fetchGameYieldHistory, 
  fetchGameFLPInfo, 
  fetchGameCirculatingSupply,
  fetchExcludedAmount,
  fetchGameTokenInfo,
  type GameTokenInfo
} from './gameService'
import { transformGameYieldData, type GameYieldData } from './gameUtils'
import type { FairLaunchInfo } from 'ao-js-sdk/dist/src/clients/pi/fair-launch-process/types'
import { FairLaunchGraph, Velocity } from './components'
import BigNumber from 'bignumber.js'
import { TokenInfo } from 'ao-js-sdk'

function Game() {
  const [gameData, setGameData] = useState<GameYieldData[]>([])
  const [flpInfo, setFlpInfo] = useState<FairLaunchInfo | null>(null)
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [circulatingSupply, setCirculatingSupply] = useState<BigNumber>(new BigNumber(0))
  const [excludedAmount, setExcludedAmount] = useState<BigNumber>(new BigNumber(0))
  const [excludedPercentage, setExcludedPercentage] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      // Fetch yield history, FLP info, token info, circulating supply, and excluded amount in parallel
      const [entries, info, token, supply, excluded] = await Promise.all([
        fetchGameYieldHistory(),
        fetchGameFLPInfo(),
        fetchGameTokenInfo(),
        fetchGameCirculatingSupply(),
        fetchExcludedAmount()
      ])
      
      const transformedData = transformGameYieldData(entries)
      setGameData(transformedData)
      setFlpInfo(info)
      setTokenInfo(token)
      setCirculatingSupply(supply)
      setExcludedAmount(excluded.amount)
      setExcludedPercentage(excluded.percentage)
      setLoading(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch GAME data'
      setError(errorMessage)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading || error) {
    return (
      <div className="game">
        <div className="game-message">
          {loading ? (
            <>
              <div className="loading-spinner" />
              <div>Loading GAME data...</div>
            </>
          ) : (
            <div className="error-message">
              {error}
              <button 
                onClick={() => {
                  setError(null)
                  setLoading(true)
                  fetchData()
                }}
                className="retry-button"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="game">
      <div className="game-container">
        <FairLaunchGraph 
          gameData={gameData}
          flpInfo={flpInfo}
        />
        
        <Velocity
          tokenInfo={tokenInfo}
          flpInfo={flpInfo}
          circulatingSupply={circulatingSupply}
          excludedAmount={excludedAmount}
          excludedPercentage={excludedPercentage}
        />
      </div>
    </div>
  )
}

export default Game
