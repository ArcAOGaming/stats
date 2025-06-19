import { useEffect, useState } from 'react'
import Plot from 'react-plotly.js'
import './Game.css'
import { fetchGameYieldHistory } from './gameService'
import { transformGameYieldData, calculateGameStats, formatAO, type GameYieldData } from './gameUtils'
import { colors, plotConfig, createPlotLayout } from './gameConfig'

function Game() {
  const [gameData, setGameData] = useState<GameYieldData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const entries = await fetchGameYieldHistory()
      const transformedData = transformGameYieldData(entries)
      setGameData(transformedData)
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

  const stats = calculateGameStats(gameData)

  return (
    <div className="game">
      <div className="game-container">
        <Plot
          data={plotData}
          layout={layout}
          config={{plotConfig,}}
          useResizeHandler
          className="game-plot"
          style={{ width: '100%', height: '100%' }}

        />
        <div className="game-stats">
          <h2>$GAME Statistics</h2>
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default Game
