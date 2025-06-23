import { useState } from 'react'
import Plot from 'react-plotly.js'
import type { FairLaunchInfo } from 'ao-js-sdk/dist/src/clients/pi/fair-launch-process/types'
import { formatAO, calculateGameStats, type GameYieldData } from '../gameUtils'
import { colors, plotConfig, createPlotLayout } from '../gameConfig'

interface FairLaunchGraphProps {
  gameData: GameYieldData[]
  flpInfo: FairLaunchInfo | null
}

function FairLaunchGraph({ gameData, flpInfo }: FairLaunchGraphProps) {
  // Create plot data for GAME
  const plotData = gameData.length > 0 ? [
    {
      x: gameData.map(d => new Date(d.timestamp)),
      y: gameData.map(d => d.amount),
      name: 'GAME Investment Income',
      type: 'scatter',
      mode: 'lines+markers',
      line: {
        width: 3,
        shape: 'spline',
        color: colors[0],
      },
      marker: {
        size: 8,
        symbol: 'circle',
        color: colors[0],
      },
      hovertemplate: 'GAME<br>%{y:/1e12:.2f} AO<br>%{x|%Y-%m-%d}<extra></extra>',
    }
  ] : [
    {
      x: [new Date()],
      y: [0],
      name: 'GAME Investment Income',
      type: 'scatter',
      mode: 'lines+markers',
      line: {
        width: 3,
        shape: 'spline',
        color: colors[0],
      },
      marker: {
        size: 8,
        symbol: 'circle',
        color: colors[0],
      },
      hovertemplate: 'GAME<br>No data available yet<extra></extra>',
      visible: true,
    }
  ]

  const layout = createPlotLayout()
  const stats = calculateGameStats(gameData)

  return (
    <div className="fair-launch-section">
      <h2>$GAME Fair Launch Process</h2>
      <Plot
        data={plotData}
        layout={layout}
        config={{plotConfig,}}
        useResizeHandler
        className="game-plot"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Investment Income</h3>
          <div className="stat-content">
            {gameData.length === 0 ? (
              <div className="stat-row">
                <span className="no-data-message">No data available yet</span>
              </div>
            ) : (
              <>
                <div className="stat-row">
                  <span>Latest:</span>
                  <span>{formatAO(stats.latest)}</span>
                </div>
                <div className="stat-row">
                  <span>Average:</span>
                  <span>{formatAO(stats.avg)}</span>
                </div>
                <div className="stat-row">
                  <span>Total:</span>
                  <span>{formatAO(stats.total)}</span>
                </div>
                <div className="stat-row">
                  <span>Min:</span>
                  <span>{formatAO(stats.min)}</span>
                </div>
                <div className="stat-row">
                  <span>Max:</span>
                  <span>{formatAO(stats.max)}</span>
                </div>
                <div className="stat-row">
                  <span>Data Points:</span>
                  <span>{stats.count}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="stat-card">
          <h3>FLP Information</h3>
          <div className="stat-content">
            {!flpInfo ? (
              <div className="stat-row">
                <span className="no-data-message">No FLP info available yet</span>
              </div>
            ) : (
              <>
                <div className="stat-row">
                  <span>Name:</span>
                  <span>{flpInfo.flpName}</span>
                </div>
                <div className="stat-row">
                  <span>Status:</span>
                  <span>{flpInfo.status}</span>
                </div>
                <div className="stat-row">
                  <span>Token:</span>
                  <span>{flpInfo.tokenName} ({flpInfo.tokenTicker})</span>
                </div>
                <div className="stat-row">
                  <span>Started:</span>
                  <span>{new Date(parseInt(flpInfo.startsAtTimestamp) * 1000).toLocaleDateString()}</span>
                </div>
                {flpInfo.endsAtTimestamp && (
                  <div className="stat-row">
                    <span>Ends:</span>
                    <span>{new Date(parseInt(flpInfo.endsAtTimestamp) * 1000).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="stat-row">
                  <span>Distribution Tick:</span>
                  <span>{flpInfo.distributionTick} / {flpInfo.totalDistributionTicks}</span>
                </div>
                <div className="stat-row">
                  <span>Distributed:</span>
                  <span>{formatAO(parseFloat(flpInfo.distributedQuantity))}</span>
                </div>
                <div className="stat-row">
                  <span>Accumulated:</span>
                  <span>{formatAO(parseFloat(flpInfo.accumulatedQuantity))}</span>
                </div>
                <div className="stat-row">
                  <span>Withdrawn:</span>
                  <span>{formatAO(parseFloat(flpInfo.withdrawnQuantity))}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FairLaunchGraph
