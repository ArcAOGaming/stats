import type { FairLaunchInfo } from 'ao-js-sdk/dist/src/clients/pi/fair-launch-process/types'
import { formatTokenAmount } from '../gameUtils'
import type { GameTokenInfo } from '../gameService'
import BigNumber from 'bignumber.js'
import { TokenInfo } from 'ao-js-sdk'

interface VelocityProps {
  tokenInfo: TokenInfo | null
  flpInfo: FairLaunchInfo | null
  circulatingSupply: BigNumber
  excludedAmount: BigNumber
  excludedPercentage: number
}

function Velocity({ 
  tokenInfo, 
  flpInfo, 
  circulatingSupply, 
  excludedAmount, 
  excludedPercentage 
}: VelocityProps) {
  return (
    <div className="velocity-section">
      <h2>$GAME Velocity Metrics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>M - Total GAME In Circulation</h3>
          <div className="stat-content">
            {!tokenInfo || !flpInfo ? (
              <div className="stat-row">
                <span className="no-data-message">No circulation data available yet</span>
              </div>
            ) : (
              <>
                <div className="stat-row">
                  <span>Circulating Supply:</span>
                  <span>{formatTokenAmount(circulatingSupply, tokenInfo)}</span>
                </div>
                <div className="stat-row">
                  <span>Decay Progress:</span>
                  <span>{flpInfo.distributionTick} / {flpInfo.totalDistributionTicks}</span>
                </div>
                <div className="stat-row">
                  <span>Excluded Wallets:</span>
                  <span>2</span>
                </div>
                <div className="stat-row">
                  <span>Excluded Amount:</span>
                  <span>{formatTokenAmount(excludedAmount, tokenInfo)} ({excludedPercentage.toFixed(2)}%)</span>
                </div>
                <div className="stat-row">
                  <span className="note-text">
                    Lower circulation is better for token velocity
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Additional velocity metrics can be added here in the future */}
        <div className="stat-card">
          <h3>Velocity of Money</h3>
          <div className="stat-content">
            <div className="stat-row">
              <span className="note-text">
                The velocity of money is the frequency at which one unit of currency is used to purchase goods and services within a given time period.
              </span>
            </div>
            <div className="stat-row">
              <span className="note-text">
                In the equation MV = PQ, where:
              </span>
            </div>
            <div className="stat-row">
              <span>M = Money Supply</span>
              <span>{formatTokenAmount(circulatingSupply, tokenInfo)}</span>
            </div>
            <div className="stat-row">
              <span>V = Velocity of Money</span>
              <span>Coming soon</span>
            </div>
            <div className="stat-row">
              <span>P = Price Level</span>
              <span>Coming soon</span>
            </div>
            <div className="stat-row">
              <span>Q = Real Economic Output</span>
              <span>Coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Velocity
