import { useEffect, useState } from 'react'
import Plot from 'react-plotly.js'
import './FLPYield.css'
import { fetchFLPYieldHistory } from './flpYieldService'
import { transformYieldData, groupDataByProcess, calculateStats, formatAO, type YieldData } from './flpYieldUtils'
import { colors, plotConfig, createPlotLayout } from './flpYieldConfig'
import { MIN_VALID_TIMESTAMP } from '../../constants'
import { PROCESS_IDS } from 'ao-js-sdk'

// Get the FLP mapping directly from the SDK
const FAIR_LAUNCH_PROCESSES = PROCESS_IDS.AUTONOMOUS_FINANCE.FAIR_LAUNCH_PROCESSES

function FLPYield() {
  const [yieldData, setYieldData] = useState<YieldData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const entries = await fetchFLPYieldHistory()
      const transformedData = transformYieldData(entries)
      setYieldData(transformedData)
      setLoading(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch yield data'
      // Error is already captured in errorMessage
      setError(errorMessage)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, []) // No dependencies since fetchData is now defined inside component

  const dataByProcess = groupDataByProcess(yieldData)

  // Create plot data for each FLP
  const plotData = Object.entries(FAIR_LAUNCH_PROCESSES).map(([name, processId], index) => {
    // Ensure we have a valid color index by using modulo
    const colorIndex = index % colors.length
    const processData = (dataByProcess[processId] || [])
      .filter(d => d.amount > 0 && d.timestamp >= MIN_VALID_TIMESTAMP) // Only show positive yields
      .sort((a, b) => a.timestamp - b.timestamp)

    // Create base plot item
    const plotItem = {
      x: processData.map(d => new Date(d.timestamp)),
      y: processData.map(d => d.amount),
      name,
      type: 'scatter',
      mode: 'lines+markers',
      line: {
        width: 3,
        shape: 'spline',
        color: colors[colorIndex],
      },
      marker: {
        size: 8,
        symbol: 'circle',
        color: colors[colorIndex],
      },
      hovertemplate: `${name}<br>%{y:/1e12:.2f} AO<br>%{x|%Y-%m-%d}<extra></extra>`,
    }

    // For GAME and SMONEY, add a note in hover if no data
    if ((name === 'GAME' || name === 'SMONEY') && processData.length === 0) {
      plotItem.hovertemplate = `${name}<br>No data available yet<extra></extra>`
    }

    return plotItem
  })

  const layout = createPlotLayout()

  if (loading || error) {
    return (
      <div className="flp-yield">
        <div className="flp-yield-message">
          {loading ? (
            <>
              <div className="loading-spinner" />
              <div>Loading yield data...</div>
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

  const stats = calculateStats(yieldData)

  return (
    <div className="flp-yield">
      <div className="flp-yield-container">
        <Plot
          data={plotData}
          layout={layout}
          config={plotConfig}
          useResizeHandler
          className="flp-yield-plot"
          style={{ width: '100%', height: '100%' }}
        />
        <div className="flp-yield-stats">
          <h2>$GAME FLP Statistics</h2>
          <div className="stats-grid">
            {Object.entries(FAIR_LAUNCH_PROCESSES).map(([name, processId]) => {
              const flpStats = stats[processId] || { min: 0, max: 0, avg: 0, total: 0, count: 0, latest: 0 }
              return (
                <div key={processId} className="stat-card">
                  <h3>{name}</h3>
                  <div className="stat-content">
                    {(name === 'GAME' || name === 'SMONEY') && flpStats.count === 0 ? (
                      <div className="stat-row">
                        <span className="no-data-message">No data available yet</span>
                      </div>
                    ) : (
                      <>
                        <div className="stat-row">
                          <span>Latest:</span>
                          <span>{formatAO(flpStats.latest)}</span>
                        </div>
                        <div className="stat-row">
                          <span>Average:</span>
                          <span>{formatAO(flpStats.avg)}</span>
                        </div>
                        <div className="stat-row">
                          <span>Total:</span>
                          <span>{formatAO(flpStats.total)}</span>
                        </div>
                        <div className="stat-row">
                          <span>Min:</span>
                          <span>{formatAO(flpStats.min)}</span>
                        </div>
                        <div className="stat-row">
                          <span>Max:</span>
                          <span>{formatAO(flpStats.max)}</span>
                        </div>
                        <div className="stat-row">
                          <span>Data Points:</span>
                          <span>{flpStats.count}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FLPYield
