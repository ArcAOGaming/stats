import React, { useMemo } from 'react'
import Plot from 'react-plotly.js'
import { PROCESS_IDS } from 'ao-js-sdk'
import { colors } from '../../flpYieldConfig'
import { FLPDataProvider, useFLPDataContext } from '../../../../shared/context'
import './DelegationPieChart.css'

// Get the FLP mapping directly from the SDK
const FAIR_LAUNCH_PROCESSES = PROCESS_IDS.AUTONOMOUS_FINANCE.FAIR_LAUNCH_PROCESSES

interface DelegationData {
    name: string
    totalDelegated: number
    numDelegators: number
}

export interface YieldData {
    timestamp: number
    amount: number
    processId: string
    name: string
}

export interface DelegationPieChartProps {
    yieldData?: YieldData[]
    stats?: Record<string, { min: number, max: number, avg: number, total: number, count: number, latest: number }>
}

type ViewType = 'delegators' | 'yield'

function DelegationDataCollector({
    name,
    onDataUpdate
}: {
    name: string
    onDataUpdate: (data: DelegationData) => void
}) {
    const { mostRecentDistributions, numDelegators, loading } = useFLPDataContext()

    React.useEffect(() => {
        if (!loading) {
            const totalDelegated = mostRecentDistributions.reduce((sum, dist) => {
                return sum + parseFloat(dist.amount || '0')
            }, 0)

            onDataUpdate({
                name,
                totalDelegated,
                numDelegators: numDelegators || 0
            })
        }
    }, [mostRecentDistributions, numDelegators, loading, name, onDataUpdate])

    return null
}

function DelegationPieChartContent({ stats = {} }: { stats?: Record<string, { min: number, max: number, avg: number, total: number, count: number, latest: number }> }) {
    const [delegationData, setDelegationData] = React.useState<DelegationData[]>([])
    const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({})
    const [viewType, setViewType] = React.useState<ViewType>('delegators')

    const handleDataUpdate = React.useCallback((processId: string, data: DelegationData) => {
        setDelegationData(prev => {
            const filtered = prev.filter(item => item.name !== data.name)
            return [...filtered, data]
        })

        setLoadingStates(prev => ({
            ...prev,
            [processId]: false
        }))
    }, [])

    const isLoading = Object.values(loadingStates).some(loading => loading)
    const hasData = delegationData.length > 0
    const hasYieldData = Object.keys(stats).length > 0

    const pieData = useMemo(() => {
        if (viewType === 'delegators') {
            if (!hasData) return []

            const filteredData = delegationData.filter(item => item.numDelegators > 0)

            if (filteredData.length === 0) return []

            return [{
                type: 'pie' as const,
                labels: filteredData.map(item => item.name),
                values: filteredData.map(item => item.numDelegators),
                hovertemplate: '%{label}<br>Delegators: %{value}<br>%{percent}<extra></extra>',
                textinfo: 'label+percent',
                textposition: 'auto',
                marker: {
                    colors: colors.slice(0, filteredData.length),
                    line: {
                        color: 'rgba(255, 255, 255, 0.2)',
                        width: 2
                    }
                },
                hole: 0.4,
                showlegend: true
            }]
        } else {
            // Yield view
            if (!hasYieldData) return []

            const yieldEntries = Object.entries(FAIR_LAUNCH_PROCESSES).map(([name, processId]) => {
                const processStats = stats[processId]
                return {
                    name,
                    processId,
                    latest: processStats?.latest || 0
                }
            }).filter(item => item.latest > 0)

            if (yieldEntries.length === 0) return []

            return [{
                type: 'pie' as const,
                labels: yieldEntries.map(item => item.name),
                values: yieldEntries.map(item => item.latest),
                hovertemplate: '%{label}<br>Latest Yield: %{value:/1e12:.2f} AO<br>%{percent}<extra></extra>',
                textinfo: 'label+percent',
                textposition: 'auto',
                marker: {
                    colors: colors.slice(0, yieldEntries.length),
                    line: {
                        color: 'rgba(255, 255, 255, 0.2)',
                        width: 2
                    }
                },
                hole: 0.4,
                showlegend: true
            }]
        }
    }, [delegationData, hasData, hasYieldData, stats, viewType])

    const getTitle = () => {
        if (viewType === 'delegators') {
            return 'Delegation Distribution by Delegator Count'
        }
        return 'Delegation Distribution by Latest AO Yield'
    }

    const layout = {
        title: {
            text: getTitle(),
            font: {
                size: 20,
                family: 'Inter, system-ui, sans-serif',
                color: 'var(--color-text)'
            },
            y: 0.95
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            color: 'var(--color-text)',
            family: 'Inter, system-ui, sans-serif'
        },
        showlegend: true,
        legend: {
            orientation: 'v' as const,
            yanchor: 'middle',
            y: 0.5,
            xanchor: 'left',
            x: 1.05,
            font: {
                size: 12,
                color: 'var(--color-text)'
            },
            bgcolor: 'rgba(0,0,0,0)',
            borderwidth: 0
        },
        margin: {
            l: 50,
            r: 150,
            t: 80,
            b: 50
        },
        autosize: true
    }

    const config = {
        responsive: true,
        displayModeBar: false,
        scrollZoom: false
    }

    React.useEffect(() => {
        // Initialize loading states
        const initialStates: Record<string, boolean> = {}
        Object.keys(FAIR_LAUNCH_PROCESSES).forEach(name => {
            initialStates[FAIR_LAUNCH_PROCESSES[name as keyof typeof FAIR_LAUNCH_PROCESSES]] = true
        })
        setLoadingStates(initialStates)
    }, [])

    const shouldShowData = () => {
        if (viewType === 'delegators') {
            return hasData && pieData.length > 0
        }
        return hasYieldData && pieData.length > 0
    }

    const shouldShowLoading = () => {
        if (viewType === 'delegators') {
            return isLoading
        }
        return false // Yield data is loaded by parent component
    }

    return (
        <div className="delegation-pie-chart">
            {/* View selector dropdown */}
            <div className="view-selector">
                <label htmlFor="view-type-select">View:</label>
                <select
                    id="view-type-select"
                    value={viewType}
                    onChange={(e) => setViewType(e.target.value as ViewType)}
                    className="view-dropdown"
                >
                    <option value="delegators">Delegator Count</option>
                    <option value="yield">Latest AO Yield</option>
                </select>
            </div>

            {/* Data collectors for each FLP process (only for delegators view) */}
            {viewType === 'delegators' && Object.entries(FAIR_LAUNCH_PROCESSES).map(([name, processId]) => (
                <FLPDataProvider key={processId} processId={processId}>
                    <DelegationDataCollector
                        name={name}
                        onDataUpdate={(data) => handleDataUpdate(processId, data)}
                    />
                </FLPDataProvider>
            ))}

            {shouldShowLoading() ? (
                <div className="delegation-pie-loading">
                    <div className="loading-spinner" />
                    <div>Loading delegation data...</div>
                </div>
            ) : !shouldShowData() ? (
                <div className="delegation-pie-no-data">
                    <div>No {viewType === 'delegators' ? 'delegation' : 'yield'} data available</div>
                </div>
            ) : (
                <Plot
                    data={pieData}
                    layout={layout}
                    config={config}
                    useResizeHandler
                    className="delegation-pie-plot"
                />
            )}
        </div>
    )
}

const DelegationPieChart: React.FC<DelegationPieChartProps> = (props) => {
    return <DelegationPieChartContent stats={props.stats} />
}

export default DelegationPieChart