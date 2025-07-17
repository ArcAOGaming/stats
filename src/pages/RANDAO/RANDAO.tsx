import { useEffect, useState, useRef } from 'react'
import Plot from 'react-plotly.js'
import './RANDAO.css'
import {
    RANDAOService,
    RANDAODataPoint,
    AggregatedRANDAOData,
    RANDAOStats,
    transformCreditNoticeToDataPoint,
    aggregateDataByTime,
    calculateRANDAOStats,
    formatQuantity,
    formatTimestamp
} from '../../utils/randao'
import { Subscription } from 'rxjs'

function RANDAO() {
    const [dataPoints, setDataPoints] = useState<RANDAODataPoint[]>([])
    const [aggregatedData, setAggregatedData] = useState<AggregatedRANDAOData[]>([])
    const [stats, setStats] = useState<RANDAOStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const subscriptionRef = useRef<Subscription | null>(null)

    useEffect(() => {
        const startStream = () => {
            try {
                setLoading(true)
                setError(null)

                // Subscribe to real-time RNG faucet sales stream
                subscriptionRef.current = RANDAOService.getRNGFaucetSalesStream().subscribe({
                    next: (creditNotice) => {
                        const dataPoint = transformCreditNoticeToDataPoint(creditNotice)
                        if (dataPoint) {
                            setDataPoints(prev => {
                                // Avoid duplicates
                                const exists = prev.some(p => p.id === dataPoint.id)
                                if (exists) return prev

                                const newData = [...prev, dataPoint].sort((a, b) => a.timestamp - b.timestamp)
                                return newData
                            })
                        }
                        setIsConnected(true)
                        setLoading(false)
                    },
                    error: (err) => {
                        console.error('RANDAO stream error:', err)
                        setError('Failed to connect to RANDAO data stream')
                        setIsConnected(false)
                        setLoading(false)
                    },
                    complete: () => {
                        setIsConnected(false)
                        setLoading(false)
                    }
                })
            } catch (err) {
                console.error('Failed to start RANDAO stream:', err)
                setError('Failed to initialize RANDAO data stream')
                setLoading(false)
            }
        }

        startStream()

        // Cleanup subscription on unmount
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe()
            }
        }
    }, [])

    // Update aggregated data and stats when dataPoints change
    useEffect(() => {
        if (dataPoints.length > 0) {
            const aggregated = aggregateDataByTime(dataPoints, 3600000) // 1 hour intervals
            setAggregatedData(aggregated)
            setStats(calculateRANDAOStats(dataPoints))
        }
    }, [dataPoints])

    const retryConnection = () => {
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe()
        }
        setDataPoints([])
        setAggregatedData([])
        setStats(null)
        setError(null)
        setLoading(true)

        // Restart the stream
        const startStream = () => {
            try {
                subscriptionRef.current = RANDAOService.getRNGFaucetSalesStream().subscribe({
                    next: (creditNotice) => {
                        const dataPoint = transformCreditNoticeToDataPoint(creditNotice)
                        if (dataPoint) {
                            setDataPoints(prev => {
                                const exists = prev.some(p => p.id === dataPoint.id)
                                if (exists) return prev

                                const newData = [...prev, dataPoint].sort((a, b) => a.timestamp - b.timestamp)
                                return newData
                            })
                        }
                        setIsConnected(true)
                        setLoading(false)
                    },
                    error: (err) => {
                        console.error('RANDAO stream error:', err)
                        setError('Failed to connect to RANDAO data stream')
                        setIsConnected(false)
                        setLoading(false)
                    },
                    complete: () => {
                        setIsConnected(false)
                        setLoading(false)
                    }
                })
            } catch (err) {
                console.error('Failed to start RANDAO stream:', err)
                setError('Failed to initialize RANDAO data stream')
                setLoading(false)
            }
        }

        startStream()
    }

    // Create plot data
    const plotData = aggregatedData.length > 0 ? [{
        x: aggregatedData.map(d => new Date(d.timestamp)),
        y: aggregatedData.map(d => d.cumulativeQuantity),
        name: 'Cumulative RNG Sales',
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        line: {
            width: 3,
            shape: 'spline' as const,
            color: '#4a9eff',
        },
        marker: {
            size: 8,
            symbol: 'circle' as const,
            color: '#4a9eff',
        },
        hovertemplate: `%{y} total quantity<br>%{x|%Y-%m-%d %H:%M}<extra></extra>`,
    }] : []

    const layout = {
        title: {
            text: 'RANDAO RNG Faucet Sales Over Time',
            font: { color: '#4a9eff', size: 20 }
        },
        xaxis: {
            title: 'Time',
            color: 'rgba(255, 255, 255, 0.7)',
            gridcolor: 'rgba(255, 255, 255, 0.1)',
            type: 'date' as const
        },
        yaxis: {
            title: 'Cumulative Quantity',
            color: 'rgba(255, 255, 255, 0.7)',
            gridcolor: 'rgba(255, 255, 255, 0.1)',
        },
        plot_bgcolor: 'transparent',
        paper_bgcolor: 'transparent',
        font: { color: 'rgba(255, 255, 255, 0.95)' },
        margin: { t: 80, r: 40, b: 60, l: 80 },
        showlegend: false,
        autosize: true
    }

    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false,
    }

    if (loading && dataPoints.length === 0) {
        return (
            <div className="randao-message">
                <div className="loading-spinner" />
                <div>Connecting to RANDAO data stream...</div>
            </div>
        )
    }

    if (error && dataPoints.length === 0) {
        return (
            <div className="randao-message">
                <div className="error-message">
                    {error}
                    <button onClick={retryConnection} className="retry-button">
                        Retry Connection
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="randao">
            <div className="randao-container">
                <div className="randao-header">
                    <h1>RANDAO RNG Faucet Sales</h1>
                    <p>Real-time visualization of RNG faucet sales data from the AO network</p>
                    {isConnected && (
                        <div className="real-time-indicator">
                            <div className="real-time-dot"></div>
                            <span>Live Data Stream</span>
                        </div>
                    )}
                </div>

                <div className="randao-plot">
                    <Plot
                        data={plotData}
                        layout={layout}
                        config={config}
                        useResizeHandler
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>

                {stats && (
                    <div className="randao-stats">
                        <h2>RANDAO Statistics</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Quantity</h3>
                                <div className="stat-row">
                                    <span>Amount:</span>
                                    <span>{formatQuantity(stats.totalQuantity)}</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <h3>Transactions</h3>
                                <div className="stat-row">
                                    <span>Total:</span>
                                    <span>{stats.totalTransactions}</span>
                                </div>
                                <div className="stat-row">
                                    <span>Average:</span>
                                    <span>{formatQuantity(stats.averageQuantity)}</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <h3>Range</h3>
                                <div className="stat-row">
                                    <span>Min:</span>
                                    <span>{formatQuantity(stats.minQuantity)}</span>
                                </div>
                                <div className="stat-row">
                                    <span>Max:</span>
                                    <span>{formatQuantity(stats.maxQuantity)}</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <h3>Latest</h3>
                                <div className="stat-row">
                                    <span>Quantity:</span>
                                    <span>{formatQuantity(stats.latestQuantity)}</span>
                                </div>
                                {stats.latestTimestamp && (
                                    <div className="stat-row">
                                        <span>Time:</span>
                                        <span>{formatTimestamp(stats.latestTimestamp)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="stat-card">
                                <h3>Revenue Projections</h3>
                                <div className="stat-row">
                                    <span>MRR:</span>
                                    <span>{stats.mrr.toFixed(2)} AO</span>
                                </div>
                                <div className="stat-row">
                                    <span>ARR:</span>
                                    <span>{stats.arr.toFixed(2)} AO</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RANDAO
