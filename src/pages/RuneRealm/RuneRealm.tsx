import { useState } from 'react'
import Plot from 'react-plotly.js'
import { PurchaseOption } from 'ao-js-sdk'
import './RuneRealm.css'
import { useRuneRealmContext } from '../../context/RuneRealmContext'
import {
    formatQuantity,
    formatTimestamp,
    getPurchaseOptionDisplayName
} from './runeRealmService'

type GraphType = 'aggregate' | 'monthly'

interface MonthlyData {
    month: string
    quantity: number
    count: number
}

function RuneRealm() {
    const {
        dataPointsByOption,
        aggregatedDataByOption,
        statsByOption,
        loading,
        error,
        isConnected,
        retryConnection
    } = useRuneRealmContext()

    const [selectedGraph, setSelectedGraph] = useState<GraphType>('aggregate')
    const [selectedOption, setSelectedOption] = useState<PurchaseOption>(PurchaseOption.AO)

    // Get available purchase options that have data
    const availableOptions = Array.from(dataPointsByOption.keys())

    // Aggregate data by month for selected option
    const aggregateDataByMonth = (option: PurchaseOption): MonthlyData[] => {
        const dataPoints = dataPointsByOption.get(option) || []
        if (dataPoints.length === 0) return []

        const monthlyMap = new Map<string, { quantity: number; count: number }>()

        for (const point of dataPoints) {
            const date = new Date(point.timestamp)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

            if (!monthlyMap.has(monthKey)) {
                monthlyMap.set(monthKey, { quantity: 0, count: 0 })
            }

            const current = monthlyMap.get(monthKey)!
            current.quantity += point.quantity
            current.count += 1
        }

        return Array.from(monthlyMap.entries())
            .map(([month, data]) => ({
                month,
                quantity: data.quantity,
                count: data.count
            }))
            .sort((a, b) => a.month.localeCompare(b.month))
    }

    // Create plot data based on selected graph type and option
    const getPlotData = () => {
        if (selectedGraph === 'aggregate') {
            const aggregatedData = aggregatedDataByOption.get(selectedOption) || []
            if (aggregatedData.length > 0) {
                return [{
                    x: aggregatedData.map(d => new Date(d.timestamp)),
                    y: aggregatedData.map(d => d.cumulativeQuantity),
                    name: `Cumulative ${getPurchaseOptionDisplayName(selectedOption)} Sales`,
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
                }]
            }
        } else if (selectedGraph === 'monthly') {
            const monthlyData = aggregateDataByMonth(selectedOption)
            if (monthlyData.length > 0) {
                return [{
                    x: monthlyData.map(d => d.month),
                    y: monthlyData.map(d => d.count),
                    name: `Monthly ${getPurchaseOptionDisplayName(selectedOption)} Sales`,
                    type: 'bar' as const,
                    marker: {
                        color: '#4a9eff',
                        opacity: 0.8,
                    },
                    customdata: monthlyData.map(d => d.quantity),
                    hovertemplate: `%{y} transactions<br>%{x}<br>Total Quantity: %{customdata}<extra></extra>`,
                }]
            }
        }
        return []
    }

    const getLayout = () => {
        const baseLayout = {
            plot_bgcolor: 'transparent',
            paper_bgcolor: 'transparent',
            font: { color: 'rgba(255, 255, 255, 0.95)' },
            margin: { t: 80, r: 40, b: 60, l: 80 },
            showlegend: false,
            autosize: true,
            xaxis: {
                color: 'rgba(255, 255, 255, 0.7)',
                gridcolor: 'rgba(255, 255, 255, 0.1)',
            },
            yaxis: {
                color: 'rgba(255, 255, 255, 0.7)',
                gridcolor: 'rgba(255, 255, 255, 0.1)',
            }
        }

        const optionName = getPurchaseOptionDisplayName(selectedOption)

        if (selectedGraph === 'aggregate') {
            return {
                ...baseLayout,
                title: {
                    text: `${optionName} Aggregate Sales Over Time`,
                    font: { color: '#4a9eff', size: 20 }
                },
                xaxis: {
                    ...baseLayout.xaxis,
                    title: 'Time',
                    type: 'date' as const
                },
                yaxis: {
                    ...baseLayout.yaxis,
                    title: 'Cumulative Quantity',
                }
            }
        } else {
            return {
                ...baseLayout,
                title: {
                    text: `${optionName} Monthly Sales`,
                    font: { color: '#4a9eff', size: 20 }
                },
                xaxis: {
                    ...baseLayout.xaxis,
                    title: 'Month',
                    type: 'category' as const
                },
                yaxis: {
                    ...baseLayout.yaxis,
                    title: 'Number of Transactions',
                }
            }
        }
    }

    const plotData = getPlotData()
    const layout = getLayout()
    const stats = statsByOption.get(selectedOption)

    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false,
    }

    if (loading && availableOptions.length === 0) {
        return (
            <div className="rune-realm-message">
                <div className="loading-spinner" />
                <div>Connecting to RuneRealm data streams...</div>
            </div>
        )
    }

    if (error && availableOptions.length === 0) {
        return (
            <div className="rune-realm-message">
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
        <div className="rune-realm">
            <div className="rune-realm-container">
                <div className="rune-realm-header">
                    <h1>RuneRealm Eternal Pass Sales</h1>
                    <p className="rune-realm-description">
                        Real-time visualization of eternal pass purchase data from the AO network
                    </p>
                    {isConnected && (
                        <div className="real-time-indicator">
                            <div className="real-time-dot"></div>
                            <span>Live Data Stream</span>
                        </div>
                    )}
                </div>

                <div className="graph-controls">
                    <div className="graph-selector">
                        <label htmlFor="purchase-option">Purchase Option:</label>
                        <select
                            id="purchase-option"
                            value={selectedOption}
                            onChange={(e) => setSelectedOption(Number(e.target.value) as PurchaseOption)}
                            className="graph-dropdown"
                        >
                            {availableOptions.map(option => (
                                <option key={option} value={option}>
                                    {getPurchaseOptionDisplayName(option)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="graph-selector">
                        <label htmlFor="graph-type">Graph Type:</label>
                        <select
                            id="graph-type"
                            value={selectedGraph}
                            onChange={(e) => setSelectedGraph(e.target.value as GraphType)}
                            className="graph-dropdown"
                        >
                            <option value="aggregate">Aggregate Sales Over Time</option>
                            <option value="monthly">Monthly Sales</option>
                        </select>
                    </div>
                </div>

                <div className="rune-realm-plot">
                    <Plot
                        data={plotData}
                        layout={layout}
                        config={config}
                        useResizeHandler
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>

                {stats && (
                    <div className="rune-realm-stats">
                        <h2>{getPurchaseOptionDisplayName(selectedOption)} Statistics</h2>
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
                                    <span>{stats.mrr.toFixed(2)} {getPurchaseOptionDisplayName(selectedOption)}</span>
                                </div>
                                <div className="stat-row">
                                    <span>ARR:</span>
                                    <span>{stats.arr.toFixed(2)} {getPurchaseOptionDisplayName(selectedOption)}</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <h3>Clients</h3>
                                <div className="stat-row">
                                    <span>Unique:</span>
                                    <span>{stats.uniqueClients}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RuneRealm
